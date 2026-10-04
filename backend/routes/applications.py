from flask import Blueprint, request, jsonify
from database import get_db
from routes.auth import token_required
from matching_engine import calculate_match

applications_bp = Blueprint('applications', __name__)

@applications_bp.route('', methods=['POST'])
@token_required
def apply_to_job(current_user):
    if current_user.get('role') != 'student':
        return jsonify({'success': False, 'message': 'Only students can apply to jobs'}), 403

    data = request.get_json() or {}
    job_id = data.get('job_id')
    if not job_id:
        return jsonify({'success': False, 'message': 'job_id is required'}), 400

    db = get_db()
    try:
        with db.cursor() as cursor:
            # Check student profile
            cursor.execute("SELECT id FROM student_profiles WHERE user_id = %s", (current_user['id'],))
            student = cursor.fetchone()
            if not student:
                return jsonify({'success': False, 'message': 'Please complete your student profile before applying'}), 400
            student_id = student['id']

            # Check job exists
            cursor.execute("SELECT id, title, company FROM jobs WHERE id = %s", (job_id,))
            job = cursor.fetchone()
            if not job:
                return jsonify({'success': False, 'message': 'Job not found'}), 404

            # Check existing application
            cursor.execute("SELECT id, status, applied_at FROM applications WHERE student_id = %s AND job_id = %s", 
                           (student_id, job_id))
            existing = cursor.fetchone()
            if existing:
                return jsonify({
                    'success': False, 
                    'message': f"You have already applied for this job (Status: {existing['status']})."
                }), 409

            cursor.execute("""
                INSERT INTO applications (student_id, job_id, status)
                VALUES (%s, %s, 'Applied')
            """, (student_id, job_id))
            app_id = cursor.lastrowid

            return jsonify({
                'success': True,
                'message': f"Application submitted successfully for {job['title']} at {job['company']}!",
                'application_id': app_id,
                'status': 'Applied'
            }), 201
    finally:
        db.close()

@applications_bp.route('', methods=['GET'])
@token_required
def get_applications(current_user):
    status_filter = request.args.get('status', '').strip()
    db = get_db()
    try:
        with db.cursor() as cursor:
            if current_user.get('role') == 'admin':
                # Admin views all applications
                query = """
                    SELECT a.id, a.student_id, a.job_id, a.status, a.applied_at, a.updated_at,
                           u.name as student_name, u.email as student_email,
                           sp.branch, sp.cgpa, sp.graduation_year,
                           j.title as job_title, j.company as job_company, j.location as job_location,
                           j.job_type, j.minimum_cgpa
                    FROM applications a
                    JOIN student_profiles sp ON a.student_id = sp.id
                    JOIN users u ON sp.user_id = u.id
                    JOIN jobs j ON a.job_id = j.id
                    WHERE 1=1
                """
                params = []
                if status_filter:
                    query += " AND a.status = %s"
                    params.append(status_filter)

                query += " ORDER BY a.applied_at DESC"
                cursor.execute(query, tuple(params))
                apps = cursor.fetchall()
                for app in apps:
                    app['cgpa'] = float(app['cgpa']) if app['cgpa'] is not None else 0.0
                    app['minimum_cgpa'] = float(app['minimum_cgpa']) if app['minimum_cgpa'] is not None else 0.0

                return jsonify({'success': True, 'count': len(apps), 'applications': apps}), 200

            else:
                # Student views their own applications
                cursor.execute("SELECT id FROM student_profiles WHERE user_id = %s", (current_user['id'],))
                student = cursor.fetchone()
                if not student:
                    return jsonify({'success': True, 'applications': []}), 200

                student_id = student['id']

                # Also get student skills for match score
                cursor.execute("SELECT * FROM student_profiles WHERE id = %s", (student_id,))
                full_student = cursor.fetchone()
                full_student['cgpa'] = float(full_student['cgpa']) if full_student['cgpa'] is not None else 0.0
                cursor.execute("""
                    SELECT s.name 
                    FROM student_skills ss
                    JOIN skills s ON ss.skill_id = s.id
                    WHERE ss.student_id = %s
                """, (student_id,))
                full_student['skills'] = [r['name'] for r in cursor.fetchall()]

                query = """
                    SELECT a.id, a.job_id, a.status, a.applied_at, a.updated_at,
                           j.title, j.company, j.location, j.job_type, j.salary_range,
                           j.minimum_cgpa, j.graduation_year, j.eligible_branches, j.experience_required,
                           j.description
                    FROM applications a
                    JOIN jobs j ON a.job_id = j.id
                    WHERE a.student_id = %s
                """
                params = [student_id]
                if status_filter:
                    query += " AND a.status = %s"
                    params.append(status_filter)

                query += " ORDER BY a.applied_at DESC"
                cursor.execute(query, tuple(params))
                apps = cursor.fetchall()

                for app in apps:
                    app['minimum_cgpa'] = float(app['minimum_cgpa']) if app['minimum_cgpa'] is not None else 0.0
                    # Skills for this job
                    cursor.execute("""
                        SELECT s.name 
                        FROM job_skills js
                        JOIN skills s ON js.skill_id = s.id
                        WHERE js.job_id = %s
                    """, (app['job_id'],))
                    app['required_skills'] = [r['name'] for r in cursor.fetchall()]

                    # Calculate match score
                    match_result = calculate_match(full_student, app)
                    app['match_score'] = match_result['total_score']
                    app['match_breakdown'] = match_result['breakdown']
                    app['match_explanation'] = match_result['explanation']

                return jsonify({'success': True, 'count': len(apps), 'applications': apps}), 200
    finally:
        db.close()

@applications_bp.route('/<int:app_id>', methods=['PUT'])
@token_required
def update_application(current_user, app_id):
    data = request.get_json() or {}
    new_status = (data.get('status') or '').strip()
    valid_statuses = ['Applied', 'Under Review', 'Interviewing', 'Accepted', 'Rejected']

    if new_status not in valid_statuses:
        return jsonify({'success': False, 'message': f'Status must be one of: {", ".join(valid_statuses)}'}), 400

    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute("SELECT * FROM applications WHERE id = %s", (app_id,))
            app = cursor.fetchone()
            if not app:
                return jsonify({'success': False, 'message': 'Application not found'}), 404

            # Admins can update any status; students can only withdraw or view
            if current_user.get('role') != 'admin':
                return jsonify({'success': False, 'message': 'Only administrators can update application status'}), 403

            cursor.execute("UPDATE applications SET status = %s WHERE id = %s", (new_status, app_id))
            return jsonify({
                'success': True,
                'message': f"Application status updated to '{new_status}' successfully",
                'status': new_status
            }), 200
    finally:
        db.close()

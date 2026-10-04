from flask import Blueprint, request, jsonify
from database import get_db
from routes.auth import admin_required

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/statistics', methods=['GET'])
@admin_required
def get_admin_statistics(current_user):
    db = get_db()
    try:
        with db.cursor() as cursor:
            # 1. Total students
            cursor.execute("SELECT COUNT(*) as count FROM users WHERE role = 'student'")
            total_students = cursor.fetchone()['count']

            # 2. Total jobs
            cursor.execute("SELECT COUNT(*) as count FROM jobs")
            total_jobs = cursor.fetchone()['count']

            # 3. Total applications
            cursor.execute("SELECT COUNT(*) as count FROM applications")
            total_applications = cursor.fetchone()['count']

            # 4. Applications by status
            cursor.execute("""
                SELECT status, COUNT(*) as count 
                FROM applications 
                GROUP BY status
            """)
            apps_by_status = {row['status']: row['count'] for row in cursor.fetchall()}
            for st in ['Applied', 'Under Review', 'Interviewing', 'Accepted', 'Rejected']:
                if st not in apps_by_status:
                    apps_by_status[st] = 0

            # 5. Most requested skills in jobs
            cursor.execute("""
                SELECT s.name, COUNT(js.job_id) as demand_count
                FROM skills s
                JOIN job_skills js ON s.id = js.skill_id
                GROUP BY s.id, s.name
                ORDER BY demand_count DESC
                LIMIT 10
            """)
            top_skills = cursor.fetchall()

            # 6. Jobs by location
            cursor.execute("""
                SELECT location, COUNT(*) as count
                FROM jobs
                GROUP BY location
                ORDER BY count DESC
                LIMIT 6
            """)
            jobs_by_location = cursor.fetchall()

            # 7. Applications by student branch
            cursor.execute("""
                SELECT sp.branch, COUNT(a.id) as count
                FROM applications a
                JOIN student_profiles sp ON a.student_id = sp.id
                GROUP BY sp.branch
                ORDER BY count DESC
            """)
            apps_by_branch = cursor.fetchall()

            return jsonify({
                'success': True,
                'statistics': {
                    'total_students': total_students,
                    'total_jobs': total_jobs,
                    'total_applications': total_applications,
                    'applications_by_status': apps_by_status,
                    'top_demanded_skills': top_skills,
                    'jobs_by_location': jobs_by_location,
                    'applications_by_branch': apps_by_branch
                }
            }), 200
    finally:
        db.close()

@admin_bp.route('/students', methods=['GET'])
@admin_required
def get_all_students(current_user):
    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute("""
                SELECT u.id as user_id, u.name, u.email, u.created_at,
                       sp.id as profile_id, sp.branch, sp.cgpa, sp.graduation_year,
                       sp.preferred_location, sp.preferred_role, sp.experience_level
                FROM users u
                LEFT JOIN student_profiles sp ON u.id = sp.user_id
                WHERE u.role = 'student'
                ORDER BY u.created_at DESC
            """)
            students = cursor.fetchall()

            for s in students:
                s['cgpa'] = float(s['cgpa']) if s['cgpa'] is not None else 0.0
                if s['profile_id']:
                    cursor.execute("""
                        SELECT s.name 
                        FROM student_skills ss
                        JOIN skills s ON ss.skill_id = s.id
                        WHERE ss.student_id = %s
                        ORDER BY s.name ASC
                    """, (s['profile_id'],))
                    s['skills'] = [r['name'] for r in cursor.fetchall()]

                    # Count applications
                    cursor.execute("SELECT COUNT(*) as count FROM applications WHERE student_id = %s", (s['profile_id'],))
                    s['applications_count'] = cursor.fetchone()['count']
                else:
                    s['skills'] = []
                    s['applications_count'] = 0

            return jsonify({
                'success': True,
                'count': len(students),
                'students': students
            }), 200
    finally:
        db.close()

@admin_bp.route('/applications', methods=['GET'])
@admin_required
def get_all_admin_applications(current_user):
    status_filter = request.args.get('status', '').strip()
    db = get_db()
    try:
        with db.cursor() as cursor:
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
            if status_filter and status_filter.lower() != 'all':
                query += " AND a.status = %s"
                params.append(status_filter)

            query += " ORDER BY a.applied_at DESC"
            cursor.execute(query, tuple(params))
            applications = cursor.fetchall()

            for app in applications:
                app['cgpa'] = float(app['cgpa']) if app['cgpa'] is not None else 0.0
                app['minimum_cgpa'] = float(app['minimum_cgpa']) if app['minimum_cgpa'] is not None else 0.0

            return jsonify({
                'success': True,
                'count': len(applications),
                'applications': applications
            }), 200
    finally:
        db.close()

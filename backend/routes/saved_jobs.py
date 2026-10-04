from flask import Blueprint, request, jsonify
from database import get_db
from routes.auth import token_required
from matching_engine import calculate_match

saved_jobs_bp = Blueprint('saved_jobs', __name__)

@saved_jobs_bp.route('', methods=['POST'])
@token_required
def save_job(current_user):
    if current_user.get('role') != 'student':
        return jsonify({'success': False, 'message': 'Only students can save jobs'}), 403

    data = request.get_json() or {}
    job_id = data.get('job_id')
    if not job_id:
        return jsonify({'success': False, 'message': 'job_id is required'}), 400

    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute("SELECT id FROM student_profiles WHERE user_id = %s", (current_user['id'],))
            student = cursor.fetchone()
            if not student:
                return jsonify({'success': False, 'message': 'Student profile not found'}), 404
            student_id = student['id']

            cursor.execute("SELECT id, title, company FROM jobs WHERE id = %s", (job_id,))
            job = cursor.fetchone()
            if not job:
                return jsonify({'success': False, 'message': 'Job not found'}), 404

            cursor.execute("""
                INSERT IGNORE INTO saved_jobs (student_id, job_id)
                VALUES (%s, %s)
            """, (student_id, job_id))

            return jsonify({
                'success': True,
                'message': f"Job '{job['title']}' saved to bookmarks",
                'is_saved': True
            }), 201
    finally:
        db.close()

@saved_jobs_bp.route('', methods=['GET'])
@token_required
def get_saved_jobs(current_user):
    if current_user.get('role') != 'student':
        return jsonify({'success': False, 'message': 'Only students can view saved jobs'}), 403

    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute("SELECT * FROM student_profiles WHERE user_id = %s", (current_user['id'],))
            student = cursor.fetchone()
            if not student:
                return jsonify({'success': True, 'saved_jobs': []}), 200

            student_id = student['id']
            student['cgpa'] = float(student['cgpa']) if student['cgpa'] is not None else 0.0

            cursor.execute("""
                SELECT s.name 
                FROM student_skills ss
                JOIN skills s ON ss.skill_id = s.id
                WHERE ss.student_id = %s
            """, (student_id,))
            student['skills'] = [r['name'] for r in cursor.fetchall()]

            # Fetch applied jobs
            cursor.execute("SELECT job_id, status FROM applications WHERE student_id = %s", (student_id,))
            app_map = {r['job_id']: r['status'] for r in cursor.fetchall()}

            query = """
                SELECT sj.id as saved_id, sj.saved_at,
                       j.*
                FROM saved_jobs sj
                JOIN jobs j ON sj.job_id = j.id
                WHERE sj.student_id = %s
                ORDER BY sj.saved_at DESC
            """
            cursor.execute(query, (student_id,))
            saved = cursor.fetchall()

            for item in saved:
                item['minimum_cgpa'] = float(item['minimum_cgpa']) if item['minimum_cgpa'] is not None else 0.0
                cursor.execute("""
                    SELECT s.id, s.name 
                    FROM job_skills js
                    JOIN skills s ON js.skill_id = s.id
                    WHERE js.job_id = %s
                """, (item['id'],))
                skills_rows = cursor.fetchall()
                item['skills'] = skills_rows
                item['required_skills'] = [s['name'] for s in skills_rows]
                item['is_saved'] = True
                item['is_applied'] = item['id'] in app_map
                item['application_status'] = app_map.get(item['id'])

                # Match calculation
                match_result = calculate_match(student, item)
                item['match_score'] = match_result['total_score']
                item['match_breakdown'] = match_result['breakdown']
                item['match_explanation'] = match_result['explanation']

            return jsonify({'success': True, 'count': len(saved), 'saved_jobs': saved}), 200
    finally:
        db.close()

@saved_jobs_bp.route('/<int:job_id>', methods=['DELETE'])
@token_required
def remove_saved_job(current_user, job_id):
    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute("SELECT id FROM student_profiles WHERE user_id = %s", (current_user['id'],))
            student = cursor.fetchone()
            if not student:
                return jsonify({'success': False, 'message': 'Student profile not found'}), 404

            cursor.execute(
                "DELETE FROM saved_jobs WHERE student_id = %s AND job_id = %s",
                (student['id'], job_id)
            )
            return jsonify({'success': True, 'message': 'Job removed from saved list', 'is_saved': False}), 200
    finally:
        db.close()

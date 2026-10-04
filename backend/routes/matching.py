from flask import Blueprint, request, jsonify
from database import get_db
from routes.auth import token_required
from matching_engine import calculate_match

matching_bp = Blueprint('matching', __name__)

@matching_bp.route('', methods=['GET'])
@token_required
def get_student_matches(current_user):
    if current_user.get('role') != 'student':
        return jsonify({'success': False, 'message': 'Only students can view personal job matches'}), 403

    min_score = request.args.get('min_score', default=0, type=int)
    limit = request.args.get('limit', default=50, type=int)

    db = get_db()
    try:
        with db.cursor() as cursor:
            # 1. Fetch student profile
            cursor.execute("SELECT * FROM student_profiles WHERE user_id = %s", (current_user['id'],))
            student = cursor.fetchone()
            if not student:
                return jsonify({'success': False, 'message': 'Student profile not found. Please complete profile first.'}), 404

            student['cgpa'] = float(student['cgpa']) if student['cgpa'] is not None else 0.0

            cursor.execute("""
                SELECT s.name 
                FROM student_skills ss
                JOIN skills s ON ss.skill_id = s.id
                WHERE ss.student_id = %s
            """, (student['id'],))
            student['skills'] = [r['name'] for r in cursor.fetchall()]

            # 2. Fetch applied & saved IDs
            cursor.execute("SELECT job_id, status FROM applications WHERE student_id = %s", (student['id'],))
            app_map = {row['job_id']: row['status'] for row in cursor.fetchall()}

            cursor.execute("SELECT job_id FROM saved_jobs WHERE student_id = %s", (student['id'],))
            saved_ids = set(row['job_id'] for row in cursor.fetchall())

            # 3. Fetch all jobs
            cursor.execute("SELECT * FROM jobs ORDER BY created_at DESC")
            jobs = cursor.fetchall()

            matches = []
            for job in jobs:
                job_id = job['id']
                job['minimum_cgpa'] = float(job['minimum_cgpa']) if job['minimum_cgpa'] is not None else 0.0

                cursor.execute("""
                    SELECT s.id, s.name 
                    FROM job_skills js
                    JOIN skills s ON js.skill_id = s.id
                    WHERE js.job_id = %s
                """, (job_id,))
                skills_rows = cursor.fetchall()
                job['skills'] = skills_rows
                job['required_skills'] = [s['name'] for s in skills_rows]
                job['is_applied'] = job_id in app_map
                job['application_status'] = app_map.get(job_id)
                job['is_saved'] = job_id in saved_ids

                # Run explainable matching engine
                match_result = calculate_match(student, job)
                total_score = match_result['total_score']

                if total_score >= min_score:
                    job['match_score'] = total_score
                    job['match_breakdown'] = match_result['breakdown']
                    job['match_explanation'] = match_result['explanation']
                    matches.append(job)

            # Sort descending by match score
            matches.sort(key=lambda x: x['match_score'], reverse=True)
            matches = matches[:limit]

            # Summary stats
            scores = [m['match_score'] for m in matches] if matches else [0]
            stats = {
                'total_matches': len(matches),
                'highest_match': max(scores) if scores else 0,
                'average_match': round(sum(scores) / len(scores), 1) if scores else 0,
                'perfect_or_high_matches': sum(1 for s in scores if s >= 80)
            }

            return jsonify({
                'success': True,
                'stats': stats,
                'matches': matches
            }), 200
    finally:
        db.close()

@matching_bp.route('/<int:job_id>', methods=['GET'])
@token_required
def get_single_job_match(current_user, job_id):
    db = get_db()
    try:
        with db.cursor() as cursor:
            # Student profile
            cursor.execute("SELECT * FROM student_profiles WHERE user_id = %s", (current_user['id'],))
            student = cursor.fetchone()
            if not student:
                return jsonify({'success': False, 'message': 'Student profile not found'}), 404

            student['cgpa'] = float(student['cgpa']) if student['cgpa'] is not None else 0.0

            cursor.execute("""
                SELECT s.name 
                FROM student_skills ss
                JOIN skills s ON ss.skill_id = s.id
                WHERE ss.student_id = %s
            """, (student['id'],))
            student['skills'] = [r['name'] for r in cursor.fetchall()]

            # Job details
            cursor.execute("SELECT * FROM jobs WHERE id = %s", (job_id,))
            job = cursor.fetchone()
            if not job:
                return jsonify({'success': False, 'message': 'Job not found'}), 404

            job['minimum_cgpa'] = float(job['minimum_cgpa']) if job['minimum_cgpa'] is not None else 0.0

            cursor.execute("""
                SELECT s.id, s.name 
                FROM job_skills js
                JOIN skills s ON js.skill_id = s.id
                WHERE js.job_id = %s
            """, (job_id,))
            skills_rows = cursor.fetchall()
            job['skills'] = skills_rows
            job['required_skills'] = [s['name'] for s in skills_rows]

            # Match calculation
            match_result = calculate_match(student, job)

            return jsonify({
                'success': True,
                'job_id': job_id,
                'job_title': job['title'],
                'company': job['company'],
                'match': match_result
            }), 200
    finally:
        db.close()

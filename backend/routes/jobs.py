from flask import Blueprint, request, jsonify
from database import get_db
from routes.auth import token_required, admin_required
from matching_engine import calculate_match

jobs_bp = Blueprint('jobs', __name__)

def fetch_job_skills(cursor, job_id):
    cursor.execute("""
        SELECT s.id, s.name 
        FROM job_skills js
        JOIN skills s ON js.skill_id = s.id
        WHERE js.job_id = %s
        ORDER BY s.name ASC
    """, (job_id,))
    return cursor.fetchall()

def get_optional_current_user():
    """Extracts user from Bearer token if provided, without failing if missing."""
    import jwt
    from config import Config
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None
    parts = auth_header.split()
    if len(parts) == 2 and parts[0].lower() == 'bearer':
        try:
            return jwt.decode(parts[1], Config.JWT_SECRET, algorithms=[Config.JWT_ALGORITHM])
        except Exception:
            return None
    return None

@jobs_bp.route('', methods=['GET'])
def get_jobs():
    search = request.args.get('search', '').strip()
    location = request.args.get('location', '').strip()
    job_type = request.args.get('job_type', '').strip()
    role = request.args.get('role', '').strip()
    min_score = request.args.get('min_score', type=int)
    sort_by = request.args.get('sort_by', 'date') # 'score', 'date', 'cgpa', 'title'

    current_user = get_optional_current_user()

    db = get_db()
    try:
        with db.cursor() as cursor:
            # If user is student, fetch their profile & skills for match score calculations
            student_profile = None
            student_profile_id = None
            student_skills = []
            applied_job_ids = set()
            saved_job_ids = set()

            if current_user and current_user.get('role') == 'student':
                cursor.execute("SELECT * FROM student_profiles WHERE user_id = %s", (current_user['id'],))
                student_profile = cursor.fetchone()
                if student_profile:
                    student_profile_id = student_profile['id']
                    cursor.execute("""
                        SELECT s.name 
                        FROM student_skills ss
                        JOIN skills s ON ss.skill_id = s.id
                        WHERE ss.student_id = %s
                    """, (student_profile_id,))
                    student_skills = [row['name'] for row in cursor.fetchall()]
                    student_profile['skills'] = student_skills

                    # Fetch user's applied and saved job IDs
                    cursor.execute("SELECT job_id, status FROM applications WHERE student_id = %s", (student_profile_id,))
                    app_rows = cursor.fetchall()
                    app_status_map = {row['job_id']: row['status'] for row in app_rows}
                    applied_job_ids = set(app_status_map.keys())

                    cursor.execute("SELECT job_id FROM saved_jobs WHERE student_id = %s", (student_profile_id,))
                    saved_job_ids = set(row['job_id'] for row in cursor.fetchall())
                else:
                    app_status_map = {}
            else:
                app_status_map = {}

            # Query base jobs
            query = "SELECT * FROM jobs WHERE 1=1"
            params = []

            if search:
                query += " AND (title LIKE %s OR company LIKE %s OR description LIKE %s)"
                term = f"%{search}%"
                params.extend([term, term, term])

            if location and location.lower() != 'all':
                query += " AND location LIKE %s"
                params.append(f"%{location}%")

            if job_type and job_type.lower() != 'all':
                query += " AND job_type = %s"
                params.append(job_type)

            if role and role.lower() != 'all':
                query += " AND (title LIKE %s OR eligible_branches LIKE %s)"
                params.extend([f"%{role}%", f"%{role}%"])

            cursor.execute(query, tuple(params))
            jobs = cursor.fetchall()

            enriched_jobs = []
            for j in jobs:
                job_id = j['id']
                j['minimum_cgpa'] = float(j['minimum_cgpa']) if j['minimum_cgpa'] is not None else 0.0

                # Skills
                skills_list = fetch_job_skills(cursor, job_id)
                j['skills'] = skills_list
                j['required_skills'] = [s['name'] for s in skills_list]

                # Application & Saved statuses
                j['is_applied'] = job_id in applied_job_ids
                j['application_status'] = app_status_map.get(job_id, None)
                j['is_saved'] = job_id in saved_job_ids

                # Real-time Match Calculation if student
                if student_profile:
                    match_result = calculate_match(student_profile, j)
                    j['match_score'] = match_result['total_score']
                    j['match_breakdown'] = match_result['breakdown']
                    j['match_explanation'] = match_result['explanation']
                else:
                    j['match_score'] = None
                    j['match_breakdown'] = None
                    j['match_explanation'] = None

                # Filter by min_score if requested
                if min_score is not None and j['match_score'] is not None:
                    if j['match_score'] < min_score:
                        continue

                enriched_jobs.append(j)

            # Sorting
            if sort_by == 'score' and student_profile:
                enriched_jobs.sort(key=lambda x: (x['match_score'] or 0), reverse=True)
            elif sort_by == 'cgpa':
                enriched_jobs.sort(key=lambda x: x['minimum_cgpa'], reverse=True)
            elif sort_by == 'title':
                enriched_jobs.sort(key=lambda x: x['title'].lower())
            else: # default date desc
                enriched_jobs.sort(key=lambda x: x['created_at'], reverse=True)

            return jsonify({
                'success': True,
                'count': len(enriched_jobs),
                'jobs': enriched_jobs
            }), 200
    finally:
        db.close()

@jobs_bp.route('/<int:job_id>', methods=['GET'])
def get_job_by_id(job_id):
    current_user = get_optional_current_user()
    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute("SELECT * FROM jobs WHERE id = %s", (job_id,))
            job = cursor.fetchone()
            if not job:
                return jsonify({'success': False, 'message': 'Job not found'}), 404

            job['minimum_cgpa'] = float(job['minimum_cgpa']) if job['minimum_cgpa'] is not None else 0.0
            skills_list = fetch_job_skills(cursor, job_id)
            job['skills'] = skills_list
            job['required_skills'] = [s['name'] for s in skills_list]

            job['is_applied'] = False
            job['application_status'] = None
            job['is_saved'] = False
            job['match_score'] = None
            job['match_breakdown'] = None
            job['match_explanation'] = None

            if current_user and current_user.get('role') == 'student':
                cursor.execute("SELECT * FROM student_profiles WHERE user_id = %s", (current_user['id'],))
                student_profile = cursor.fetchone()
                if student_profile:
                    cursor.execute("""
                        SELECT s.name 
                        FROM student_skills ss
                        JOIN skills s ON ss.skill_id = s.id
                        WHERE ss.student_id = %s
                    """, (student_profile['id'],))
                    student_profile['skills'] = [r['name'] for r in cursor.fetchall()]

                    cursor.execute("SELECT status FROM applications WHERE student_id = %s AND job_id = %s", 
                                   (student_profile['id'], job_id))
                    app = cursor.fetchone()
                    if app:
                        job['is_applied'] = True
                        job['application_status'] = app['status']

                    cursor.execute("SELECT id FROM saved_jobs WHERE student_id = %s AND job_id = %s", 
                                   (student_profile['id'], job_id))
                    job['is_saved'] = cursor.fetchone() is not None

                    match_result = calculate_match(student_profile, job)
                    job['match_score'] = match_result['total_score']
                    job['match_breakdown'] = match_result['breakdown']
                    job['match_explanation'] = match_result['explanation']

            return jsonify({'success': True, 'job': job}), 200
    finally:
        db.close()

@jobs_bp.route('', methods=['POST'])
@admin_required
def create_job(current_user):
    data = request.get_json() or {}
    title = (data.get('title') or '').strip()
    company = (data.get('company') or '').strip()
    description = (data.get('description') or '').strip()
    location = (data.get('location') or '').strip()
    job_type = (data.get('job_type') or 'Full-time').strip()
    experience_required = (data.get('experience_required') or 'Fresher').strip()
    salary_range = (data.get('salary_range') or 'Competitive').strip()
    eligible_branches = (data.get('eligible_branches') or 'All Branches').strip()

    try:
        minimum_cgpa = float(data.get('minimum_cgpa', 0.0))
    except (ValueError, TypeError):
        minimum_cgpa = 0.0

    try:
        graduation_year = int(data.get('graduation_year', 2026))
    except (ValueError, TypeError):
        graduation_year = 2026

    skill_ids = data.get('skill_ids', [])
    skill_names = data.get('skill_names', [])

    if not title or not company or not description or not location:
        return jsonify({'success': False, 'message': 'Title, company, description, and location are required.'}), 400

    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute("""
                INSERT INTO jobs (title, company, description, location, job_type, 
                                  experience_required, minimum_cgpa, graduation_year, eligible_branches, salary_range)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (title, company, description, location, job_type, experience_required, minimum_cgpa, graduation_year, eligible_branches, salary_range))
            job_id = cursor.lastrowid

            # Attach skills by ID
            for sid in skill_ids:
                cursor.execute("INSERT IGNORE INTO job_skills (job_id, skill_id) VALUES (%s, %s)", (job_id, sid))

            # Or attach skills by name
            for name in skill_names:
                name = name.strip()
                if not name:
                    continue
                cursor.execute("SELECT id FROM skills WHERE LOWER(name) = LOWER(%s)", (name,))
                sk = cursor.fetchone()
                if sk:
                    sid = sk['id']
                else:
                    cursor.execute("INSERT INTO skills (name) VALUES (%s)", (name,))
                    sid = cursor.lastrowid
                cursor.execute("INSERT IGNORE INTO job_skills (job_id, skill_id) VALUES (%s, %s)", (job_id, sid))

            return jsonify({
                'success': True,
                'message': 'Job created successfully',
                'job_id': job_id
            }), 201
    finally:
        db.close()

@jobs_bp.route('/<int:job_id>', methods=['PUT'])
@admin_required
def update_job(current_user, job_id):
    data = request.get_json() or {}
    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute("SELECT id FROM jobs WHERE id = %s", (job_id,))
            if not cursor.fetchone():
                return jsonify({'success': False, 'message': 'Job not found'}), 404

            title = (data.get('title') or '').strip()
            company = (data.get('company') or '').strip()
            description = (data.get('description') or '').strip()
            location = (data.get('location') or '').strip()
            job_type = (data.get('job_type') or 'Full-time').strip()
            experience_required = (data.get('experience_required') or 'Fresher').strip()
            salary_range = (data.get('salary_range') or 'Competitive').strip()
            eligible_branches = (data.get('eligible_branches') or 'All Branches').strip()

            try:
                minimum_cgpa = float(data.get('minimum_cgpa', 0.0))
            except (ValueError, TypeError):
                minimum_cgpa = 0.0

            try:
                graduation_year = int(data.get('graduation_year', 2026))
            except (ValueError, TypeError):
                graduation_year = 2026

            cursor.execute("""
                UPDATE jobs 
                SET title = %s, company = %s, description = %s, location = %s, job_type = %s,
                    experience_required = %s, minimum_cgpa = %s, graduation_year = %s, 
                    eligible_branches = %s, salary_range = %s
                WHERE id = %s
            """, (title, company, description, location, job_type, experience_required, minimum_cgpa, graduation_year, eligible_branches, salary_range, job_id))

            # Update skills if provided
            if 'skill_ids' in data or 'skill_names' in data:
                cursor.execute("DELETE FROM job_skills WHERE job_id = %s", (job_id,))
                for sid in data.get('skill_ids', []):
                    cursor.execute("INSERT IGNORE INTO job_skills (job_id, skill_id) VALUES (%s, %s)", (job_id, sid))
                for name in data.get('skill_names', []):
                    name = name.strip()
                    if not name:
                        continue
                    cursor.execute("SELECT id FROM skills WHERE LOWER(name) = LOWER(%s)", (name,))
                    sk = cursor.fetchone()
                    if sk:
                        sid = sk['id']
                    else:
                        cursor.execute("INSERT INTO skills (name) VALUES (%s)", (name,))
                        sid = cursor.lastrowid
                    cursor.execute("INSERT IGNORE INTO job_skills (job_id, skill_id) VALUES (%s, %s)", (job_id, sid))

            return jsonify({'success': True, 'message': 'Job updated successfully'}), 200
    finally:
        db.close()

@jobs_bp.route('/<int:job_id>', methods=['DELETE'])
@admin_required
def delete_job(current_user, job_id):
    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute("SELECT id FROM jobs WHERE id = %s", (job_id,))
            if not cursor.fetchone():
                return jsonify({'success': False, 'message': 'Job not found'}), 404

            cursor.execute("DELETE FROM jobs WHERE id = %s", (job_id,))
            return jsonify({'success': True, 'message': 'Job deleted successfully'}), 200
    finally:
        db.close()

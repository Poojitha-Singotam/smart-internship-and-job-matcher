from flask import Blueprint, request, jsonify
from database import get_db
from routes.auth import token_required

student_bp = Blueprint('student', __name__)

def get_student_profile_id(cursor, user_id):
    cursor.execute("SELECT id FROM student_profiles WHERE user_id = %s", (user_id,))
    row = cursor.fetchone()
    if row:
        return row['id']
    cursor.execute("INSERT INTO student_profiles (user_id) VALUES (%s)", (user_id,))
    return cursor.lastrowid

@student_bp.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute("SELECT * FROM student_profiles WHERE user_id = %s", (current_user['id'],))
            profile = cursor.fetchone()
            if not profile:
                profile_id = get_student_profile_id(cursor, current_user['id'])
                cursor.execute("SELECT * FROM student_profiles WHERE id = %s", (profile_id,))
                profile = cursor.fetchone()

            profile['cgpa'] = float(profile['cgpa']) if profile['cgpa'] is not None else 0.0

            cursor.execute("""
                SELECT s.id, s.name 
                FROM student_skills ss
                JOIN skills s ON ss.skill_id = s.id
                WHERE ss.student_id = %s
                ORDER BY s.name ASC
            """, (profile['id'],))
            skills = cursor.fetchall()
            profile['skills'] = skills

            return jsonify({'success': True, 'profile': profile}), 200
    finally:
        db.close()

@student_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    data = request.get_json() or {}
    branch = (data.get('branch') or 'CSE').strip()
    try:
        cgpa = float(data.get('cgpa', 0.0))
        if cgpa < 0.0 or cgpa > 10.0:
            return jsonify({'success': False, 'message': 'CGPA must be between 0.0 and 10.0'}), 400
    except (ValueError, TypeError):
        return jsonify({'success': False, 'message': 'Invalid CGPA value'}), 400

    try:
        graduation_year = int(data.get('graduation_year', 2026))
    except (ValueError, TypeError):
        return jsonify({'success': False, 'message': 'Invalid graduation year'}), 400

    preferred_location = (data.get('preferred_location') or 'Any').strip()
    preferred_role = (data.get('preferred_role') or 'Software Developer').strip()
    experience_level = (data.get('experience_level') or 'Fresher').strip()

    db = get_db()
    try:
        with db.cursor() as cursor:
            profile_id = get_student_profile_id(cursor, current_user['id'])
            cursor.execute("""
                UPDATE student_profiles
                SET branch = %s, cgpa = %s, graduation_year = %s, 
                    preferred_location = %s, preferred_role = %s, experience_level = %s
                WHERE id = %s
            """, (branch, cgpa, graduation_year, preferred_location, preferred_role, experience_level, profile_id))

            # Fetch updated profile
            cursor.execute("SELECT * FROM student_profiles WHERE id = %s", (profile_id,))
            updated_profile = cursor.fetchone()
            updated_profile['cgpa'] = float(updated_profile['cgpa'])

            cursor.execute("""
                SELECT s.id, s.name 
                FROM student_skills ss
                JOIN skills s ON ss.skill_id = s.id
                WHERE ss.student_id = %s
                ORDER BY s.name ASC
            """, (profile_id,))
            updated_profile['skills'] = cursor.fetchall()

            return jsonify({
                'success': True,
                'message': 'Profile updated successfully',
                'profile': updated_profile
            }), 200
    finally:
        db.close()

@student_bp.route('/skills', methods=['GET'])
@token_required
def get_student_skills(current_user):
    db = get_db()
    try:
        with db.cursor() as cursor:
            profile_id = get_student_profile_id(cursor, current_user['id'])
            cursor.execute("""
                SELECT s.id, s.name 
                FROM student_skills ss
                JOIN skills s ON ss.skill_id = s.id
                WHERE ss.student_id = %s
                ORDER BY s.name ASC
            """, (profile_id,))
            skills = cursor.fetchall()
            return jsonify({'success': True, 'skills': skills}), 200
    finally:
        db.close()

@student_bp.route('/skills', methods=['POST'])
@token_required
def add_student_skill(current_user):
    data = request.get_json() or {}
    skill_id = data.get('skill_id')
    skill_name = (data.get('skill_name') or '').strip()

    db = get_db()
    try:
        with db.cursor() as cursor:
            profile_id = get_student_profile_id(cursor, current_user['id'])

            # If skill_name provided but no skill_id, look up or insert into skills catalog
            if not skill_id and skill_name:
                cursor.execute("SELECT id FROM skills WHERE LOWER(name) = LOWER(%s)", (skill_name,))
                existing_skill = cursor.fetchone()
                if existing_skill:
                    skill_id = existing_skill['id']
                else:
                    cursor.execute("INSERT INTO skills (name) VALUES (%s)", (skill_name,))
                    skill_id = cursor.lastrowid

            if not skill_id:
                return jsonify({'success': False, 'message': 'skill_id or skill_name is required'}), 400

            # Insert relationship
            cursor.execute(
                "INSERT IGNORE INTO student_skills (student_id, skill_id) VALUES (%s, %s)",
                (profile_id, skill_id)
            )

            # Return updated skills
            cursor.execute("""
                SELECT s.id, s.name 
                FROM student_skills ss
                JOIN skills s ON ss.skill_id = s.id
                WHERE ss.student_id = %s
                ORDER BY s.name ASC
            """, (profile_id,))
            skills = cursor.fetchall()

            return jsonify({
                'success': True,
                'message': 'Skill added successfully',
                'skills': skills
            }), 201
    finally:
        db.close()

@student_bp.route('/skills/<int:skill_id>', methods=['DELETE'])
@token_required
def remove_student_skill(current_user, skill_id):
    db = get_db()
    try:
        with db.cursor() as cursor:
            profile_id = get_student_profile_id(cursor, current_user['id'])
            cursor.execute(
                "DELETE FROM student_skills WHERE student_id = %s AND skill_id = %s",
                (profile_id, skill_id)
            )

            cursor.execute("""
                SELECT s.id, s.name 
                FROM student_skills ss
                JOIN skills s ON ss.skill_id = s.id
                WHERE ss.student_id = %s
                ORDER BY s.name ASC
            """, (profile_id,))
            skills = cursor.fetchall()

            return jsonify({
                'success': True,
                'message': 'Skill removed successfully',
                'skills': skills
            }), 200
    finally:
        db.close()

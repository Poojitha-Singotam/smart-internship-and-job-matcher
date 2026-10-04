import jwt
import datetime
from functools import wraps
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_db
from config import Config

auth_bp = Blueprint('auth', __name__)

def generate_token(user):
    payload = {
        'id': user['id'],
        'email': user['email'],
        'name': user['name'],
        'role': user['role'],
        'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=Config.JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, Config.JWT_SECRET, algorithm=Config.JWT_ALGORITHM)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'success': False, 'message': 'Authorization header is missing'}), 401
        
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return jsonify({'success': False, 'message': 'Invalid token format. Expected Bearer <token>'}), 401

        token = parts[1]
        try:
            payload = jwt.decode(token, Config.JWT_SECRET, algorithms=[Config.JWT_ALGORITHM])
            current_user = payload
        except jwt.ExpiredSignatureError:
            return jsonify({'success': False, 'message': 'Session token has expired. Please login again.'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'success': False, 'message': 'Invalid authentication token.'}), 401

        return f(current_user, *args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'success': False, 'message': 'Authorization header is missing'}), 401
        
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return jsonify({'success': False, 'message': 'Invalid token format'}), 401

        token = parts[1]
        try:
            payload = jwt.decode(token, Config.JWT_SECRET, algorithms=[Config.JWT_ALGORITHM])
            if payload.get('role') != 'admin':
                return jsonify({'success': False, 'message': 'Admin privileges required'}), 403
            current_user = payload
        except Exception:
            return jsonify({'success': False, 'message': 'Invalid or expired token'}), 401

        return f(current_user, *args, **kwargs)
    return decorated

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    role = data.get('role', 'student').strip().lower()

    if not name or not email or not password:
        return jsonify({'success': False, 'message': 'Name, email, and password are required.'}), 400

    if role not in ['student', 'admin']:
        role = 'student'

    if len(password) < 6:
        return jsonify({'success': False, 'message': 'Password must be at least 6 characters long.'}), 400

    db = get_db()
    try:
        with db.cursor() as cursor:
            # Check existing email
            cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
            if cursor.fetchone():
                return jsonify({'success': False, 'message': 'An account with this email already exists.'}), 409

            password_hash = generate_password_hash(password)
            cursor.execute(
                "INSERT INTO users (name, email, password_hash, role) VALUES (%s, %s, %s, %s)",
                (name, email, password_hash, role)
            )
            user_id = cursor.lastrowid

            # If student, create a student profile
            if role == 'student':
                cursor.execute(
                    """INSERT INTO student_profiles (user_id, branch, cgpa, graduation_year, preferred_location, preferred_role, experience_level)
                       VALUES (%s, 'CSE', 7.50, 2026, 'Any', 'Software Developer', 'Fresher')""",
                    (user_id,)
                )

            user_obj = {'id': user_id, 'name': name, 'email': email, 'role': role}
            token = generate_token(user_obj)

            return jsonify({
                'success': True,
                'message': 'Registration successful',
                'token': token,
                'user': user_obj
            }), 201
    finally:
        db.close()

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password are required.'}), 400

    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute("SELECT id, name, email, password_hash, role FROM users WHERE email = %s", (email,))
            user = cursor.fetchone()

            if not user or not check_password_hash(user['password_hash'], password):
                return jsonify({'success': False, 'message': 'Invalid email or password.'}), 401

            user_obj = {
                'id': user['id'],
                'name': user['name'],
                'email': user['email'],
                'role': user['role']
            }
            token = generate_token(user_obj)

            return jsonify({
                'success': True,
                'message': 'Login successful',
                'token': token,
                'user': user_obj
            }), 200
    finally:
        db.close()

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_me(current_user):
    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute("SELECT id, name, email, role, created_at FROM users WHERE id = %s", (current_user['id'],))
            user = cursor.fetchone()
            if not user:
                return jsonify({'success': False, 'message': 'User not found'}), 404

            response_data = {'user': user}

            if user['role'] == 'student':
                cursor.execute("SELECT * FROM student_profiles WHERE user_id = %s", (user['id'],))
                profile = cursor.fetchone()
                if profile:
                    profile['cgpa'] = float(profile['cgpa']) if profile['cgpa'] is not None else 0.0
                    cursor.execute("""
                        SELECT s.id, s.name 
                        FROM student_skills ss
                        JOIN skills s ON ss.skill_id = s.id
                        WHERE ss.student_id = %s
                        ORDER BY s.name ASC
                    """, (profile['id'],))
                    profile['skills'] = cursor.fetchall()
                response_data['profile'] = profile

            return jsonify({'success': True, **response_data}), 200
    finally:
        db.close()

@auth_bp.route('/skills', methods=['GET'])
def get_all_skills():
    db = get_db()
    try:
        with db.cursor() as cursor:
            cursor.execute("SELECT id, name FROM skills ORDER BY name ASC")
            skills = cursor.fetchall()
            return jsonify({'success': True, 'skills': skills}), 200
    finally:
        db.close()

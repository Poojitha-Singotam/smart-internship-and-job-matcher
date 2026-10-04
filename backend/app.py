from flask import Flask, jsonify, request
from flask_cors import CORS
from config import Config
from database import init_db

# Import Blueprints
from routes.auth import auth_bp
from routes.student import student_bp
from routes.jobs import jobs_bp
from routes.matching import matching_bp
from routes.applications import applications_bp
from routes.saved_jobs import saved_jobs_bp
from routes.admin import admin_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for all routes
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(student_bp, url_prefix='/api/student')
    app.register_blueprint(jobs_bp, url_prefix='/api/jobs')
    app.register_blueprint(matching_bp, url_prefix='/api/matches')
    app.register_blueprint(applications_bp, url_prefix='/api/applications')
    app.register_blueprint(saved_jobs_bp, url_prefix='/api/saved-jobs')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'service': 'Smart Internship & Job Matcher API',
            'version': '1.0.0'
        }), 200

    # Global Error Handlers
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            'success': False,
            'message': getattr(error, 'description', 'Bad Request')
        }), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'message': 'Resource not found'
        }), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            'success': False,
            'message': 'Internal Server Error'
        }), 500

    return app

app = create_app()

if __name__ == '__main__':
    try:
        init_db()
    except Exception as e:
        print(f"Warning: Could not automatically initialize database on start: {e}")

    print(f"Starting Smart Matcher API server on port {Config.PORT}...")
    app.run(host='0.0.0.0', port=Config.PORT, debug=Config.DEBUG)

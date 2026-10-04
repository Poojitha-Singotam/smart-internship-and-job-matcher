import os
from dotenv import load_dotenv

# Load environment variables from .env file
basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

class Config:
    # Database Configuration
    MYSQL_HOST = os.getenv('MYSQL_HOST', '127.0.0.1')
    MYSQL_PORT = int(os.getenv('MYSQL_PORT', 3307))
    MYSQL_USER = os.getenv('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', '')
    MYSQL_DB = os.getenv('MYSQL_DB', 'smart_job_matcher')

    # Security Configuration
    JWT_SECRET = os.getenv('JWT_SECRET', 'super-secret-default-key-change-me')
    JWT_ALGORITHM = 'HS256'
    JWT_EXPIRATION_HOURS = 24

    # Flask Configuration
    DEBUG = os.getenv('FLASK_ENV', 'development') == 'development'
    PORT = int(os.getenv('PORT', 5000))

    # ==========================================
    # MATCHING ENGINE WEIGHT CONFIGURATION (100 pts)
    # Easily tunable in this single configuration file
    # ==========================================
    MATCHING_WEIGHTS = {
        'skills': 40,              # Skills overlap percentage (Jaccard / coverage)
        'eligibility': 25,         # CGPA threshold (15 pts) + Graduation year (10 pts)
        'education': 15,           # Eligible branches match (15 pts)
        'role_preference': 10,     # Student preferred role vs Job title / role (10 pts)
        'location_preference': 5,  # Student preferred location vs Job location (5 pts)
        'experience': 5            # Experience level suitability (5 pts)
    }

    # Sub-weights for fine-grained calculation
    ELIGIBILITY_SUBWEIGHTS = {
        'cgpa': 15,
        'graduation_year': 10
    }

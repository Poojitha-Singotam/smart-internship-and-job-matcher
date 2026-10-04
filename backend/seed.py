"""
SMART INTERNSHIP & JOB MATCHER - DATABASE SEED SCRIPT
Populates MySQL database with:
- 25 Standardized Technical Skills
- 1 Admin account (admin@matcher.com / admin123)
- 5 Realistic Student Profiles & associated skills
- 16 Realistic Jobs & Internships with specific skill criteria
- Realistic Applications across diverse statuses (Applied, Under Review, Interviewing, Accepted, Rejected)
- Saved Jobs for testing bookmarking
"""

from werkzeug.security import generate_password_hash
from database import get_db, init_db

SKILLS_LIST = [
    "Java", "Python", "C", "C++", "JavaScript", "React", "HTML", "CSS", 
    "SQL", "MySQL", "Flask", "Git", "Docker", "AWS", "Machine Learning", 
    "Data Structures", "OOP", "REST APIs", "Linux", "Node.js", 
    "TypeScript", "MongoDB", "Kubernetes", "Django", "Spring Boot"
]

STUDENTS_DATA = [
    {
        "name": "Poojitha Reddy",
        "email": "poojitha@matcher.com",
        "password": "student123",
        "branch": "CSE",
        "cgpa": 8.69,
        "graduation_year": 2027,
        "preferred_location": "Hyderabad",
        "preferred_role": "Software Developer",
        "experience_level": "Fresher",
        "skills": ["Java", "Python", "SQL", "React", "Git", "REST APIs", "Data Structures", "OOP"]
    },
    {
        "name": "Aarav Sharma",
        "email": "aarav@matcher.com",
        "password": "student123",
        "branch": "CSE",
        "cgpa": 9.10,
        "graduation_year": 2026,
        "preferred_location": "Bangalore",
        "preferred_role": "Backend Engineer",
        "experience_level": "0-1 Years",
        "skills": ["Python", "Flask", "SQL", "Docker", "AWS", "Git", "Linux", "REST APIs", "Data Structures"]
    },
    {
        "name": "Sneha Patel",
        "email": "sneha@matcher.com",
        "password": "student123",
        "branch": "IT",
        "cgpa": 8.25,
        "graduation_year": 2026,
        "preferred_location": "Remote",
        "preferred_role": "Frontend Developer",
        "experience_level": "Fresher",
        "skills": ["JavaScript", "React", "HTML", "CSS", "TypeScript", "Git", "REST APIs"]
    },
    {
        "name": "Rohan Verma",
        "email": "rohan@matcher.com",
        "password": "student123",
        "branch": "ECE",
        "cgpa": 7.40,
        "graduation_year": 2027,
        "preferred_location": "Pune",
        "preferred_role": "Data Analyst",
        "experience_level": "Fresher",
        "skills": ["Python", "SQL", "MySQL", "Machine Learning", "Git"]
    },
    {
        "name": "Ananya Iyer",
        "email": "ananya@matcher.com",
        "password": "student123",
        "branch": "CSE",
        "cgpa": 8.85,
        "graduation_year": 2026,
        "preferred_location": "Hyderabad",
        "preferred_role": "Full Stack Developer",
        "experience_level": "0-1 Years",
        "skills": ["Java", "JavaScript", "React", "Node.js", "SQL", "Docker", "Git", "REST APIs"]
    }
]

JOBS_DATA = [
    {
        "title": "Software Developer Intern",
        "company": "Microsoft",
        "description": "Join Microsoft's Core Services Engineering team to build high-scale cloud-native applications and collaborative tools. You will implement robust object-oriented software and optimize relational database models.",
        "location": "Hyderabad",
        "job_type": "Internship",
        "experience_required": "Fresher",
        "minimum_cgpa": 7.50,
        "graduation_year": 2027,
        "eligible_branches": "CSE, IT, ECE",
        "salary_range": "₹80,000/month",
        "skills": ["Java", "SQL", "Python", "Data Structures", "Docker"]
    },
    {
        "title": "Associate Software Engineer",
        "company": "Google",
        "description": "Design and develop scalable distributed systems and backend architectures. Work closely with product and infrastructure teams to solve fundamental algorithmic challenges.",
        "location": "Bangalore",
        "job_type": "Full-time",
        "experience_required": "Fresher",
        "minimum_cgpa": 8.50,
        "graduation_year": 2026,
        "eligible_branches": "CSE, IT",
        "salary_range": "₹22 - 28 LPA",
        "skills": ["Python", "Data Structures", "C++", "Linux", "REST APIs"]
    },
    {
        "title": "Frontend Engineering Intern",
        "company": "Razorpay",
        "description": "Craft intuitive checkout interfaces and merchant dashboard experiences using modern React, state management, and responsive CSS. Focus on web performance and smooth user flows.",
        "location": "Remote",
        "job_type": "Internship",
        "experience_required": "Fresher",
        "minimum_cgpa": 7.00,
        "graduation_year": 2026,
        "eligible_branches": "All Branches",
        "salary_range": "₹45,000/month",
        "skills": ["React", "JavaScript", "HTML", "CSS", "TypeScript", "Git"]
    },
    {
        "title": "Backend Python Developer",
        "company": "Swiggy",
        "description": "Architect high-throughput delivery and logistics APIs. You will deploy microservices using Flask and containerize workloads using Docker on AWS cloud infrastructure.",
        "location": "Bangalore",
        "job_type": "Full-time",
        "experience_required": "0-1 Years",
        "minimum_cgpa": 7.50,
        "graduation_year": 2026,
        "eligible_branches": "CSE, IT, ECE",
        "salary_range": "₹14 - 18 LPA",
        "skills": ["Python", "Flask", "SQL", "Docker", "AWS", "REST APIs"]
    },
    {
        "title": "Full Stack Developer",
        "company": "CRED",
        "description": "Build high-speed, secure financial applications with React on the frontend and Java/Spring Boot or Node.js on the backend. Highly focused on clean UI/UX and microservice resilience.",
        "location": "Bangalore",
        "job_type": "Full-time",
        "experience_required": "0-1 Years",
        "minimum_cgpa": 8.00,
        "graduation_year": 2026,
        "eligible_branches": "CSE, IT",
        "salary_range": "₹18 - 24 LPA",
        "skills": ["React", "Java", "Node.js", "SQL", "Docker", "REST APIs"]
    },
    {
        "title": "Software Development Engineer (SDE-1)",
        "company": "Amazon",
        "description": "Deliver customer-facing features for Amazon retail and fulfillment platforms. Own development from system design through deployment and operational monitoring.",
        "location": "Hyderabad",
        "job_type": "Full-time",
        "experience_required": "Fresher",
        "minimum_cgpa": 7.80,
        "graduation_year": 2026,
        "eligible_branches": "CSE, IT, ECE",
        "salary_range": "₹20 - 25 LPA",
        "skills": ["Java", "OOP", "Data Structures", "AWS", "SQL"]
    },
    {
        "title": "Data Science & ML Intern",
        "company": "Flipkart",
        "description": "Develop predictive algorithms for search personalization, catalog classification, and customer demand forecasting using Python and Machine Learning pipelines.",
        "location": "Bangalore",
        "job_type": "Internship",
        "experience_required": "Fresher",
        "minimum_cgpa": 8.00,
        "graduation_year": 2027,
        "eligible_branches": "CSE, IT, ECE, Data Science",
        "salary_range": "₹60,000/month",
        "skills": ["Python", "Machine Learning", "SQL", "Data Structures", "Git"]
    },
    {
        "title": "Junior Cloud & DevOps Engineer",
        "company": "Cisco",
        "description": "Collaborate on CI/CD pipeline automation, container orchestration, and cloud infrastructure monitoring. Hands-on experience with Linux, Git, and Docker required.",
        "location": "Bangalore",
        "job_type": "Full-time",
        "experience_required": "Fresher",
        "minimum_cgpa": 7.00,
        "graduation_year": 2026,
        "eligible_branches": "All Branches",
        "salary_range": "₹12 - 15 LPA",
        "skills": ["Linux", "Docker", "Kubernetes", "AWS", "Git", "Python"]
    },
    {
        "title": "React Frontend Developer",
        "company": "PhonePe",
        "description": "Develop interactive and responsive web portals for digital payments and merchant settlements. Integrate secure REST APIs and write test-driven UI components.",
        "location": "Pune",
        "job_type": "Full-time",
        "experience_required": "Fresher",
        "minimum_cgpa": 7.20,
        "graduation_year": 2026,
        "eligible_branches": "CSE, IT, ECE",
        "salary_range": "₹12 - 16 LPA",
        "skills": ["React", "JavaScript", "HTML", "CSS", "REST APIs", "Git"]
    },
    {
        "title": "Systems Software Intern",
        "company": "Uber",
        "description": "Work on ultra-low latency dispatch algorithms and distributed cache architectures. Requires solid foundation in C/C++, Data Structures, and Linux systems programming.",
        "location": "Hyderabad",
        "job_type": "Internship",
        "experience_required": "Fresher",
        "minimum_cgpa": 8.20,
        "graduation_year": 2027,
        "eligible_branches": "CSE, IT, ECE",
        "salary_range": "₹90,000/month",
        "skills": ["C++", "C", "Data Structures", "Linux", "OOP"]
    },
    {
        "title": "Graduate Trainee Engineer",
        "company": "TCS",
        "description": "Comprehensive engineering training program covering modern web development, relational database queries, and enterprise software lifecycle management.",
        "location": "Hyderabad",
        "job_type": "Full-time",
        "experience_required": "Fresher",
        "minimum_cgpa": 6.50,
        "graduation_year": 2026,
        "eligible_branches": "All Branches",
        "salary_range": "₹4.5 - 7 LPA",
        "skills": ["Java", "SQL", "HTML", "CSS", "OOP"]
    },
    {
        "title": "Software Engineer - Data Platform",
        "company": "Zomato",
        "description": "Construct high-volume real-time ingestion pipelines and analytical dashboards for restaurant partners and logistics riders.",
        "location": "Delhi NCR",
        "job_type": "Full-time",
        "experience_required": "0-1 Years",
        "minimum_cgpa": 7.00,
        "graduation_year": 2026,
        "eligible_branches": "CSE, IT",
        "salary_range": "₹15 - 20 LPA",
        "skills": ["Python", "SQL", "MySQL", "REST APIs", "Git"]
    },
    {
        "title": "Web Application Developer Intern",
        "company": "Salesforce",
        "description": "Contribute to enterprise CRM portals using JavaScript and React. Gain industry mentorship while solving complex workflows for Fortune 500 customers.",
        "location": "Hyderabad",
        "job_type": "Internship",
        "experience_required": "Fresher",
        "minimum_cgpa": 7.50,
        "graduation_year": 2027,
        "eligible_branches": "CSE, IT, ECE",
        "salary_range": "₹55,000/month",
        "skills": ["JavaScript", "React", "HTML", "CSS", "REST APIs"]
    },
    {
        "title": "Backend Engineering Trainee",
        "company": "Infosys",
        "description": "Develop and maintain robust enterprise backend microservices. Write unit tests, optimize SQL stored procedures, and participate in code reviews.",
        "location": "Pune",
        "job_type": "Full-time",
        "experience_required": "Fresher",
        "minimum_cgpa": 6.80,
        "graduation_year": 2026,
        "eligible_branches": "All Branches",
        "salary_range": "₹5 - 8 LPA",
        "skills": ["Java", "SQL", "OOP", "Git"]
    },
    {
        "title": "Site Reliability Engineering Intern",
        "company": "Atlassian",
        "description": "Automate reliability diagnostics and system resilience benchmarks for Jira and Confluence cloud architectures. Master modern observability and Linux administration.",
        "location": "Remote",
        "job_type": "Internship",
        "experience_required": "Fresher",
        "minimum_cgpa": 7.80,
        "graduation_year": 2027,
        "eligible_branches": "CSE, IT",
        "salary_range": "₹75,000/month",
        "skills": ["Python", "Linux", "Docker", "AWS", "Git"]
    },
    {
        "title": "Software Engineer - Creative Cloud",
        "company": "Adobe",
        "description": "Build high-performance web tooling and digital canvas capabilities for Creative Cloud. Leverage TypeScript, modern JavaScript, and web graphics standards.",
        "location": "Bangalore",
        "job_type": "Full-time",
        "experience_required": "Fresher",
        "minimum_cgpa": 8.00,
        "graduation_year": 2026,
        "eligible_branches": "CSE, IT",
        "salary_range": "₹20 - 26 LPA",
        "skills": ["JavaScript", "TypeScript", "React", "Data Structures", "Git"]
    }
]

def seed_database():
    print("Initializing Database Schema...")
    init_db()

    db = get_db()
    try:
        with db.cursor() as cursor:
            print("Seeding Skills Catalog...")
            skill_id_map = {}
            for skill_name in SKILLS_LIST:
                cursor.execute(
                    "INSERT INTO skills (name) VALUES (%s) ON DUPLICATE KEY UPDATE name=name",
                    (skill_name,)
                )
                cursor.execute("SELECT id FROM skills WHERE name = %s", (skill_name,))
                skill_id_map[skill_name] = cursor.fetchone()['id']

            print("Seeding Admin User...")
            admin_pwd = generate_password_hash("admin123")
            cursor.execute("""
                INSERT INTO users (name, email, password_hash, role)
                VALUES ('System Administrator', 'admin@matcher.com', %s, 'admin')
                ON DUPLICATE KEY UPDATE password_hash=%s
            """, (admin_pwd, admin_pwd))

            print("Seeding Students and Profiles...")
            student_profile_ids = []
            for s in STUDENTS_DATA:
                pwd_hash = generate_password_hash(s['password'])
                cursor.execute("""
                    INSERT INTO users (name, email, password_hash, role)
                    VALUES (%s, %s, %s, 'student')
                    ON DUPLICATE KEY UPDATE name=%s, password_hash=%s
                """, (s['name'], s['email'], pwd_hash, s['name'], pwd_hash))

                cursor.execute("SELECT id FROM users WHERE email = %s", (s['email'],))
                user_id = cursor.fetchone()['id']

                cursor.execute("""
                    INSERT INTO student_profiles 
                    (user_id, branch, cgpa, graduation_year, preferred_location, preferred_role, experience_level)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE 
                        branch=%s, cgpa=%s, graduation_year=%s, preferred_location=%s,
                        preferred_role=%s, experience_level=%s
                """, (user_id, s['branch'], s['cgpa'], s['graduation_year'], s['preferred_location'], s['preferred_role'], s['experience_level'],
                      s['branch'], s['cgpa'], s['graduation_year'], s['preferred_location'], s['preferred_role'], s['experience_level']))

                cursor.execute("SELECT id FROM student_profiles WHERE user_id = %s", (user_id,))
                profile_id = cursor.fetchone()['id']
                student_profile_ids.append((profile_id, s))

                # Insert student skills
                for sk in s['skills']:
                    if sk in skill_id_map:
                        cursor.execute("""
                            INSERT IGNORE INTO student_skills (student_id, skill_id)
                            VALUES (%s, %s)
                        """, (profile_id, skill_id_map[sk]))

            print("Seeding Jobs & Required Skills...")
            job_ids = []
            for j in JOBS_DATA:
                cursor.execute("""
                    INSERT INTO jobs (title, company, description, location, job_type, 
                                      experience_required, minimum_cgpa, graduation_year, eligible_branches, salary_range)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE description=%s, salary_range=%s
                """, (j['title'], j['company'], j['description'], j['location'], j['job_type'],
                      j['experience_required'], j['minimum_cgpa'], j['graduation_year'], j['eligible_branches'], j['salary_range'],
                      j['description'], j['salary_range']))

                cursor.execute("SELECT id FROM jobs WHERE title = %s AND company = %s", (j['title'], j['company']))
                job_id = cursor.fetchone()['id']
                job_ids.append(job_id)

                for sk in j['skills']:
                    if sk in skill_id_map:
                        cursor.execute("""
                            INSERT IGNORE INTO job_skills (job_id, skill_id)
                            VALUES (%s, %s)
                        """, (job_id, skill_id_map[sk]))

            print("Seeding Realistic Applications...")
            # Assign varied application statuses for first student (Poojitha) and others
            poojitha_profile_id = student_profile_ids[0][0]
            applications_to_seed = [
                (poojitha_profile_id, job_ids[0], "Interviewing"), # Microsoft Intern
                (poojitha_profile_id, job_ids[5], "Under Review"), # Amazon SDE
                (poojitha_profile_id, job_ids[2], "Applied"),      # Razorpay Intern
                (poojitha_profile_id, job_ids[9], "Accepted"),     # Uber Systems Intern
                (poojitha_profile_id, job_ids[10], "Rejected"),    # TCS Trainee
            ]

            # Add applications for Aarav (index 1) and Sneha (index 2)
            aarav_profile_id = student_profile_ids[1][0]
            applications_to_seed.extend([
                (aarav_profile_id, job_ids[1], "Under Review"),    # Google
                (aarav_profile_id, job_ids[3], "Interviewing"),    # Swiggy
                (aarav_profile_id, job_ids[7], "Accepted")         # Cisco
            ])

            sneha_profile_id = student_profile_ids[2][0]
            applications_to_seed.extend([
                (sneha_profile_id, job_ids[2], "Interviewing"),    # Razorpay
                (sneha_profile_id, job_ids[8], "Applied"),         # PhonePe
                (sneha_profile_id, job_ids[15], "Under Review")    # Adobe
            ])

            for s_id, j_id, status in applications_to_seed:
                cursor.execute("""
                    INSERT INTO applications (student_id, job_id, status)
                    VALUES (%s, %s, %s)
                    ON DUPLICATE KEY UPDATE status=%s
                """, (s_id, j_id, status, status))

            print("Seeding Saved Jobs...")
            saved_to_seed = [
                (poojitha_profile_id, job_ids[1]),  # Google
                (poojitha_profile_id, job_ids[4]),  # CRED
                (poojitha_profile_id, job_ids[12]), # Salesforce
                (aarav_profile_id, job_ids[0]),     # Microsoft
                (sneha_profile_id, job_ids[4]),     # CRED
            ]
            for s_id, j_id in saved_to_seed:
                cursor.execute("""
                    INSERT IGNORE INTO saved_jobs (student_id, job_id)
                    VALUES (%s, %s)
                """, (s_id, j_id))

        print("\n==============================================")
        print("DATABASE SEEDING COMPLETED SUCCESSFULLY!")
        print("==============================================")
        print(f"Skills Seeded: {len(SKILLS_LIST)}")
        print(f"Jobs Seeded: {len(JOBS_DATA)}")
        print(f"Students Seeded: {len(STUDENTS_DATA)}")
        print("Admin Account: admin@matcher.com / admin123")
        print("Demo Student Account: poojitha@matcher.com / student123")
        print("==============================================\n")
    finally:
        db.close()

if __name__ == '__main__':
    seed_database()

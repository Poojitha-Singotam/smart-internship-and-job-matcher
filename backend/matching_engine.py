from config import Config

def calculate_match(student, job):
    """
    Explainable Rule-Based Matching Engine for Student-Job Pairs.
    Calculates an objective match score (0 - 100) and produces
    detailed breakdown and human-readable explanation points.
    
    Weights configured in config.py:
      - Skills: 40 pts
      - Eligibility (CGPA + Grad Year): 25 pts
      - Education (Branch): 15 pts
      - Role Preference: 10 pts
      - Location Preference: 5 pts
      - Experience: 5 pts
    """
    weights = Config.MATCHING_WEIGHTS
    elig_sub = Config.ELIGIBILITY_SUBWEIGHTS

    strengths = []
    gaps = []

    # ----------------------------------------------------
    # 1. SKILLS MATCH (Max 40 points)
    # ----------------------------------------------------
    student_skills_raw = student.get('skills', []) or []
    job_skills_raw = job.get('required_skills', []) or []

    # Case-insensitive mapping preserving original skill names
    student_skills_dict = {s.strip().lower(): s.strip() for s in student_skills_raw if s and s.strip()}
    job_skills_dict = {s.strip().lower(): s.strip() for s in job_skills_raw if s and s.strip()}

    matched_keys = set(student_skills_dict.keys()) & set(job_skills_dict.keys())
    missing_keys = set(job_skills_dict.keys()) - set(student_skills_dict.keys())
    extra_keys = set(student_skills_dict.keys()) - set(job_skills_dict.keys())

    matched_skills = sorted([job_skills_dict[k] for k in matched_keys])
    missing_skills = sorted([job_skills_dict[k] for k in missing_keys])
    extra_skills = sorted([student_skills_dict[k] for k in extra_keys])

    max_skills_pts = weights.get('skills', 40)
    if not job_skills_dict:
        # If job has no specific skills tagged, full score
        skills_score = float(max_skills_pts)
        strengths.append("No specialized technical skills strictly mandated")
    else:
        coverage = len(matched_keys) / len(job_skills_dict)
        skills_score = round(coverage * max_skills_pts, 1)
        if matched_skills:
            strengths.append(f"Matched {len(matched_skills)} of {len(job_skills_dict)} required skills: {', '.join(matched_skills)}")
        if missing_skills:
            gaps.append(f"Missing {len(missing_skills)} required skill(s): {', '.join(missing_skills)}")

    # ----------------------------------------------------
    # 2. ELIGIBILITY MATCH (Max 25 points)
    #    - CGPA: 15 pts
    #    - Graduation Year: 10 pts
    # ----------------------------------------------------
    max_cgpa_pts = elig_sub.get('cgpa', 15)
    max_grad_pts = elig_sub.get('graduation_year', 10)

    student_cgpa = float(student.get('cgpa', 0.0) or 0.0)
    min_cgpa = float(job.get('minimum_cgpa', 0.0) or 0.0)

    cgpa_met = False
    if min_cgpa <= 0.0:
        cgpa_score = float(max_cgpa_pts)
        cgpa_met = True
        strengths.append("No minimum CGPA requirement")
    elif student_cgpa >= min_cgpa:
        cgpa_score = float(max_cgpa_pts)
        cgpa_met = True
        strengths.append(f"CGPA {student_cgpa:.2f} satisfies minimum requirement ({min_cgpa:.2f})")
    elif (min_cgpa - student_cgpa) <= 0.5:
        cgpa_score = round(max_cgpa_pts * 0.5, 1)
        gaps.append(f"CGPA {student_cgpa:.2f} is slightly below minimum requirement ({min_cgpa:.2f})")
    else:
        cgpa_score = 0.0
        gaps.append(f"CGPA {student_cgpa:.2f} does not meet requirement ({min_cgpa:.2f})")

    student_grad = int(student.get('graduation_year', 0) or 0)
    job_grad = int(job.get('graduation_year', 0) or 0)

    grad_year_met = False
    if job_grad <= 0:
        grad_score = float(max_grad_pts)
        grad_year_met = True
    elif student_grad == job_grad:
        grad_score = float(max_grad_pts)
        grad_year_met = True
        strengths.append(f"Graduation year {student_grad} matches requirement ({job_grad})")
    elif abs(student_grad - job_grad) == 1:
        grad_score = round(max_grad_pts * 0.5, 1)
        strengths.append(f"Graduation year {student_grad} is close to target batch ({job_grad})")
    else:
        grad_score = 0.0
        gaps.append(f"Target graduation batch is {job_grad} (your batch: {student_grad})")

    eligibility_score = round(cgpa_score + grad_score, 1)

    # ----------------------------------------------------
    # 3. EDUCATION / BRANCH (Max 15 points)
    # ----------------------------------------------------
    max_edu_pts = weights.get('education', 15)
    student_branch = (student.get('branch', '') or '').strip().upper()
    eligible_branches_raw = (job.get('eligible_branches', '') or '').strip().upper()

    branch_met = False
    if not eligible_branches_raw or 'ALL' in eligible_branches_raw or 'ANY' in eligible_branches_raw:
        education_score = float(max_edu_pts)
        branch_met = True
        strengths.append(f"Open to all branches (Your branch: {student_branch or 'General'})")
    else:
        branch_list = [b.strip() for b in eligible_branches_raw.replace(';', ',').replace('/', ',').split(',') if b.strip()]
        if student_branch in branch_list:
            education_score = float(max_edu_pts)
            branch_met = True
            strengths.append(f"Branch '{student_branch}' is directly eligible")
        elif any(student_branch in b or b in student_branch for b in branch_list):
            education_score = round(max_edu_pts * 0.8, 1)
            branch_met = True
            strengths.append(f"Branch '{student_branch}' is related to eligible branches ({eligible_branches_raw})")
        else:
            education_score = 0.0
            gaps.append(f"Eligible branches: {eligible_branches_raw} (Your branch: {student_branch})")

    # ----------------------------------------------------
    # 4. ROLE PREFERENCE (Max 10 points)
    # ----------------------------------------------------
    max_role_pts = weights.get('role_preference', 10)
    student_role = (student.get('preferred_role', '') or '').strip().lower()
    job_title = (job.get('title', '') or '').strip().lower()

    role_met = False
    if not student_role or student_role == 'any':
        role_score = round(max_role_pts * 0.7, 1)
        role_met = True
    elif student_role == job_title:
        role_score = float(max_role_pts)
        role_met = True
        strengths.append(f"Preferred role aligns exactly: '{job.get('title')}'")
    elif any(word in job_title for word in student_role.split()) or any(word in student_role for word in job_title.split()):
        role_score = round(max_role_pts * 0.8, 1)
        role_met = True
        strengths.append(f"Job title aligns with preferred domain: '{student.get('preferred_role')}'")
    else:
        role_score = 0.0
        gaps.append(f"Role title '{job.get('title')}' differs from preferred role '{student.get('preferred_role')}'")

    # ----------------------------------------------------
    # 5. LOCATION PREFERENCE (Max 5 points)
    # ----------------------------------------------------
    max_loc_pts = weights.get('location_preference', 5)
    student_loc = (student.get('preferred_location', '') or '').strip().lower()
    job_loc = (job.get('location', '') or '').strip().lower()

    loc_met = False
    if not student_loc or student_loc in ['any', 'flexible']:
        location_score = float(max_loc_pts)
        loc_met = True
    elif 'remote' in job_loc or 'remote' in student_loc:
        location_score = float(max_loc_pts)
        loc_met = True
        strengths.append("Remote friendly location")
    elif student_loc in job_loc or job_loc in student_loc:
        location_score = float(max_loc_pts)
        loc_met = True
        strengths.append(f"Location preference matches: {job.get('location')}")
    else:
        location_score = 0.0
        gaps.append(f"Job location '{job.get('location')}' differs from preferred '{student.get('preferred_location')}'")

    # ----------------------------------------------------
    # 6. EXPERIENCE (Max 5 points)
    # ----------------------------------------------------
    max_exp_pts = weights.get('experience', 5)
    student_exp = (student.get('experience_level', '') or '').strip().lower()
    job_exp = (job.get('experience_required', '') or '').strip().lower()

    exp_met = False
    if not job_exp or 'fresher' in job_exp or '0' in job_exp:
        experience_score = float(max_exp_pts)
        exp_met = True
        strengths.append("Fresher friendly / Entry-level role")
    elif student_exp == job_exp or (student_exp and student_exp in job_exp):
        experience_score = float(max_exp_pts)
        exp_met = True
        strengths.append(f"Experience level matched: {job.get('experience_required')}")
    else:
        experience_score = 0.0
        gaps.append(f"Experience required: {job.get('experience_required')} (Your profile: {student.get('experience_level') or 'Fresher'})")

    # ----------------------------------------------------
    # TOTAL SCORE CALCULATION
    # ----------------------------------------------------
    total_raw = skills_score + eligibility_score + education_score + role_score + location_score + experience_score
    total_score = min(100, max(0, int(round(total_raw))))

    return {
        'total_score': total_score,
        'max_score': 100,
        'percentage': total_score,
        'breakdown': {
            'skills': {
                'score': skills_score,
                'max': max_skills_pts,
                'matched': matched_skills,
                'missing': missing_skills,
                'student_extra': extra_skills
            },
            'eligibility': {
                'score': eligibility_score,
                'max': weights.get('eligibility', 25),
                'cgpa_met': cgpa_met,
                'student_cgpa': student_cgpa,
                'required_cgpa': min_cgpa,
                'grad_year_met': grad_year_met,
                'student_grad_year': student_grad,
                'required_grad_year': job_grad
            },
            'education': {
                'score': education_score,
                'max': max_edu_pts,
                'branch_met': branch_met,
                'student_branch': student.get('branch', 'CSE'),
                'eligible_branches': job.get('eligible_branches', 'All Branches')
            },
            'role_preference': {
                'score': role_score,
                'max': max_role_pts,
                'matched': role_met,
                'preferred_role': student.get('preferred_role', ''),
                'job_title': job.get('title', '')
            },
            'location_preference': {
                'score': location_score,
                'max': max_loc_pts,
                'matched': loc_met,
                'preferred_location': student.get('preferred_location', ''),
                'job_location': job.get('location', '')
            },
            'experience': {
                'score': experience_score,
                'max': max_exp_pts,
                'matched': exp_met,
                'student_exp': student.get('experience_level', 'Fresher'),
                'required_exp': job.get('experience_required', 'Fresher')
            }
        },
        'explanation': {
            'strengths': strengths,
            'gaps': gaps
        }
    }

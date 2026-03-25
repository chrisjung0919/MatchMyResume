from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS

# Curated skill list (expandable)
SKILLS = [
    "python", "java", "c++", "javascript", "react", "node",
    "docker", "aws", "sql", "flask", "django", "html", "css",
    "git", "linux", "mongodb", "tensorflow", "pandas", "numpy"
]

def extract_skills(text):
    text = text.lower()

    found_skills = set()

    for skill in SKILLS:
        if skill in text:
            found_skills.add(skill)

    return found_skills

def calculate_match(resume_text: str, job_description: str):
    resume_skills = extract_skills(resume_text)
    job_skills = extract_skills(job_description)

    if not job_skills:
        return {
            "match_score": 0,
            "matched_keywords": [],
            "missing_keywords": []
        }

    matched = resume_skills.intersection(job_skills)
    missing = job_skills - resume_skills

    # NEW SCORING FORMULA
    match_score = round((len(matched) / len(job_skills)) * 100, 2)

    return {
        "match_score": match_score,
        "matched_keywords": list(matched),
        "missing_keywords": list(missing)
    }
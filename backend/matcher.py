from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS
from skills import SKILLS

def extract_skills(text):
    text = text.lower()

    found_skills = set()

    for canonical_skill, synonyms in SKILLS.items():

        for synonym in synonyms:

            if synonym in text:
                found_skills.add(canonical_skill)
                break

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
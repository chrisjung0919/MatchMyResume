from skills import SKILLS

def generate_feedback(resume_text: str, job_description: str):
    resume = resume_text.lower()
    job = job_description.lower()

    strengths = []
    weaknesses = []
    suggestions = []

    for canonical_skill, synonyms in SKILLS.items():

        resume_has = any(synonym in resume for synonym in synonyms)
        job_has = any(synonym in job for synonym in synonyms)

        if resume_has and job_has:
            strengths.append(
                f"Strong experience with {canonical_skill.title()}"
            )

        elif job_has and not resume_has:
            weaknesses.append(
                f"{canonical_skill.title()} — Missing"
            )

            suggestions.append(
                f"Consider adding a project or experience with {canonical_skill.title()}"
            )

    if not weaknesses:
        suggestions.append(
            "Your resume matches the required skills well."
        )
        suggestions.append(
            "Use measurable achievements (e.g., 'Improved performance by 25%')."
        )
        suggestions.append(
            "Tailor your resume summary to the target position."
        )

    return f"""
Strengths:
- {"\n- ".join(strengths) if strengths else "None"}

Weaknesses:
- {"\n- ".join(weaknesses) if weaknesses else "None"}

Suggestions:
- {"\n- ".join(suggestions) if suggestions else "None"}
"""
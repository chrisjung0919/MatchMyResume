def generate_feedback(resume_text: str, job_description: str):
    resume = resume_text.lower()
    job = job_description.lower()

    strengths = []
    weaknesses = []
    suggestions = []

    # Skills to check
    skills = ["python", "react", "aws", "docker", "sql", "flask"]

    for skill in skills:
        if skill in resume and skill in job:
            strengths.append(f"Strong experience with {skill}")
        elif skill in job and skill not in resume:
            weaknesses.append(f"{skill} — Missing")
            suggestions.append(f"Consider adding a project or experience with {skill}")

    # General feedback
    if "project" not in resume:
        weaknesses.append("No clear project experience mentioned")
        suggestions.append("Add 1-2 strong projects to your resume")

    if "experience" not in resume:
        weaknesses.append("Lack of work experience")
        suggestions.append("Include internships or relevant experience")

    return f"""
Strengths:
- {"\n- ".join(strengths) if strengths else "None"}

Weaknesses:
- {"\n- ".join(weaknesses) if weaknesses else "None"}

Suggestions:
- {"\n- ".join(suggestions) if suggestions else "None"}
"""
import os

from google import genai
from google.genai import types


API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is missing. Set it before starting the backend."
    )

client = genai.Client(api_key=API_KEY)


def generate_feedback(resume_text: str, job_description: str) -> str:
    """Generate detailed resume feedback using the Gemini API."""

    resume_text = resume_text.strip()
    job_description = job_description.strip()

    if not resume_text:
        raise ValueError("Resume text cannot be empty.")

    if not job_description:
        raise ValueError("Job description cannot be empty.")

    prompt = f"""
    Compare this resume against the job description.

    Return exactly these three sections. Each section must contain at least
    two bullet points.

    Strengths:
    - Relevant experience, skills, or projects that match the job
    - Specific evidence from the resume

    Weaknesses:
    - Missing requirements, unclear qualifications, or weak evidence
    - Areas where the resume does not fully match the job

    Suggestions:
    - Specific and honest improvements
    - Include one improved resume bullet example

    Rules:
    - Do not invent experience or skills.
    - Do not use Markdown bold text.
    - Do not omit any section.
    - Keep every bullet concise.

    RESUME:
    {resume_text}

    JOB DESCRIPTION:
    {job_description}
    """

    try:
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=(
                    "You are an experienced technical recruiter and resume "
                    "reviewer. Give accurate, evidence-based feedback and "
                    "never invent candidate qualifications."
                ),
                temperature=0.3,
                max_output_tokens=3000,
            ),
        )

        if not response.text or not response.text.strip():
            raise RuntimeError("Gemini returned an empty response.")

        return response.text.strip()

    except Exception as error:
        print(f"Gemini API error: {repr(error)}")
        raise
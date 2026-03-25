from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File
from resume_parser import extract_text_from_pdf
from matcher import calculate_match
from ai_feedback import generate_feedback

app = FastAPI(title="AI Resume Analyzer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        return {"error": "Please upload a PDF file"}

    resume_text = extract_text_from_pdf(file.file)

    return {
        "filename": file.filename,
        "text_preview": resume_text
    }

from fastapi import Body

@app.post("/analyze")
async def analyze(data: dict = Body(...)):
    resume_text = data.get("resume_text", "")
    job_description = data.get("job_description", "")

    result = calculate_match(resume_text, job_description)

    # AI feedback
    feedback = generate_feedback(resume_text, job_description)

    return {
        **result,
        "ai_feedback": feedback
    }
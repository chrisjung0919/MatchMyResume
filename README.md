# Match My Resume - AI Resume Analyzer

A full-stack AI-powered web application that analyzes resumes against job descriptions and provides ATS-style scoring, AI-generated feedback, and resume improvement suggestions using Google Gemini.

## 🌐 Live Demo
https://matchmyresumefree.netlify.app/

---

## 🚀 Features
- Upload resume (PDF)
- Match against job descriptions
- ATS-style keyword matching and scoring
- AI-generated strengths, weaknesses, and resume improvement suggestions
- Interactive UI with real-time feedback

---

## 🛠 Tech Stack
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** FastAPI (Python)
- **AI:** Google Gemini API
- **Deployment:** Netlify (Frontend), Render (Backend)

---

## ⚙️ How It Works
1. Upload your resume.
2. Paste a job description.
3. The backend extracts text from the resume.
4. The system compares resume keywords with the job description to calculate an ATS-style match score.
5. Google Gemini generates personalized strengths, weaknesses, and resume improvement suggestions.
6. Results are displayed in the web interface.

---

## 🎥 Demo
![MatchMyResume Web Demo](matchmyresumerecording.gif)

---

## 📦 Installation (Local Setup)

### Backend
```bash
cd backend
python -m venv venv

# macOS/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt

export GEMINI_API_KEY="YOUR_API_KEY"   # macOS/Linux
# or
set GEMINI_API_KEY=YOUR_API_KEY        # Windows

uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
python3 -m http.server 5500
```

Open:

```
http://127.0.0.1:5500
```

---

## 💡 Future Improvements
- Resume rewrite suggestions
- Job link parsing (auto-fetch job descriptions)
- Support for DOCX resumes
- Export AI feedback as PDF
- User authentication and saved analysis history

---

## 👨‍💻 Author

**Chris Jung**  
Applied Mathematics @ UC Berkeley

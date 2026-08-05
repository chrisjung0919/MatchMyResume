let selectedFile = null;

const dropZone = document.getElementById("drop-zone");
const scoreText = document.getElementById("score-text");
const resultContainer = document.getElementById("result-container");

// Allow clicking the drop zone to select a PDF
const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.accept = "application/pdf";
fileInput.hidden = true;
document.body.appendChild(fileInput);

dropZone.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];

    if (file) {
        selectFile(file);
    }
});

dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropZone.classList.remove("dragover");

    const file = event.dataTransfer.files[0];

    if (file) {
        selectFile(file);
    }
});

function selectFile(file) {
    if (file.type !== "application/pdf") {
        alert("Please select a PDF file.");
        selectedFile = null;
        return;
    }

    selectedFile = file;
    dropZone.innerHTML = `<p>${file.name}</p>`;
}

function formatToList(text) {
    if (!text) {
        return "<p>None provided.</p>";
    }

    const items = text
        .split(/\n|-\s|•\s/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

    return `
        <ul>
            ${items.map((item) => `<li>${item}</li>`).join("")}
        </ul>
    `;
}

async function analyze() {
    const jobDescription = document.getElementById("job").value.trim();

    if (!selectedFile) {
        alert("Please upload a PDF resume first.");
        return;
    }

    if (!jobDescription) {
        alert("Please paste a job description.");
        return;
    }

    resultContainer.style.display = "block";
    scoreText.innerText = "Loading...";
    document.getElementById("result").innerHTML = "";
    document.getElementById("verdict").innerText = "";

    try {
        // Step 1: Upload the resume
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadResponse = await fetch(
            "https://matchmyresume-nosi.onrender.com/upload-resume",
            {
                method: "POST",
                body: formData
            }
        );

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            throw new Error(
                `Resume upload failed (${uploadResponse.status}): ${errorText}`
            );
        }

        const uploadData = await uploadResponse.json();

        if (!uploadData.text_preview) {
            throw new Error("The backend did not return extracted resume text.");
        }

        // Step 2: Analyze the extracted text
        const analysisResponse = await fetch(
            "https://matchmyresume-nosi.onrender.com/analyze",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    resume_text: uploadData.text_preview,
                    job_description: jobDescription
                })
            }
        );

        if (!analysisResponse.ok) {
            const errorText = await analysisResponse.text();
            throw new Error(
                `Resume analysis failed (${analysisResponse.status}): ${errorText}`
            );
        }

        const data = await analysisResponse.json();
        displayResults(data);
    } catch (error) {
        console.error("Analysis error:", error);

        scoreText.innerText = "Error";
        scoreText.style.color = "#ef4444";

        document.getElementById("result").innerHTML = `
            <div class="card weaknesses">
                <h3>Analysis failed</h3>
                <p>${error.message}</p>
                <p>Please try again or check whether the backend is running.</p>
            </div>
        `;
    }
}

function displayResults(data) {
    const score = Number(data.match_score ?? 0);

    const circle = document.getElementById("progress-circle");
    const radius = 65;
    const circumference = 2 * Math.PI * radius;

    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = circumference;

    let color = "#4CAF50";

    if (score < 40) {
        color = "#f44336";
    } else if (score < 70) {
        color = "#ff9800";
    }

    circle.style.color = color;
    circle.style.stroke = color;
    scoreText.style.color = color;

    let current = 0;
    const duration = 800;
    const stepTime = 10;
    const steps = duration / stepTime;
    const increment = score / steps;

    const interval = setInterval(() => {
        current += increment;

        if (current >= score) {
            current = score;
            clearInterval(interval);
        }

        const offset = circumference - (current / 100) * circumference;
        circle.style.strokeDashoffset = offset;
        scoreText.innerText = `${Math.round(current)}%`;
    }, stepTime);

    const verdictBox = document.getElementById("verdict");

    if (score >= 70) {
        verdictBox.innerText = "✅ Strong Match – You are ready to apply!";
        verdictBox.className = "verdict-box verdict-strong";
    } else if (score >= 40) {
        verdictBox.innerText = "⚠️ Moderate Match – Needs some improvement.";
        verdictBox.className = "verdict-box verdict-medium";
    } else {
        verdictBox.innerText =
            "❌ Weak Match – Improve your resume before applying.";
        verdictBox.className = "verdict-box verdict-weak";
    }

    const feedback = data.ai_feedback || "";

    const strengthsRaw = feedback
        .split("Weaknesses:")[0]
        .replace("Strengths:", "")
        .trim();

    const weaknessesRaw = feedback
        .split("Weaknesses:")[1]
        ?.split("Suggestions:")[0]
        ?.trim();

    const suggestionsRaw = feedback
        .split("Suggestions:")[1]
        ?.trim();

    const matchedKeywords = Array.isArray(data.matched_keywords)
        ? data.matched_keywords
        : [];

    const missingKeywords = Array.isArray(data.missing_keywords)
        ? data.missing_keywords
        : [];

    const matchedTags = matchedKeywords
        .map((keyword) => `<span class="tag matched">${keyword}</span>`)
        .join("");

    const missingTags = missingKeywords
        .map((keyword) => `<span class="tag missing">${keyword}</span>`)
        .join("");

    document.getElementById("result").innerHTML = `
        <div class="card strengths">
            <h3>✅ Strengths</h3>
            ${formatToList(strengthsRaw)}
        </div>

        <div class="card weaknesses">
            <h3>❌ Weaknesses</h3>
            ${formatToList(weaknessesRaw)}
        </div>

        <div class="card suggestions">
            <h3>💡 Suggestions</h3>
            ${formatToList(suggestionsRaw)}
        </div>

        <div class="card">
            <h3>📊 Match Summary</h3>
            <p><strong>Matched:</strong><br>
                ${matchedTags || "None"}
            </p>
            <p><strong>Missing:</strong><br>
                ${missingTags || "None"}
            </p>
        </div>
    `;
}
let selectedFile = null;

const dropZone = document.getElementById("drop-zone");

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");

    const file = e.dataTransfer.files[0];

    if (file.type !== "application/pdf") {
        alert("Only PDF files allowed");
        return;
    }

    selectedFile = file;
    dropZone.innerHTML = `<p>${file.name}</p>`;
});

// Drag over
dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
});

// Drag leave
dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
});

// Drop file
dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");

    selectedFile = e.dataTransfer.files[0];
    dropZone.innerHTML = `<p>${selectedFile.name}</p>`;
});

function formatToList(text) {
    if (!text) return "<p>None</p>";

    const items = text
        .split(/\n|-\s|•\s/)   // handles newline, "-" or "•"
        .map(s => s.trim())
        .filter(s => s.length > 0);

    return `
        <ul>
            ${items.map(item => `<li>${item}</li>`).join("")}
        </ul>
    `;
}

// Analyze
async function analyze() {

    document.getElementById("result-container").style.display = "block";

    document.getElementById("score-text").innerText = "Loading...";

    const job = document.getElementById("job").value;

    if (selectedFile && selectedFile.type !== "application/pdf") {
        alert("Only PDF files allowed");
        selectedFile = null;
        return;
    }

    // Upload PDF
    const formData = new FormData();
    formData.append("file", selectedFile);

    const uploadResponse = await fetch("http://127.0.0.1:8000/upload-resume", {
        method: "POST",
        body: formData
    });

    const uploadData = await uploadResponse.json();
    const resumeText = uploadData.text_preview;

    if (!uploadResponse.ok) {
        alert("Error uploading resume");
        return;
    }

    // Analyze
    const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            resume_text: resumeText,
            job_description: job
        })
    });

    if (!response.ok) {
        alert("Error analyzing resume");
        return;
    }

    const data = await response.json();

    const score = data.match_score;

    // Circle progress
    const circle = document.getElementById("progress-circle");
    const radius = 65;
    const circumference = 2 * Math.PI * radius;

    circle.style.strokeDasharray = `${circumference}`;

    // Animate fill
    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = circumference;

    let current = 0;
    const duration = 800; // animation speed (ms)
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

        document.getElementById("score-text").innerText = `${Math.round(current)}%`;
    }, stepTime);

    // Color logic
    let color = "#4CAF50"; // green
    if (score < 40) color = "#f44336"; // red
    else if (score < 70) color = "#ff9800"; // orange

    circle.style.color = color;   // controls glow
    circle.style.stroke = color;  // controls line

    // Update score text
    document.getElementById("score-text").innerText = `${score}%`;

    // Make score text color match
    document.getElementById("score-text").style.color = color;

    const verdictBox = document.getElementById("verdict");

    let verdictText = "";
    let verdictClass = "";

    // Determine verdict
    if (score >= 70) {
        verdictText = "✅ Strong Match – You are ready to apply!";
        verdictClass = "verdict-strong";
    } else if (score >= 40) {
        verdictText = "⚠️ Moderate Match – Needs some improvement.";
        verdictClass = "verdict-medium";
    } else {
        verdictText = "❌ Weak Match – Improve your resume before applying.";
        verdictClass = "verdict-weak";
    }

    // Apply to UI
    verdictBox.innerText = verdictText;
    verdictBox.className = `verdict-box ${verdictClass}`;

    const feedback = data.ai_feedback || "";

    // Split sections
    const strengthsRaw = feedback.split("Weaknesses:")[0]
        ?.replace("Strengths:", "")
        .trim();

    const weaknessesRaw = feedback.split("Weaknesses:")[1]
        ?.split("Suggestions:")[0]
        ?.trim();

    const suggestionsRaw = feedback.split("Suggestions:")[1]?.trim();

    // Convert to lists
    const strengthsHTML = formatToList(strengthsRaw);
    const weaknessesHTML = formatToList(weaknessesRaw);
    const suggestionsHTML = formatToList(suggestionsRaw);

    // Create skill tags
    const matchedTags = data.matched_keywords.map(k => 
        `<span class="tag matched">${k}</span>`
    ).join("");

    const missingTags = data.missing_keywords.map(k => 
        `<span class="tag missing">${k}</span>`
    ).join("");

    // Render UI
    document.getElementById("result").innerHTML = `
        <div class="card strengths">
            <h3>✅ Strengths</h3>
            ${strengthsHTML}
        </div>

        <div class="card weaknesses">
            <h3>❌ Weaknesses</h3>
            ${weaknessesHTML}
        </div>

        <div class="card suggestions">
            <h3>💡 Suggestions</h3>
            ${suggestionsHTML}
        </div>

        <div class="card">
            <h3>📊 Match Summary</h3>
            <p><strong>Matched:</strong><br>${matchedTags}</p>
            <p><strong>Missing:</strong><br>${missingTags}</p>
        </div>
    `;
}
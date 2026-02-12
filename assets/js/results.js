import { auth, db } from "./firebase-config.js";
import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const resultGrid = document.querySelector(".results-grid");

// Get subject user wants to view
const subject = sessionStorage.getItem("viewSubject");

if (!subject) {
  window.location.href = "dashboard.html";
}

auth.onAuthStateChanged(async (user) => {
  if (!user) return;

  try {
    const q = query(
      collection(db, "results"),
      where("userId", "==", user.uid),
      where("subject", "==", subject)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      alert("Result not found.");
      window.location.href = "dashboard.html";
      return;
    }

    const result = snap.docs[0].data();

    // 🔒 Block unreleased results
    if (!result.released) {
      alert("Result has not been released yet.");
      window.location.href = "dashboard.html";
      return;
    }

    // ✅ Show result
    resultGrid.innerHTML = `
      <div class="result-card">
        <div class="circle" style="--percent:${result.percentage}">
          <span>${result.percentage}%</span>
        </div>

        <h3>${subject}</h3>

        <p style="margin-top:8px;font-size:0.85rem;color:#ccc;">
          Score: ${result.score} / ${result.total}
        </p>

        <button id="correctionBtn" class="secondary-btn" style="margin-top:15px;">
          Corrections
        </button>
      </div>
    `;

// Handle corrections navigation
const correctionBtn = document.getElementById("correctionBtn");

correctionBtn.addEventListener("click", () => {
  sessionStorage.setItem("viewCorrections", subject);
  window.location.href = "corrections.html";
});

  } catch (error) {
    console.error(error);
    alert("Error loading result");
  }
});
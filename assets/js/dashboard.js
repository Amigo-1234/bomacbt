import { auth, db } from "./firebase-config.js";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const welcomeText = document.getElementById("welcomeText");
const subjectsList = document.getElementById("subjectsList");
const completedCountEl = document.getElementById("completedCount");
const subjectCountEl = document.getElementById("subjectCount");
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", async () => {
  await auth.signOut();
  window.location.href = "candidate-login.html";
});

auth.onAuthStateChanged(async (user) => {
  if (!user) return;

  // =========================
  // FETCH USER DATA
  // =========================
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return;

  const userData = userSnap.data();

  // Force subject registration
  if (!userData.jupebRegistered) {
    window.location.href = "subject-registration.html";
    return;
  }

  welcomeText.textContent = `Welcome, ${userData.fullName}`;
  subjectCountEl.textContent = userData.subjects.length;

  // =========================
  // FETCH USER RESULTS
  // =========================
  const resultsQuery = query(
    collection(db, "results"),
    where("userId", "==", user.uid)
  );

  const resultsSnap = await getDocs(resultsQuery);

  // Map subject → result state
  const resultMap = {};
  resultsSnap.forEach(doc => {
    const data = doc.data();
    resultMap[data.subject] = data.released ? "released" : "pending";
  });

  completedCountEl.textContent = resultsSnap.size;

  // =========================
  // RENDER SUBJECT CARDS
  // =========================
  subjectsList.innerHTML = "";

  userData.subjects.forEach(subject => {

    const status = resultMap[subject]; // undefined | pending | released

    const card = document.createElement("div");
    card.className = "subject-card";

    const info = document.createElement("div");
    info.className = "subject-info";

    const title = document.createElement("h4");
    title.textContent = subject;

    const badge = document.createElement("span");
    badge.className = "badge";

    const btn = document.createElement("button");
    btn.className = "primary-btn";

    if (!status) {
      badge.textContent = "Not Started";
      badge.classList.add("pending");
      btn.textContent = "Take Exam";
      btn.onclick = () => {
        sessionStorage.setItem("selectedSubject", subject);
        window.location.href = "exam-instructions.html";
      };

    } else if (status === "pending") {
      badge.textContent = "Pending Result";
      badge.classList.add("pending");
      btn.textContent = "Submitted";
      btn.disabled = true;
      btn.style.opacity = "0.6";

    } else {
      badge.textContent = "Result Available";
      badge.classList.add("done");
      btn.textContent = "Check Result";
      btn.onclick = () => {
        sessionStorage.setItem("viewSubject", subject);
        window.location.href = "subject-results.html";
      };
    }

    info.appendChild(title);
    info.appendChild(badge);
    card.appendChild(info);
    card.appendChild(btn);
    subjectsList.appendChild(card);
  });
});
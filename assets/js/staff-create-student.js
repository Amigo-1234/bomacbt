import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const form = document.getElementById("createStudentForm");
const msg = document.getElementById("resultMsg");
const subjectCards = document.querySelectorAll(".subject-card");

let selectedSubjects = [];

/* ==========================
   SUBJECT SELECTION
========================== */
subjectCards.forEach(card => {
  card.addEventListener("click", () => {
    const subject = card.textContent.trim();

    card.classList.toggle("selected");

    if (selectedSubjects.includes(subject)) {
      selectedSubjects = selectedSubjects.filter(s => s !== subject);
    } else {
      selectedSubjects.push(subject);
    }
  });
});

/* ==========================
   CREATE STUDENT
========================== */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";

  const regNumber = document.getElementById("regNumber").value.trim();
  const firstName = document.getElementById("firstName").value.trim();
  const surname = document.getElementById("surname").value.trim();
  const session = document.getElementById("session").value.trim();

  if (selectedSubjects.length === 0) {
    msg.style.color = "red";
    msg.textContent = "Please select at least one subject.";
    return;
  }

  // 🔐 Generate internal email
  const normalizedReg = regNumber
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[\/]/g, "_");

  const email = `${normalizedReg}@students.bia.edu.ng`;

  // 🔑 Password = surname + random 3 digits
  const password = `${surname}${Math.floor(100 + Math.random() * 900)}`;

  try {
    // 1️⃣ Create auth account
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    // 2️⃣ Save student record
    await setDoc(doc(db, "users", uid), {
      regNumber,
      firstName,
      surname,
      session,
      subjects: selectedSubjects,
      role: "student",
      createdAt: serverTimestamp()
    });

    msg.style.color = "#00c878";
    msg.innerHTML = `
      <strong>Student created successfully</strong><br><br>
      <strong>Reg Number:</strong> ${regNumber}<br>
      <strong>Password:</strong> ${password}
    `;

    form.reset();
    selectedSubjects = [];
    subjectCards.forEach(card => card.classList.remove("selected"));

  } catch (error) {
    console.error(error);
    msg.style.color = "red";
    msg.textContent =
      "Error creating student. Reg number may already exist.";
  }
});
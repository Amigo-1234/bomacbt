import { auth, db } from "./firebase-config.js";
import { signInWithEmailAndPassword } 
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc } 
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const form = document.getElementById("candidateLoginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const regNumberInput = document.getElementById("regNumber").value.trim();
  const password = document.getElementById("password").value;

  // 🔐 Normalize Reg Number → internal email
  const normalizedReg = regNumberInput
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[\/]/g, "_");

  const email = `${normalizedReg}@students.bia.edu.ng`;

  try {
    // 🔑 Firebase Auth
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    // 🔍 Verify user role
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      alert("Access denied.");
      await auth.signOut();
      return;
    }

    const userData = userSnap.data();

    if (userData.role !== "student") {
      alert("Unauthorized access.");
      await auth.signOut();
      return;
    }

    // ✅ Success
    window.location.href = "dashboard.html";

  } catch (error) {
    console.error(error);
    alert("Invalid registration number or password.");
  }
});
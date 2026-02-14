import { auth, db } from "./firebase-config.js";
import { signInWithEmailAndPassword } 
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc } 
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const form = document.querySelector(".login-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const regInput = document.querySelector("input[type=text]").value.trim();
  const password = document.querySelector("input[type=password]").value;

  // 🔐 Convert Reg Number → internal email
  const normalizedReg = regInput
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[\/]/g, "_");

  const email = `${normalizedReg}@students.bia.edu.ng`;

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    // 🔍 Fetch user record
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await auth.signOut();
      alert("Access denied.");
      return;
    }

    const user = userSnap.data();

    // ❌ BLOCK DISABLED STUDENTS
    if (user.disabled) {
      await auth.signOut();
      alert("Your account has been disabled. Please contact the school.");
      return;
    }

    // ✅ Ensure student role
    if (user.role !== "student") {
      await auth.signOut();
      alert("Invalid login.");
      return;
    }

    // ✅ ALL GOOD
    window.location.href = "dashboard.html";

  } catch (error) {
    console.error(error);
    alert("Invalid registration number or password.");
  }
});
import { auth, db } from "./firebase-config.js";
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { 
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


/* =========================
   SIGNUP LOGIC
========================= */

const signupForm = document.querySelector(".login-form");

if (window.location.pathname.includes("candidate-signup.html")) {

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullName = signupForm.querySelectorAll("input")[0].value;
    const email = signupForm.querySelectorAll("input")[1].value;
    const phone = signupForm.querySelectorAll("input")[2].value;
    const dob = signupForm.querySelectorAll("input")[3].value;
    const password = signupForm.querySelectorAll("input")[4].value;
    const confirmPassword = signupForm.querySelectorAll("input")[5].value;

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save extra user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        fullName,
        email,
        phone,
        dob,
        role: "candidate",
        createdAt: new Date()
      });

      alert("Account created successfully!");
      window.location.href = "candidate-login.html";

    } catch (error) {
      alert(error.message);
    }
  });
}


/* =========================
   LOGIN LOGIC
========================= */

if (window.location.pathname.includes("candidate-login.html")) {

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = signupForm.querySelectorAll("input")[0].value;
    const password = signupForm.querySelectorAll("input")[1].value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login successful!");
      window.location.href = "dashboard.html";

    } catch (error) {
      alert(error.message);
    }
  });
}
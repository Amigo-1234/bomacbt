import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (!user) {
    // If no user logged in
    alert("You must login first.");
    window.location.href = "candidate-login.html";
  }
});
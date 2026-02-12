import { auth, db } from "./firebase-config.js";
import {
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const checked = [...document.querySelectorAll("input[type='checkbox']:checked")];

  if (checked.length !== 3) {
    alert("You must select exactly 3 subjects");
    return;
  }

  const subjects = checked.map(cb => cb.value);

  try {
    await updateDoc(doc(db, "users", auth.currentUser.uid), {
      subjects,
      jupebRegistered: true
    });

    alert("Subjects registered successfully!");
    window.location.href = "dashboard.html";

  } catch (error) {
    console.error(error);
    alert("Error saving subjects");
  }
});
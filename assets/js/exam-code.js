import { db } from "./firebase-config.js";
import { 
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


const form = document.querySelector(".login-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const examCode = form.querySelector("input").value.trim();

  try {

    const q = query(
      collection(db, "exams"),
      where("examCode", "==", examCode)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      alert("Invalid Exam Code");
      return;
    }

    // Get exam document
    const examDoc = querySnapshot.docs[0];

    // Save exam ID in sessionStorage
    sessionStorage.setItem("examId", examDoc.id);

    alert("Exam Found!");
    window.location.href = "exam-instructions.html";

  } catch (error) {
    console.error(error);
    alert("Error validating exam code");
  }
});
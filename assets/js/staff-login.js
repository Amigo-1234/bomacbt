import { auth, db } from "./firebase-config.js";
import { signInWithEmailAndPassword } 
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc } 
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const form = document.getElementById("staffLoginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    // 🔍 CHECK STAFF COLLECTION (CORRECT)
    const staffRef = doc(db, "staff", uid);
    const staffSnap = await getDoc(staffRef);

    if (!staffSnap.exists()) {
      alert("Unauthorized staff access.");
      await auth.signOut();
      return;
    }

    const staffData = staffSnap.data();

    // Optional: role check
    if (staffData.role !== "admin" && staffData.role !== "staff") {
      alert("Access denied.");
      await auth.signOut();
      return;
    }

    // Optional: save role
    sessionStorage.setItem("staffRole", staffData.role);

    // ✅ GO TO DASHBOARD
    window.location.href = "staff-dashboard.html";

  } catch (error) {
    console.error(error);
    alert("Invalid login credentials");
  }
});
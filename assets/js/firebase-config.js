// Firebase CDN Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyABOCqVVVeKmKCm41yR2qPy1nW1g2Jrx8Y",
  authDomain: "bia-cbt.firebaseapp.com",
  projectId: "bia-cbt",
  storageBucket: "bia-cbt.firebasestorage.app",
  messagingSenderId: "74094693732",
  appId: "1:74094693732:web:1565902fd333967088be71"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
const auth = getAuth(app);
const db = getFirestore(app);

// Export for other files
export { auth, db };
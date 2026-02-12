import { db } from "./firebase-config.js";
import {
  doc,
  setDoc,
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

async function seed() {
  try {

    // ======================
    // MATHEMATICS
    // ======================
    await setDoc(doc(db, "exams", "Mathematics"), {
      duration: 45,
      totalQuestions: 3
    });

    const mathQuestions = [
      {
        question: "What is 5 × 3?",
        options: ["8", "10", "15", "20"],
        correctAnswer: 2
      },
      {
        question: "Solve for x: 2x + 4 = 10",
        options: ["2", "3", "4", "5"],
        correctAnswer: 1
      },
      {
        question: "What is the square root of 81?",
        options: ["7", "8", "9", "10"],
        correctAnswer: 2
      }
    ];

    for (const q of mathQuestions) {
      await addDoc(collection(db, "exams", "Mathematics", "questions"), q);
    }

    // ======================
    // PHYSICS
    // ======================
    await setDoc(doc(db, "exams", "Physics"), {
      duration: 45,
      totalQuestions: 3
    });

    const physicsQuestions = [
      {
        question: "What is the SI unit of force?",
        options: ["Joule", "Newton", "Watt", "Pascal"],
        correctAnswer: 1
      },
      {
        question: "Which of the following is a scalar quantity?",
        options: ["Velocity", "Acceleration", "Speed", "Force"],
        correctAnswer: 2
      },
      {
        question: "What does Ohm’s Law state?",
        options: ["V = IR", "P = VI", "F = ma", "E = mc²"],
        correctAnswer: 0
      }
    ];

    for (const q of physicsQuestions) {
      await addDoc(collection(db, "exams", "Physics", "questions"), q);
    }

    // ======================
    // CHEMISTRY
    // ======================
    await setDoc(doc(db, "exams", "Chemistry"), {
      duration: 45,
      totalQuestions: 3
    });

    const chemistryQuestions = [
      {
        question: "What is the chemical symbol for Sodium?",
        options: ["S", "Na", "So", "N"],
        correctAnswer: 1
      },
      {
        question: "Water is a compound made up of which elements?",
        options: [
          "Hydrogen and Oxygen",
          "Carbon and Oxygen",
          "Nitrogen and Hydrogen",
          "Sodium and Chlorine"
        ],
        correctAnswer: 0
      },
      {
        question: "Which state of matter has a fixed volume but no fixed shape?",
        options: ["Solid", "Liquid", "Gas", "Plasma"],
        correctAnswer: 1
      }
    ];

    for (const q of chemistryQuestions) {
      await addDoc(collection(db, "exams", "Chemistry", "questions"), q);
    }

    alert("✅ JUPEB demo exams seeded successfully!");
    console.log("Seeding complete");

  } catch (error) {
    console.error("Seeding error:", error);
  }
}

seed();
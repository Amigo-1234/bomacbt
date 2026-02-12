import { db, auth } from "./firebase-config.js";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ========================
   GET SELECTED SUBJECT
======================== */

const subject = sessionStorage.getItem("selectedSubject");

if (!subject) {
  alert("No subject selected.");
  window.location.href = "dashboard.html";
}

/* ========================
   STATE
======================== */

let questions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let remainingTime = null;
let timerInterval = null;

/* ========================
   ELEMENTS
======================== */

const questionNumber = document.querySelector(".question-number");
const questionText = document.querySelector(".question-text");
const optionsContainer = document.querySelector(".options");
const timerElement = document.querySelector(".timer strong");
const prevBtn = document.querySelector(".secondary-btn");
const nextBtn = document.querySelector(".primary-btn");
const examInfo = document.getElementById("examInfo");
const questionGrid = document.getElementById("questionGrid");
const submitBtn = document.querySelector(".danger-btn");

/* ========================
   RESTORE SAVED STATE
======================== */

const savedState = JSON.parse(sessionStorage.getItem("examState"));

if (savedState && savedState.subject === subject) {
  currentQuestionIndex = savedState.currentQuestionIndex ?? 0;
  userAnswers = savedState.userAnswers ?? [];
  remainingTime = savedState.remainingTime ?? null;
}

/* ========================
   SAVE STATE
======================== */

function saveExamState() {
  sessionStorage.setItem("examState", JSON.stringify({
    subject,
    currentQuestionIndex,
    userAnswers,
    remainingTime
  }));
}

/* ========================
   LOAD EXAM
======================== */

async function loadExam() {
  try {
    const examRef = doc(db, "exams", subject);
    const examSnap = await getDoc(examRef);

    if (!examSnap.exists()) {
      alert(`Exam for ${subject} not found.`);
      window.location.href = "dashboard.html";
      return;
    }

    const examData = examSnap.data();

    examInfo.textContent =
      `Subject: ${subject} | Total Questions: ${examData.totalQuestions}`;

    const questionSnap = await getDocs(
      collection(db, "exams", subject, "questions")
    );

    questions = [];
    questionSnap.forEach(doc => {
      questions.push({ id: doc.id, ...doc.data() });
    });

    startTimer(examData.duration);
    generateQuestionGrid();
    renderQuestion();

  } catch (error) {
    console.error(error);
  }
}

/* ========================
   QUESTION GRID
======================== */

function generateQuestionGrid() {
  questionGrid.innerHTML = "";

  questions.forEach((_, index) => {
    const btn = document.createElement("button");
    btn.textContent = index + 1;
    btn.addEventListener("click", () => {
      currentQuestionIndex = index;
      saveExamState();
      renderQuestion();
      updateQuestionStates();
    });
    questionGrid.appendChild(btn);
  });

  updateQuestionStates();
}

function updateQuestionStates() {
  const buttons = questionGrid.querySelectorAll("button");

  buttons.forEach((btn, index) => {
    btn.className = "";

    if (index === currentQuestionIndex) {
      btn.classList.add("current");
    } else if (userAnswers[index] !== undefined) {
      btn.classList.add("answered");
    } else {
      btn.classList.add("unanswered");
    }
  });
}

/* ========================
   RENDER QUESTION
======================== */

function renderQuestion() {
  const current = questions[currentQuestionIndex];

  questionNumber.textContent = `Question ${currentQuestionIndex + 1}`;
  questionText.textContent = current.question;
  optionsContainer.innerHTML = "";

  current.options.forEach((option, index) => {
    const label = document.createElement("label");
    label.className = "option";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "option";
    input.value = index;

    if (userAnswers[currentQuestionIndex] === index) {
      input.checked = true;
    }

    input.addEventListener("change", () => {
      userAnswers[currentQuestionIndex] = index;
      saveExamState();
      updateQuestionStates();
    });

    const span = document.createElement("span");
    span.textContent = option;

    label.appendChild(input);
    label.appendChild(span);
    optionsContainer.appendChild(label);
  });
}

/* ========================
   NAVIGATION
======================== */

nextBtn.addEventListener("click", () => {
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    saveExamState();
    renderQuestion();
    updateQuestionStates();
  }
});

prevBtn.addEventListener("click", () => {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    saveExamState();
    renderQuestion();
    updateQuestionStates();
  }
});

/* ========================
   TIMER (PERSISTENT)
======================== */

function startTimer(minutes) {
  let time = remainingTime ?? minutes * 60;

  timerInterval = setInterval(() => {
    remainingTime = time;
    saveExamState();

    const mins = Math.floor(time / 60);
    const secs = time % 60;

    timerElement.textContent =
      `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

    time--;

    if (time < 0) {
      clearInterval(timerInterval);
      submitExam(true);
    }
  }, 1000);
}

/* ========================
   PREVENT ACCIDENTAL EXIT
======================== */

window.addEventListener("beforeunload", (e) => {
  e.preventDefault();
  e.returnValue = "";
});

/* ========================
   SUBMIT EXAM
======================== */

async function submitExam() {

  const answeredCount = userAnswers.filter(a => a !== undefined).length;
  const unanswered = questions.length - answeredCount;

  if (unanswered > 0) {
    if (!confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) {
      return;
    }
  }

  let score = 0;
  questions.forEach((q, i) => {
    if (userAnswers[i] === q.correctAnswer) score++;
  });

  const percentage = Math.round((score / questions.length) * 100);

  const resultRef = doc(
    db,
    "results",
    `${auth.currentUser.uid}_${subject}`
  );

  await setDoc(resultRef, {
    userId: auth.currentUser.uid,
    subject,
    score,
    total: questions.length,
    percentage,
    answers: false,
    released: false,
    submittedAt: new Date()
  });

  sessionStorage.removeItem("selectedSubject");
  window.location.href = "dashboard.html";
}

submitBtn.addEventListener("click", () => submitExam());

/* ========================
   INIT
======================== */

loadExam();
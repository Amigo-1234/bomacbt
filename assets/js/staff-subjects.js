import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const table = document.getElementById("subjectsTable");
const searchInput = document.getElementById("subjectSearch");
const addBtn = document.getElementById("addSubjectBtn");

let subjects = [];

/* ==========================
   LOAD SUBJECTS
========================== */
async function loadSubjects() {
  table.innerHTML = `
    <tr>
      <td colspan="3" style="text-align:center;opacity:.6;">
        Loading subjects...
      </td>
    </tr>
  `;

  const snap = await getDocs(collection(db, "subjects"));

  subjects = snap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  renderSubjects(subjects);
}

/* ==========================
   RENDER SUBJECTS
========================== */
function renderSubjects(data) {
  if (!data.length) {
    table.innerHTML = `
      <tr>
        <td colspan="3" style="text-align:center;opacity:.6;">
          No subjects found
        </td>
      </tr>
    `;
    return;
  }

  table.innerHTML = data.map(s => `
    <tr>
      <td>${s.name}</td>

      <td>
        <span class="badge ${s.active ? "released" : "pending"}">
          ${s.active ? "Active" : "Disabled"}
        </span>
      </td>

      <td>
        <button
          class="action-btn ${s.active ? "disable" : "enable"} toggle"
          data-id="${s.id}"
          data-active="${s.active}">
          ${s.active ? "Disable" : "Enable"}
        </button>
      </td>
    </tr>
  `).join("");
}

/* ==========================
   ADD SUBJECT
========================== */
addBtn.addEventListener("click", async () => {
  const name = prompt("Enter subject name");
  if (!name) return;

  try {
    await addDoc(collection(db, "subjects"), {
      name: name.trim(),
      active: true,
      createdAt: serverTimestamp()
    });

    loadSubjects();
  } catch (err) {
    alert("Failed to add subject");
    console.error(err);
  }
});

/* ==========================
   ENABLE / DISABLE
========================== */
table.addEventListener("click", async e => {
  const btn = e.target.closest(".toggle");
  if (!btn) return;

  const id = btn.dataset.id;
  const active = btn.dataset.active === "true";

  try {
    await updateDoc(doc(db, "subjects", id), {
      active: !active
    });

    subjects = subjects.map(s =>
      s.id === id ? { ...s, active: !active } : s
    );

    renderSubjects(subjects);
  } catch (err) {
    alert("Failed to update subject");
    console.error(err);
  }
});

/* ==========================
   SEARCH
========================== */
searchInput.addEventListener("input", e => {
  const value = e.target.value.toLowerCase();

  const filtered = subjects.filter(s =>
    s.name.toLowerCase().includes(value)
  );

  renderSubjects(filtered);
});

/* INIT */
loadSubjects();
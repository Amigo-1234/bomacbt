import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const table = document.getElementById("studentsTable");
const searchInput = document.getElementById("studentSearch");

let students = [];

/* ==========================
   LOAD STUDENTS
========================== */
async function loadStudents() {
  table.innerHTML = `
    <tr>
      <td colspan="7" style="text-align:center;opacity:.6;">
        Loading students...
      </td>
    </tr>
  `;

  const q = query(
    collection(db, "users"),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  students = snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(u => u.role === "student");

  renderStudents(students);
}

/* ==========================
   RENDER STUDENTS
========================== */
function renderStudents(data) {
  if (!data.length) {
    table.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;opacity:.6;">
          No students found
        </td>
      </tr>
    `;
    return;
  }

  table.innerHTML = data.map(s => `
    <tr>
      <td>
        <div class="student-icon ${s.disabled ? "disabled" : ""}">👤</div>
      </td>

      <td>${s.regNumber}</td>
      <td>${s.firstName} ${s.surname}</td>
      <td>${s.session}</td>
      <td>${s.subjects.join(", ")}</td>

      <td>
        <span class="badge ${s.disabled ? "pending" : "released"}">
          ${s.disabled ? "Disabled" : "Active"}
        </span>
      </td>

      <td>
        <div class="actions">
          <button class="action-btn icon-btn view-btn" data-id="${s.id}">
            👁
          </button>

          <button
            class="action-btn toggle"
            data-id="${s.id}"
            data-disabled="${s.disabled}">
            ${s.disabled ? "Enable" : "Disable"}
          </button>
        </div>
      </td>
    </tr>
  `).join("");
}

const modal = document.getElementById("studentModal");
const closeModal = document.getElementById("closeModal");
const closeModal2 = document.getElementById("closeModal2");

document.addEventListener("click", e => {
  if (e.target.classList.contains("view-btn")) {
    const id = e.target.dataset.id;
    const student = students.find(s => s.id === id);

    document.getElementById("modalReg").textContent = student.regNumber;
    document.getElementById("modalName").textContent =
      `${student.firstName} ${student.surname}`;
    document.getElementById("modalSession").textContent = student.session;
    document.getElementById("modalSubjects").textContent =
      student.subjects.join(", ");
    document.getElementById("modalStatus").textContent =
      student.disabled ? "Disabled" : "Active";

      document.getElementById("modalPassword").textContent =
  student.initialPassword || "Not available";

    const toggleBtn = document.getElementById("toggleStatusBtn");
    toggleBtn.textContent = student.disabled ? "Enable Student" : "Disable Student";

    modal.classList.add("active");
  }
});

[closeModal, closeModal2].forEach(btn =>
  btn.addEventListener("click", () =>
    modal.classList.remove("active")
  )
);

const toggleStatusBtn = document.getElementById("toggleStatusBtn");
let activeStudentId = null;

document.addEventListener("click", e => {
  if (e.target.classList.contains("view-btn")) {
    const id = e.target.dataset.id;
    const student = students.find(s => s.id === id);
    activeStudentId = id;

    toggleStatusBtn.textContent =
      student.disabled ? "Enable Student" : "Disable Student";
  }
});

toggleStatusBtn.addEventListener("click", async () => {
  if (!activeStudentId) return;

  const student = students.find(s => s.id === activeStudentId);

  try {
    await updateDoc(doc(db, "users", activeStudentId), {
      disabled: !student.disabled
    });

    students = students.map(s =>
      s.id === activeStudentId
        ? { ...s, disabled: !s.disabled }
        : s
    );

    modal.classList.remove("active");
    renderStudents(students);
  } catch (err) {
    alert("Failed to update student");
    console.error(err);
  }
});

/* ==========================
   ENABLE / DISABLE STUDENT
========================== */
table.addEventListener("click", async e => {
  const btn = e.target.closest(".toggle");
  if (!btn) return;

  const id = btn.dataset.id;
  const isDisabled = btn.dataset.disabled === "true";

  const action = isDisabled ? "ENABLE" : "DISABLE";

  const confirmed = confirm(
    `Are you sure you want to ${action} this student?\n\nThis will affect their ability to log in.`
  );

  if (!confirmed) return;

  try {
    await updateDoc(doc(db, "users", id), {
      disabled: !isDisabled
    });

    students = students.map(s =>
      s.id === id ? { ...s, disabled: !isDisabled } : s
    );

    renderStudents(students);
  } catch (err) {
    alert("Failed to update student status");
    console.error(err);
  }
});

/* ==========================
   SEARCH
========================== */
searchInput.addEventListener("input", e => {
  const value = e.target.value.toLowerCase();

  const filtered = students.filter(s =>
    s.regNumber.toLowerCase().includes(value) ||
    `${s.firstName} ${s.surname}`.toLowerCase().includes(value)
  );

  renderStudents(filtered);
});

/* ==========================
   INIT
========================== */
loadStudents();
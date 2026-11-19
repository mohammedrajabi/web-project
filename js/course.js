const course = document.querySelector("[data-course]");
const lessons = [...course.querySelectorAll(".lesson")];
const sections = [...course.querySelectorAll(".course-section")];
const progressLabel = document.querySelector("#lesson-progress-label");
const progressBar = course.querySelector("progress");
const storageKey = `codestart-${course.dataset.course}-completed`;
let completed = new Set();

try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
  if (Array.isArray(saved))
    completed = new Set(
      saved.filter((id) => lessons.some((lesson) => lesson.id === id)),
    );
} catch {
  // Lesson completion still works for the current visit when storage is unavailable.
}

function updateProgress() {
  for (const lesson of lessons) {
    const done = completed.has(lesson.id);
    const button = lesson.querySelector(".complete-lesson");
    button.setAttribute("aria-pressed", String(done));
    button.querySelector("span").textContent = done
      ? "Completed"
      : "Mark Complete";
    course.querySelector(`a[href="#${lesson.id}"] .lesson-check`).hidden =
      !done;
  }
  progressLabel.textContent = `${completed.size} of ${lessons.length} lessons complete`;
  progressBar.value = completed.size;
}

function showDestination(focus = false) {
  const hash = location.hash;
  const lesson =
    lessons.find((item) => "#" + item.id === hash) ||
    lessons.find((item) => !item.hidden) ||
    lessons[0];
  for (const item of lessons) item.hidden = item !== lesson;
  const destination = ["#playground", "#knowledge-check"].includes(hash)
    ? hash
    : "#" + lesson.id;
  const sectionId =
    destination === "#" + lesson.id ? "lessons" : destination.slice(1);
  const section = sections.find((item) => item.id === sectionId);
  for (const item of sections) item.hidden = item !== section;
  for (const link of course.querySelectorAll(".lesson-sidebar a")) {
    if (link.getAttribute("href") === destination)
      link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  }
  if (
    focus &&
    ["#lessons", "#playground", "#knowledge-check", "#" + lesson.id].includes(
      hash,
    )
  ) {
    const target = sectionId === "lessons" ? lesson : section;
    const heading = target.querySelector(sectionId === "lessons" ? "h3" : "h2");
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    target.scrollIntoView({ block: "start" });
  }
}

course.addEventListener("click", (event) => {
  const button = event.target.closest(".complete-lesson");
  if (!button) return;
  const id = button.closest(".lesson").id;
  if (completed.has(id)) completed.delete(id);
  else completed.add(id);
  updateProgress();
  try {
    localStorage.setItem(storageKey, JSON.stringify([...completed]));
  } catch {
    // Keep the in-memory completion state usable.
  }
});

window.addEventListener("hashchange", () => showDestination(true));
updateProgress();
showDestination();

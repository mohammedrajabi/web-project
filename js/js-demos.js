const counter = document.querySelector("#counter-value");
let count = 0;
for (const button of document.querySelectorAll("[data-count]")) {
  button.addEventListener("click", () => {
    count =
      button.dataset.count === "reset"
        ? 0
        : count + Number(button.dataset.count);
    counter.value = String(count);
  });
}

const greetingForm = document.querySelector("#greeting-form");
const greetingName = document.querySelector("#greeting-name");
const greetingOutput = document.querySelector("#greeting-output");
greetingName.setAttribute("aria-describedby", "greeting-output");
greetingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = greetingName.value.trim();
  greetingName.value = name;
  if (!name) {
    greetingName.setAttribute("aria-invalid", "true");
    greetingOutput.textContent = "Enter your name to create a greeting.";
    greetingName.focus();
    return;
  }
  greetingName.removeAttribute("aria-invalid");
  greetingOutput.textContent = `Hello, ${name}!`;
});
greetingName.addEventListener("input", () =>
  greetingName.removeAttribute("aria-invalid"),
);

const styleSwitch = document.querySelector("#style-switch");
styleSwitch.addEventListener("click", () => {
  const highlighted = document
    .querySelector("#switch-sample")
    .classList.toggle("is-highlighted");
  styleSwitch.setAttribute("aria-pressed", String(highlighted));
});

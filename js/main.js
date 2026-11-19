const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector("#primary-nav");
const mobileLayout = window.matchMedia("(max-width: 920px)");

function setMenuOpen(open) {
  menuToggle.setAttribute("aria-expanded", String(open));
  primaryNav.inert = mobileLayout.matches && !open;
}

function resetMenu() {
  menuToggle.hidden = !mobileLayout.matches;
  if (mobileLayout.matches && primaryNav.contains(document.activeElement)) {
    menuToggle.focus();
  }
  setMenuOpen(false);
}

menuToggle.addEventListener("click", () => {
  setMenuOpen(menuToggle.getAttribute("aria-expanded") === "false");
});

document.querySelector(".site-header").addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    menuToggle.focus();
    setMenuOpen(false);
  }
});

mobileLayout.addEventListener("change", resetMenu);
resetMenu();

const registration = document.querySelector("#registration-form");
if (registration) {
  const formStatus = registration.querySelector(".form-status");
  const fields = [
    {
      input: registration.elements.firstName,
      isValid: (input) => Array.from(input.value).length >= 3,
      message: "Enter at least 3 characters for your first name.",
    },
    {
      input: registration.elements.lastName,
      isValid: (input) => Array.from(input.value).length >= 3,
      message: "Enter at least 3 characters for your last name.",
    },
    {
      input: registration.elements.mobile,
      isValid: (input) => /^[0-9]{8}$/.test(input.value),
      message: "Enter exactly 8 digits for your mobile number.",
    },
    {
      input: registration.elements.email,
      isValid: (input) => !input.validity.typeMismatch && /@[^@]+\.[^@.]+$/.test(input.value),
      message: "Enter a valid email address, such as you@example.com.",
    },
  ];

  function validateField({ input, isValid, message }) {
    const valid = isValid(input);
    const error = document.getElementById(input.getAttribute("aria-describedby"));

    input.setAttribute("aria-invalid", String(!valid));
    error.hidden = valid;
    error.textContent = valid ? "" : message;

    return valid;
  }

  registration.addEventListener("submit", (event) => {
    event.preventDefault();

    const invalidFields = fields.filter((field) => {
      field.input.value = field.input.value.trim();
      return !validateField(field);
    });

    formStatus.textContent = invalidFields.length
      ? ""
      : "Your details passed validation. This form is a demo only.";
    invalidFields[0]?.input.focus();
  });

  for (const field of fields) {
    field.input.addEventListener("input", () => {
      formStatus.textContent = "";
    });

    field.input.addEventListener("blur", () => {
      if (field.input.hasAttribute("aria-invalid")) {
        field.input.value = field.input.value.trim();
        validateField(field);
      }
    });
  }

  registration.querySelector(".submit-button").disabled = false;
}

for (const button of document.querySelectorAll("[data-dialog]")) {
  button.addEventListener("click", () => {
    document.getElementById(button.dataset.dialog).showModal();
  });
}

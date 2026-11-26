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
  if (
    event.key === "Escape" &&
    menuToggle.getAttribute("aria-expanded") === "true"
  ) {
    menuToggle.focus();
    setMenuOpen(false);
  }
});

mobileLayout.addEventListener("change", resetMenu);
resetMenu();

const welcomeBanner = document.querySelector("#welcome-banner");
const welcomeNameKey = "codestart-first-name";
const welcomeDismissedKey = "codestart-welcome-dismissed";
let welcomeDismissed = false;

function showWelcome(firstName) {
  if (!welcomeBanner || !firstName || welcomeDismissed) return;
  welcomeBanner.querySelector("#welcome-message").textContent =
    `Welcome to CodeStart, ${firstName}! 👋 You're ready to start learning HTML, CSS, and JavaScript.`;
  welcomeBanner.hidden = false;
}

if (welcomeBanner) {
  // Storage can be unavailable in restricted browser contexts.
  try {
    welcomeDismissed = sessionStorage.getItem(welcomeDismissedKey) === "true";
    showWelcome(sessionStorage.getItem(welcomeNameKey));
  } catch {
    // Registration and the banner still work for this page visit.
  }

  welcomeBanner.querySelector(".welcome-close").addEventListener("click", () => {
    welcomeDismissed = true;
    welcomeBanner.hidden = true;
    try {
      sessionStorage.setItem(welcomeDismissedKey, "true");
    } catch {
      // Keep the in-memory dismissal if storage is unavailable.
    }
    document.querySelector("#main").focus({ preventScroll: true });
  });
}

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
      isValid: (input) =>
        !input.validity.typeMismatch && /@[^@]+\.[^@.]+$/.test(input.value),
      message: "Enter a valid email address, such as you@example.com.",
    },
  ];

  function validateField({ input, isValid, message }) {
    const valid = isValid(input);
    const error = document.getElementById(
      input.getAttribute("aria-describedby"),
    );

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
    if (invalidFields.length === 0) {
      const firstName = registration.elements.firstName.value;
      welcomeDismissed = false;
      try {
        sessionStorage.setItem(welcomeNameKey, firstName);
        sessionStorage.removeItem(welcomeDismissedKey);
      } catch {
        // A storage restriction must not interrupt successful validation.
      }
      showWelcome(firstName);
      welcomeBanner?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "start",
      });
    }
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

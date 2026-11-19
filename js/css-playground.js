const styleControls = document.querySelector("#style-controls");
const sampleCard = document.querySelector("#sample-card");
const generatedCss = document.querySelector("#generated-css");

function updateStyles() {
  const values = Object.fromEntries(new FormData(styleControls));
  const rules = {
    "background-color": values.background,
    color: values.color,
    "border-radius": values.radius + "px",
    padding: values.padding + "px",
    "font-size": values.size + "px",
    "text-align": values.align,
  };
  for (const [property, value] of Object.entries(rules))
    sampleCard.style.setProperty(property, value);
  for (const property of ["radius", "padding", "size"]) {
    document.querySelector("#output-" + property).textContent =
      values[property] + " px";
  }
  generatedCss.textContent =
    ".card {\n" +
    Object.entries(rules)
      .map(([property, value]) => `  ${property}: ${value};`)
      .join("\n") +
    "\n}";
}

styleControls.addEventListener("input", updateStyles);
styleControls.addEventListener("change", updateStyles);
styleControls.addEventListener("reset", () => {
  // Read the defaults after the browser finishes resetting the form controls.
  setTimeout(updateStyles, 0);
});
updateStyles();

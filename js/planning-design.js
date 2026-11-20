const designPages = [
  { name: "Home", file: "home" },
  { name: "HTML Learning", file: "html" },
  { name: "CSS Learning", file: "css" },
  { name: "JavaScript Learning", file: "javascript" },
  { name: "Planning & Design", file: "planning-design" },
  { name: "Reflection & AI Report", file: "reflection-ai-report" },
  { name: "Overview", file: "overview" },
];
const designTypes = {
  low: { directory: "low-fidelity", label: "Low-fidelity wireframe" },
  high: { directory: "high-fidelity", label: "High-fidelity mockup" },
};
const galleryTabs = [...document.querySelectorAll("[data-fidelity]")];
let previewOpener;
const previewDialog = document.createElement("dialog");
previewDialog.className = "design-preview-dialog";
previewDialog.setAttribute("aria-labelledby", "design-preview-title");
const previewHeading = document.createElement("div");
previewHeading.className = "design-preview-heading";
const previewTitle = document.createElement("h2");
previewTitle.id = "design-preview-title";
const closePreview = document.createElement("button");
closePreview.type = "button";
closePreview.className = "button design-secondary";
closePreview.textContent = "Close";
const previewImage = document.createElement("img");
previewHeading.append(previewTitle, closePreview);
previewDialog.append(previewHeading, previewImage);
document.body.append(previewDialog);
closePreview.addEventListener("click", () => previewDialog.close());
previewDialog.addEventListener("close", () => previewOpener?.focus());

function buildGallery(fidelity) {
  const panel = document.querySelector("#" + fidelity + "-gallery");
  const type = designTypes[fidelity];
  for (const page of designPages) {
    const figure = document.createElement("figure");
    figure.className = "gallery-card";
    const media = document.createElement("div");
    media.className = "design-media";
    const placeholder = document.createElement("div");
    placeholder.className = "design-placeholder";
    const placeholderLabel = document.createElement("span");
    placeholderLabel.textContent = "Image placeholder";
    const designLabel = document.createElement("strong");
    designLabel.textContent = type.label;
    placeholder.append(placeholderLabel, designLabel);
    const image = document.createElement("img");
    image.hidden = true;
    image.alt = page.name + " — " + type.label;
    image.dataset.src = `images/planning/${type.directory}/${page.file}.png`;
    const caption = document.createElement("figcaption");
    const title = document.createElement("h3");
    title.textContent = page.name;
    const open = document.createElement("button");
    open.type = "button";
    open.className = "gallery-open";
    open.textContent = "View design";
    open.setAttribute("aria-label", "View " + image.alt);
    open.hidden = true;
    image.addEventListener("load", () => {
      placeholder.hidden = true;
      image.hidden = false;
      open.hidden = false;
    });
    image.addEventListener("error", () => {
      placeholder.hidden = false;
      image.hidden = true;
      open.hidden = true;
    });
    open.addEventListener("click", () => {
      previewOpener = open;
      previewTitle.textContent = image.alt;
      previewImage.alt = image.alt;
      previewImage.src = image.src;
      previewDialog.showModal();
      closePreview.focus();
    });
    media.append(placeholder, image);
    caption.append(title, open);
    figure.append(media, caption);
    panel.append(figure);
  }
}

function selectGallery(fidelity) {
  for (const tab of galleryTabs) {
    const selected = tab.dataset.fidelity === fidelity;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    const panel = document.querySelector("#" + tab.getAttribute("aria-controls"));
    panel.hidden = !selected;
    if (selected) {
      for (const image of panel.querySelectorAll("img[data-src]")) {
        if (!image.hasAttribute("src")) image.src = image.dataset.src;
      }
    }
  }
}

for (const fidelity of Object.keys(designTypes)) buildGallery(fidelity);
for (const [index, tab] of galleryTabs.entries()) {
  tab.addEventListener("click", () => selectGallery(tab.dataset.fidelity));
  tab.addEventListener("keydown", (event) => {
    const positions = { ArrowRight: (index + 1) % galleryTabs.length, ArrowLeft: (index + galleryTabs.length - 1) % galleryTabs.length, Home: 0, End: galleryTabs.length - 1 };
    if (!(event.key in positions)) return;
    event.preventDefault();
    const next = galleryTabs[positions[event.key]];
    selectGallery(next.dataset.fidelity);
    next.focus();
  });
}
selectGallery("low");

const componentForm = document.querySelector("#component-form");
const componentEmail = document.querySelector("#component-email");
const componentError = document.querySelector("#component-email-error");
const componentStatus = document.querySelector(".component-form-status");
componentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  componentEmail.value = componentEmail.value.trim();
  const valid = componentEmail.validity.valid;
  componentEmail.setAttribute("aria-invalid", String(!valid));
  componentError.hidden = valid;
  componentError.textContent = valid ? "" : "Enter a valid email address, such as you@example.com.";
  componentStatus.textContent = valid ? "Your example is valid. This is a style demonstration." : "";
  if (!valid) componentEmail.focus();
});
componentEmail.addEventListener("input", () => {
  componentEmail.removeAttribute("aria-invalid");
  componentError.hidden = true;
  componentStatus.textContent = "";
});

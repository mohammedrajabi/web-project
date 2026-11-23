(() => {
  const dialog = document.createElement("dialog");
  dialog.className = "design-viewer";
  dialog.setAttribute("aria-labelledby", "design-viewer-title");
  dialog.setAttribute("aria-describedby", "design-viewer-help");

  const header = document.createElement("div");
  header.className = "design-viewer-header";
  const caption = document.createElement("div");
  const title = document.createElement("h2");
  title.id = "design-viewer-title";
  const position = document.createElement("p");
  position.className = "design-viewer-position";
  position.setAttribute("role", "status");
  caption.append(title, position);

  function button(label) {
    const control = document.createElement("button");
    control.type = "button";
    control.className = "design-viewer-button";
    control.textContent = label;
    return control;
  }

  const close = button("Close");
  close.classList.add("design-viewer-close");
  close.setAttribute("aria-label", "Close image viewer");
  header.append(caption, close);

  const toolbar = document.createElement("div");
  toolbar.className = "design-viewer-toolbar";
  const navigation = document.createElement("nav");
  navigation.className = "design-viewer-navigation";
  navigation.setAttribute("aria-label", "Image navigation");
  const previous = button("Previous");
  const next = button("Next");
  const zoom = button("Zoom in");
  navigation.append(previous, next);
  toolbar.append(navigation, zoom);

  const viewport = document.createElement("div");
  viewport.className = "design-viewer-viewport";
  const canvas = document.createElement("button");
  canvas.type = "button";
  canvas.className = "design-viewer-canvas";
  const image = document.createElement("img");
  image.className = "design-viewer-image";
  image.draggable = false;
  canvas.append(image);
  const status = document.createElement("p");
  status.className = "design-viewer-status";
  status.setAttribute("role", "status");
  viewport.append(status, canvas);
  const help = document.createElement("p");
  help.id = "design-viewer-help";
  help.className = "design-viewer-help";
  dialog.append(header, toolbar, viewport, help);
  document.body.append(dialog);

  let designs = [];
  let index = 0;
  let opener;

  function setZoom(zoomed) {
    dialog.classList.toggle("is-zoomed", zoomed);
    zoom.textContent = zoomed ? "Fit to screen" : "Zoom in";
    zoom.setAttribute("aria-pressed", String(zoomed));
    canvas.setAttribute("aria-label", zoomed ? "Fit image to screen" : "Zoom image to full size");
    help.textContent = zoomed
      ? "Scroll to explore. Select the image to fit it to the screen."
      : "Select the image to zoom. Use Esc or Close to return.";
    viewport.scrollTo(0, 0);
  }

  function showDesign() {
    const design = designs[index];
    setZoom(false);
    title.textContent = design.title;
    position.textContent = designs.length > 1 ? `${index + 1} of ${designs.length}` : "";
    navigation.hidden = designs.length < 2;
    previous.disabled = index === 0;
    next.disabled = index === designs.length - 1;
    canvas.hidden = true;
    canvas.disabled = true;
    zoom.disabled = true;
    status.hidden = false;
    status.textContent = "Loading design…";
    image.alt = design.title;
    image.src = design.src;
  }

  image.addEventListener("load", () => {
    canvas.hidden = false;
    canvas.disabled = false;
    zoom.disabled = false;
    status.hidden = true;
  });

  image.addEventListener("error", () => {
    canvas.hidden = true;
    zoom.disabled = true;
    status.hidden = false;
    status.textContent = "This design could not be loaded. Close the viewer and try again.";
  });

  function moveDesign(offset) {
    const destination = index + offset;
    if (destination < 0 || destination >= designs.length) return;
    index = destination;
    showDesign();
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-design-viewer]");
    if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    opener = link;
    const available = new Map();
    for (const item of document.querySelectorAll("a[data-design-viewer]:not([hidden])")) {
      if (!available.has(item.href)) {
        available.set(item.href, { src: item.href, title: item.dataset.designTitle || item.querySelector("img")?.alt || "Design preview" });
      }
    }
    designs = [...available.values()];
    index = designs.findIndex((design) => design.src === link.href);
    showDesign();
    document.documentElement.classList.add("design-viewer-open");
    dialog.showModal();
    close.focus();
  });

  close.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    document.documentElement.classList.remove("design-viewer-open");
    setZoom(false);
    opener?.focus({ preventScroll: true });
  });
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
      dialog.close();
    }
  });
  dialog.addEventListener("keydown", (event) => {
    if (dialog.classList.contains("is-zoomed")) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      moveDesign(event.key === "ArrowLeft" ? -1 : 1);
    }
  });
  previous.addEventListener("click", () => moveDesign(-1));
  next.addEventListener("click", () => moveDesign(1));
  zoom.addEventListener("click", () => setZoom(!dialog.classList.contains("is-zoomed")));
  canvas.addEventListener("click", () => setZoom(!dialog.classList.contains("is-zoomed")));
})();

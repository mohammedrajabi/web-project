const editor = document.querySelector("#html-editor");
const preview = document.querySelector("#html-preview");
const previewLabel = document.querySelector("#preview-label");
const lineNumbers = document.querySelector(".line-numbers");
const previewStylesheet = new URL("../css/html-preview.css", document.currentScript.src);
const previewFonts = new URL("../css/fonts/", document.currentScript.src);
const styleSource = location.protocol === "file:" ? "file:" : new URL("../css/", document.currentScript.src).href;
const fontSource = location.protocol === "file:" ? "file:" : previewFonts.href;
const lessonUrl = new URL("subtopic2.html", location.href);

function renderPreview(source) {
  const page = document.implementation.createHTMLDocument("Your HTML preview");
  const charset = page.createElement("meta");
  charset.setAttribute("charset", "utf-8");
  const policy = page.createElement("meta");
  policy.httpEquiv = "Content-Security-Policy";
  policy.content = `default-src 'none'; style-src ${styleSource}; font-src ${fontSource}; form-action 'none';`;
  const stylesheet = page.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = previewStylesheet.href;
  page.head.prepend(charset, policy);
  page.head.append(stylesheet);

  // Parse in a template so learner markup stays inert in the main page.
  const template = page.createElement("template");
  template.innerHTML = source;
  page.body.append(template.content);
  for (const link of page.body.querySelectorAll("a[href]")) {
    link.setAttribute("target", "_top");
    try {
      link.href = new URL(link.getAttribute("href"), location.href).href;
    } catch {
      link.removeAttribute("href");
    }
  }
  preview.srcdoc = "<!doctype html>" + page.documentElement.outerHTML;
}

function updatePractice() {
  const source = editor.value;
  const template = document.createElement("template");
  template.innerHTML = source;
  const content = template.content;
  const hasHeading = Boolean(content.querySelector("h1")?.textContent.trim());
  const hasParagraph = Boolean(content.querySelector("p")?.textContent.trim());
  const hasLink = [...content.querySelectorAll("a[href]")].some((link) => {
    try {
      return link.textContent.trim() && new URL(link.getAttribute("href"), location.href).href === lessonUrl.href;
    } catch {
      return false;
    }
  });
  const checks = { heading: hasHeading, paragraph: hasParagraph, link: hasLink };

  for (const [name, passed] of Object.entries(checks)) {
    const item = document.querySelector(`[data-check="${name}"]`);
    item.classList.toggle("check-passed", passed);
    item.classList.toggle("check-missing", !passed);
    item.querySelector("span").textContent = passed ? "✓" : "○";
    item.setAttribute("aria-label", `${item.textContent.trim()}: ${passed ? "complete" : "missing"}`);
  }

  lineNumbers.textContent = source.split("\n").map((line, index) => index + 1).join("\n");
  previewLabel.textContent = "Your workspace preview";
  preview.title = "Live browser preview of your workspace";
  renderPreview(source);
}

editor.disabled = false;
editor.addEventListener("input", updatePractice);
editor.addEventListener("scroll", () => {
  lineNumbers.scrollTop = editor.scrollTop;
});

renderPreview('<h1>Welcome to CodeStart</h1>\n<p>I’m learning to build for the web.</p>\n<a href="subtopic2.html">Learn CSS →</a>');

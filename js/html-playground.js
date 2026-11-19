const htmlExamples = {
  first:
    '<h1>My first web page</h1>\n<p>Hello! I’m learning to build for the web.</p>',
  list: "<h1>A list of favorites</h1>\n<ul>\n  <li>Learning something new</li>\n  <li>Building websites</li>\n  <li>Sharing ideas</li>\n</ul>",
  form: '<h1>Contact me</h1>\n<form>\n  <label for="name">Your name</label>\n  <input id="name" name="name" required>\n  <label for="email">Email</label>\n  <input id="email" name="email" type="email" required>\n  <button type="submit">Send message</button>\n</form>',
};
const htmlSelect = document.querySelector("#html-example");
const htmlCode = document.querySelector("#html-code");
const htmlPreview = document.querySelector(".preview-pane iframe");
const htmlStatus = document.querySelector("#html-status");
const previewCss = new URL(
  "../css/playground-preview.css",
  document.currentScript.src,
);
const stylesAllowed =
  location.protocol === "file:" ? "file:" : new URL(".", previewCss).href;
const fontsAllowed =
  location.protocol === "file:" ? "file:" : new URL("fonts/", previewCss).href;
htmlCode.setAttribute("aria-describedby", "html-status");
htmlCode.wrap = "off";
htmlPreview.setAttribute("sandbox", "allow-same-origin");

function runHtml() {
  const page = new DOMParser().parseFromString(htmlCode.value, "text/html");
  const policy = page.createElement("meta");
  policy.httpEquiv = "Content-Security-Policy";
  policy.content = `default-src 'none'; style-src ${stylesAllowed} 'unsafe-inline'; font-src ${fontsAllowed}; img-src data:; form-action 'none'; base-uri 'none';`;
  page.head.prepend(policy);
  const stylesheet = page.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = previewCss.href;
  page.head.append(stylesheet);
  htmlPreview.srcdoc = "<!doctype html>" + page.documentElement.outerHTML;
  htmlStatus.textContent = "Preview updated. HTML runs in an isolated preview.";
}

function loadExample() {
  htmlCode.value = htmlExamples[htmlSelect.value];
  runHtml();
  htmlStatus.textContent = "Example ready to edit.";
}

htmlSelect.addEventListener("change", loadExample);
document.querySelector("#run-html").addEventListener("click", runHtml);
document.querySelector("#reset-html").addEventListener("click", loadExample);
htmlCode.addEventListener("input", () => {
  htmlStatus.textContent =
    "Changes ready. Choose Run Code to update the preview.";
});
loadExample();

const cssEditor = document.querySelector("#css-editor");
const cssPreview = document.querySelector("#css-preview");
const cssPreviewLabel = document.querySelector("#preview-label");
const cssFeedback = document.querySelector("#css-feedback");
const previewMetrics = document.querySelector("#preview-metrics");
const cssDirectory = new URL("../css/", document.currentScript.src);
const previewStyles = new URL("css-preview.css", cssDirectory);
const allowedStyles = location.protocol === "file:" ? "file:" : cssDirectory.href;
const allowedFonts = location.protocol === "file:" ? "file:" : new URL("fonts/", cssDirectory).href;
let learnerStylesUrl;
let practiceStarted = false;

function renderCss(source) {
  const previousStylesUrl = learnerStylesUrl;
  learnerStylesUrl = URL.createObjectURL(new Blob([source], { type: "text/css" }));

  const page = document.implementation.createHTMLDocument("Your CSS preview");
  const charset = page.createElement("meta");
  charset.setAttribute("charset", "utf-8");
  const policy = page.createElement("meta");
  policy.httpEquiv = "Content-Security-Policy";
  policy.content = `default-src 'none'; style-src ${allowedStyles} blob:; font-src ${allowedFonts}; form-action 'none';`;
  page.head.prepend(charset, policy);

  for (const href of [previewStyles.href, learnerStylesUrl]) {
    const link = page.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    page.head.append(link);
  }

  const box = page.createElement("article");
  box.className = "lesson welcome";
  const heading = page.createElement("h1");
  heading.textContent = "Your first lesson";
  const paragraph = page.createElement("p");
  paragraph.textContent = "A little CSS makes a big difference.";
  box.append(heading, paragraph);
  page.body.append(box);
  cssPreview.srcdoc = "<!doctype html>" + page.documentElement.outerHTML;

  if (previousStylesUrl) {
    URL.revokeObjectURL(previousStylesUrl);
  }
}

function updateFeedback() {
  const page = cssPreview.contentDocument;
  const box = page?.querySelector("article");
  if (!box) return;

  const view = page.defaultView;
  const boxStyle = view.getComputedStyle(box);
  const heading = page.querySelector("h1");
  const headingStyle = view.getComputedStyle(heading);
  const sheet = new CSSStyleSheet();
  // This stylesheet remains detached from the website and is used only to parse rules.
  sheet.replaceSync(cssEditor.value);
  const rules = [];

  function collectRules(ruleList) {
    for (const rule of ruleList) {
      if (rule instanceof CSSStyleRule) rules.push(rule);
      if (rule.cssRules) collectRules(rule.cssRules);
    }
  }

  collectRules(sheet.cssRules);

  function matchesRule(element, rule) {
    try {
      return element.matches(rule.selectorText);
    } catch {
      return false;
    }
  }

  const checks = {
    selector: rules.some((rule) => /\.welcome(?![\w-])/.test(rule.selectorText) && matchesRule(box, rule)),
    type: rules.some((rule) => rule.style.fontSize && matchesRule(heading, rule))
      && parseFloat(headingStyle.fontSize) >= 24,
    spacing: ["Top", "Right", "Bottom", "Left"].every((side) =>
      boxStyle[`padding${side}`] === "24px"
      && boxStyle[`border${side}Width`] === "1px"
      && boxStyle[`border${side}Style`] !== "none"),
  };

  const pending = Object.keys(checks).filter((name) => !checks[name]);
  const descriptions = {
    selector: "use a .welcome class selector",
    type: "set the heading font size to at least 24px",
    spacing: "apply 24px padding and a visible 1px border on all sides",
  };
  const labels = { selector: "class selector", type: "readable type", spacing: "visible box spacing" };

  for (const [name, passed] of Object.entries(checks)) {
    const item = cssFeedback.querySelector(`[data-check="${name}"]`);
    item.classList.toggle("check-passed", passed);
    item.classList.toggle("check-missing", !passed);
    item.textContent = passed ? `${labels[name]} ✓` : descriptions[name];
  }

  cssFeedback.setAttribute("aria-label", pending.length
    ? `Keep practising: ${pending.map((name) => descriptions[name]).join("; ")}.`
    : "All checks complete: class selector, readable type, and visible box spacing.");
  previewMetrics.textContent = `${boxStyle.paddingTop} padding / ${boxStyle.borderTopWidth} border / ${boxStyle.borderTopLeftRadius} radius`;
}

cssPreview.addEventListener("load", () => {
  if (practiceStarted) updateFeedback();
});

cssEditor.addEventListener("input", () => {
  practiceStarted = true;
  cssPreviewLabel.textContent = "Your workspace preview";
  cssPreview.title = "Live browser preview of your CSS workspace";
  renderCss(cssEditor.value);
});

cssEditor.disabled = false;
renderCss(document.querySelector("#css-example").textContent);

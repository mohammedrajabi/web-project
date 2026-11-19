const javascriptEditor = document.querySelector("#javascript-editor");
const runButton = document.querySelector("#run-exercise");
const resetButton = document.querySelector("#reset-exercise");
const helloButton = document.querySelector("#hello");
const greetingOutput = document.querySelector("#greeting");
const greetingState = document.querySelector("#greeting-state");
const feedbackPanel = document.querySelector("#exercise-feedback");
const feedbackTitle = document.querySelector("#feedback-title");
const feedbackDetail = document.querySelector("#feedback-detail");
const consoleOutput = document.querySelector("#console-output");
const sandboxHost = document.querySelector("#sandbox-host");
const starterCode = javascriptEditor.value;
const initialGreeting = greetingOutput.textContent;
let runnerFrame;
let pendingSource;
let runToken;
let runTimeout;
let readyToClick = false;

function showFeedback(title, detail, state = "ready") {
  feedbackTitle.textContent = title;
  feedbackDetail.textContent = detail;
  feedbackPanel.dataset.state = state;
}

function stopRunner() {
  clearTimeout(runTimeout);
  runnerFrame?.remove();
  runnerFrame = undefined;
  readyToClick = false;
}

function startRunTimeout() {
  clearTimeout(runTimeout);
  runTimeout = setTimeout(() => {
    stopRunner();
    showFeedback("The exercise took too long", "Check for a loop that never ends, then run your code again.", "error");
  }, 3000);
}

// Serialized into a separate script and called only inside the opaque-origin iframe.
function sandboxBootstrap() {
  const token = document.querySelector("script").dataset.runToken;
  const button = document.querySelector("#hello");
  const greeting = document.querySelector("#greeting");
  const send = (type, detail = "") => parent.postMessage({ token, type, detail }, "*");
  const describe = (value) => {
    if (typeof value === "string") return value;
    if (value instanceof Error) return value.name + ": " + value.message;
    try {
      return JSON.stringify(value) ?? String(value);
    } catch {
      return String(value);
    }
  };

  console.log = (...values) => send("log", values.map(describe).join(" ").slice(0, 8000));
  console.error = (...values) => send("log", values.map(describe).join(" ").slice(0, 8000));
  window.addEventListener("error", (event) => {
    event.preventDefault();
    send("error", event.message);
  });
  window.addEventListener("unhandledrejection", (event) => {
    event.preventDefault();
    send("error", describe(event.reason));
  });

  new MutationObserver(() => send("greeting", greeting.textContent))
    .observe(greeting, { childList: true, characterData: true, subtree: true });

  window.addEventListener("message", (event) => {
    if (event.source !== parent || event.data?.token !== token) return;
    if (event.data.type === "run") {
      try {
        // Learner code executes only in this iframe, without access to the site's origin.
        new Function('"use strict";\n' + event.data.source)();
        send("executed", greeting.textContent);
      } catch (error) {
        send("error", describe(error));
      }
    }
    if (event.data.type === "click") {
      button.click();
      send("clicked", greeting.textContent);
    }
  });
  send("ready");
}

function runExercise() {
  stopRunner();
  pendingSource = javascriptEditor.value;
  runToken = crypto.randomUUID();
  consoleOutput.textContent = "";
  consoleOutput.hidden = true;
  greetingOutput.textContent = initialGreeting;
  greetingState.textContent = "Preview / initial state";
  showFeedback("Running your exercise", "Connecting your code to the greeting button.");

  runnerFrame = document.createElement("iframe");
  runnerFrame.title = "Isolated JavaScript exercise";
  runnerFrame.setAttribute("sandbox", "allow-scripts");
  const page = document.implementation.createHTMLDocument("JavaScript exercise");
  const policy = page.createElement("meta");
  policy.httpEquiv = "Content-Security-Policy";
  policy.content = "default-src 'none'; script-src data: 'unsafe-eval';";
  page.head.prepend(policy);
  const button = page.createElement("button");
  button.id = "hello";
  button.textContent = "Say hello";
  const greeting = page.createElement("p");
  greeting.id = "greeting";
  greeting.textContent = initialGreeting;
  const bootstrap = page.createElement("script");
  bootstrap.dataset.runToken = runToken;
  bootstrap.src = "data:text/javascript;charset=utf-8," + encodeURIComponent(`(${sandboxBootstrap.toString()})();`);
  page.body.append(button, greeting, bootstrap);
  runnerFrame.srcdoc = "<!doctype html>" + page.documentElement.outerHTML;
  sandboxHost.append(runnerFrame);

  startRunTimeout();
}

window.addEventListener("message", (event) => {
  const message = event.data;
  if (!runnerFrame || event.source !== runnerFrame.contentWindow || message?.token !== runToken) return;
  const detail = typeof message.detail === "string" ? message.detail.slice(0, 8000) : "";

  switch (message.type) {
    case "ready":
      runnerFrame.contentWindow.postMessage({ token: runToken, type: "run", source: pendingSource }, "*");
      break;
    case "executed":
      clearTimeout(runTimeout);
      readyToClick = true;
      greetingOutput.textContent = detail;
      showFeedback("Your exercise is running", "Click Say hello to test your function.");
      break;
    case "greeting":
      greetingOutput.textContent = detail;
      greetingState.textContent = "Preview / updated state";
      break;
    case "clicked":
      clearTimeout(runTimeout);
      greetingOutput.textContent = detail;
      if (feedbackPanel.dataset.state === "error") break;
      greetingState.textContent = detail === initialGreeting ? "Preview / initial state" : "Preview / updated state";
      if (detail === "Hello, learner!") {
        showFeedback("Your greeting works!", "Your click listener called the function and updated the DOM.", "success");
      } else if (detail === initialGreeting) {
        showFeedback("The greeting is unchanged", 'Add greeting.textContent = "Hello, learner!"; inside greet(), then run your exercise again.');
      } else {
        showFeedback("Your greeting updated", 'Try setting the greeting to "Hello, learner!" to match the exercise.');
      }
      break;
    case "log":
      consoleOutput.hidden = false;
      if (consoleOutput.textContent.length < 16000) {
        consoleOutput.textContent += detail + "\n";
      }
      break;
    case "error":
      clearTimeout(runTimeout);
      showFeedback("Check your JavaScript", detail + " Correct your code, then run the exercise again.", "error");
      break;
  }
});

runButton.addEventListener("click", runExercise);
helloButton.addEventListener("click", () => {
  if (!readyToClick) {
    showFeedback("Run your exercise first", "Choose Run exercise to connect your code, then click Say hello.");
    return;
  }
  startRunTimeout();
  runnerFrame.contentWindow.postMessage({ token: runToken, type: "click" }, "*");
});

resetButton.addEventListener("click", () => {
  stopRunner();
  javascriptEditor.value = starterCode;
  greetingOutput.textContent = initialGreeting;
  greetingState.textContent = "Preview / initial state";
  consoleOutput.textContent = "";
  consoleOutput.hidden = true;
  showFeedback("Ready to run your exercise", "Add a click listener, call your function, then update the greeting.");
});

javascriptEditor.addEventListener("input", () => {
  stopRunner();
  showFeedback("Your code has changed", "Run your exercise to test these changes.");
});

for (const control of [javascriptEditor, runButton, resetButton, helloButton]) {
  control.disabled = false;
}

const quizQuestions = {
  html: [
    {
      question: "What does HTML describe?",
      options: [
        "The content and meaning of a page",
        "Only a page’s colors",
        "Only click events",
      ],
      answer: 0,
      explanation: "HTML elements describe a page’s content and meaning.",
    },
    {
      question: "Which element contains the visible page content?",
      options: ["head", "body", "title"],
      answer: 1,
      explanation: "The body contains the content readers see.",
    },
    {
      question: "Which heading is used for the main page heading?",
      options: ["h3", "h2", "h1"],
      answer: 2,
      explanation: "Use h1 for the main heading and lower levels for sections.",
    },
    {
      question: "Which attribute gives a link its destination?",
      options: ["href", "alt", "src"],
      answer: 0,
      explanation: "The href attribute identifies a link’s destination.",
    },
    {
      question: "How do you connect a label to an input?",
      options: [
        "Give both the same class",
        "Match the label’s for to the input’s id",
        "Put the label after the form",
      ],
      answer: 1,
      explanation: "A matching for and id associates the label with its input.",
    },
  ],
  css: [
    {
      question: "What does a CSS declaration contain?",
      options: [
        "Only an element name",
        "A property and a value",
        "An HTML closing tag",
      ],
      answer: 1,
      explanation: "A declaration assigns a value to a CSS property.",
    },
    {
      question: 'Which selector matches elements with class="note"?',
      options: ["#note", "note", ".note"],
      answer: 2,
      explanation: "A dot introduces a class selector.",
    },
    {
      question: "Which property changes text color?",
      options: ["color", "background-color", "padding"],
      answer: 0,
      explanation: "The color property controls foreground text color.",
    },
    {
      question: "Where does padding add space?",
      options: [
        "Outside the border",
        "Inside the border",
        "Only between letters",
      ],
      answer: 1,
      explanation: "Padding adds space between content and its border.",
    },
    {
      question: "What lets a layout change at a particular viewport width?",
      options: ["A font family", "An id attribute", "A media query"],
      answer: 2,
      explanation:
        "Media queries apply rules when conditions such as viewport width match.",
    },
  ],
  js: [
    {
      question: "Which declaration allows later reassignment?",
      options: ["let", "const", "return"],
      answer: 0,
      explanation: "Use let when you plan to reassign a variable.",
    },
    {
      question: "Which value is a boolean?",
      options: ["'true'", "true", "42"],
      answer: 1,
      explanation: "Booleans are true or false, without quotation marks.",
    },
    {
      question: "How does a function send a result back to its caller?",
      options: ["With a class", "With querySelector", "With return"],
      answer: 2,
      explanation: "The return statement provides the function’s result.",
    },
    {
      question: "Which method runs a function when a click happens?",
      options: ["addEventListener", "textContent", "classList.add"],
      answer: 0,
      explanation: "addEventListener connects an event to a handler function.",
    },
    {
      question: "Which property updates the text in an element?",
      options: ["font-size", "textContent", "href"],
      answer: 1,
      explanation: "Assigning textContent updates the element’s text.",
    },
  ],
};
const quiz = document.querySelector("[data-quiz]");
const questions = quizQuestions[quiz.dataset.quiz];
let questionIndex = 0;
let score = 0;
let answered = false;

function element(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderQuestion(focus = false) {
  answered = false;
  quiz.replaceChildren();
  const meta = element("div", "quiz-meta");
  const label = element(
    "p",
    "",
    `Question ${questionIndex + 1} of ${questions.length}`,
  );
  const progress = element("progress", "");
  progress.max = questions.length;
  progress.value = questionIndex;
  progress.setAttribute("aria-label", "Questions completed");
  meta.append(label, progress);
  const question = questions[questionIndex];
  const heading = element("h3", "", question.question);
  heading.tabIndex = -1;
  const options = element("div", "quiz-options");
  const feedback = element("p", "quiz-feedback");
  feedback.setAttribute("role", "status");
  const next = element(
    "button",
    "button button-primary",
    questionIndex === questions.length - 1 ? "See results" : "Next question",
  );
  next.type = "button";
  next.disabled = true;

  question.options.forEach((answer, index) => {
    const button = element("button", "quiz-option");
    button.type = "button";
    button.append(
      element("span", "quiz-letter", String.fromCharCode(65 + index)),
      element("span", "", answer),
    );
    button.addEventListener("click", () => {
      if (answered) return;
      answered = true;
      const correct = index === question.answer;
      if (correct) score++;
      for (const [optionIndex, option] of [...options.children].entries()) {
        option.setAttribute("aria-disabled", "true");
        if (optionIndex === question.answer) option.classList.add("correct");
      }
      if (!correct) button.classList.add("incorrect");
      feedback.classList.add(correct ? "correct" : "incorrect");
      feedback.textContent =
        (correct ? "Correct. " : "Not quite. ") + question.explanation;
      next.disabled = false;
      progress.value = questionIndex + 1;
    });
    options.append(button);
  });
  next.addEventListener("click", () => {
    questionIndex++;
    if (questionIndex < questions.length) renderQuestion(true);
    else renderResults();
  });
  quiz.append(meta, heading, options, feedback, next);
  if (focus) heading.focus();
}

function renderResults() {
  const heading = element("h3", "", "Knowledge check complete");
  heading.tabIndex = -1;
  const result = element("p", "score", `${score} / ${questions.length}`);
  const detail = element(
    "p",
    "",
    "Review the lessons or try the knowledge check again.",
  );
  const restart = element("button", "button button-secondary", "Try again");
  restart.type = "button";
  restart.addEventListener("click", () => {
    questionIndex = 0;
    score = 0;
    renderQuestion(true);
  });
  quiz.replaceChildren(heading, result, detail, restart);
  heading.focus();
}

renderQuestion();

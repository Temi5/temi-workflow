// ===============================
// 🧠 SMART RESULT MEMORY FEATURE
// ===============================

let LAST_RESULT = 0;
var currentExpression = "";

// ------------------------------
// Theme Toggle Logic
// ------------------------------
function toggleTheme() {
  const body = document.body;
  const btn = document.getElementById("theme-toggle");

  body.classList.toggle("dark-mode");

  if (body.classList.contains("dark-mode")) {
    btn.innerHTML = "☀️";
    btn.title = "Switch to light mode";
    localStorage.setItem("theme", "dark");
  } else {
    btn.innerHTML = "🌙";
    btn.title = "Switch to dark mode";
    localStorage.setItem("theme", "light");
  }
}

// Set theme on page load from localStorage
window.addEventListener("DOMContentLoaded", function () {
  const theme = localStorage.getItem("theme");
  const body = document.body;
  const btn = document.getElementById("theme-toggle");

  if (btn) {
    if (theme === "dark") {
      body.classList.add("dark-mode");
      btn.innerHTML = "☀️";
      btn.title = "Switch to light mode";
    } else {
      btn.innerHTML = "🌙";
      btn.title = "Switch to dark mode";
    }
  }
});

// ------------------------------
// Calculator State
// ------------------------------
let left = "";
let operator = "";
let right = "";
let steps = [];
const MAX_STEPS = 6;

// ------------------------------
// Basic Calculator Functions
// ------------------------------
function appendToResult(value) {
  currentExpression += value.toString();
  updateResult();
}

function bracketToResult(value) {
  currentExpression += value;
  updateResult();
}

function backspace() {
  currentExpression = currentExpression.slice(0, -1);
  updateResult();
}

function operatorToResult(value) {
  if (value === "^") {
    currentExpression += "**";
  } else {
    currentExpression += value;
  }
  updateResult();
}

function clearResult() {
  currentExpression = "";
  updateResult();
}

function normalizeExpression(expr) {
  return expr
    .replace(/asin\(/g, "asinDeg(")
    .replace(/acos\(/g, "acosDeg(")
    .replace(/atan\(/g, "atanDeg(")
    .replace(/sin\(/g, "sinDeg(")
    .replace(/cos\(/g, "cosDeg(")
    .replace(/tan\(/g, "tanDeg(")
    .replace(/asinh\(/g, "asinh(")
    .replace(/sinh\(/g, "sinh(")
    .replace(/\be\b/g, "Math.E")
    .replace(/\bpi\b/g, "Math.PI");
}

function percentToResult() {
  if (!currentExpression) return;

  const match = currentExpression.match(/(.+?)(\*\*|[+\-*/^])([0-9.]*)$/);

  if (!match) {
    const num = parseFloat(currentExpression);
    if (isNaN(num)) return;

    currentExpression = (num / 100).toString();
  } else {
    const leftPart = match[1];
    const rightPart = match[3];

    if (!rightPart) return;

    let leftVal;

    try {
      leftVal = eval(leftPart);
    } catch (e) {
      leftVal = parseFloat(leftPart);
    }

    const rightVal = parseFloat(rightPart);
    if (isNaN(leftVal) || isNaN(rightVal)) return;

    const percentVal = (leftVal * rightVal) / 100;

    currentExpression = percentVal.toString();
  }

  currentExpression += "*";
  updateResult();
}

// ------------------------------
// Calculate Result
// ------------------------------
function calculateExpression(expression) {
  try {
    let normalizedExpression = normalizeExpression(expression);

    normalizedExpression = normalizedExpression.replace(
      /\bans\b/gi,
      LAST_RESULT,
    );

    let result = eval(normalizedExpression);
    console.log("Calculated result for expression:", expression, "->", result);

    if (isNaN(result) || !isFinite(result)) {
      throw new Error();
    }

    return result;
  } catch (e) {
    return "Error";
  }
}

function calculateResult() {
  if (!currentExpression) return;
  const display = document.getElementById("result");

  let result = calculateExpression(currentExpression);
  result = String(result);

  LAST_RESULT = result;
  display.value = result;

  currentExpression = result;
  updateResult();
}

function updateResult() {
  document.getElementById("result").value = currentExpression || "0";
}


// ===============================
// 🔢 SIGNIFICANT FIGURES ROUNDING
// ===============================

function roundToSF(sf) {
  const display = document.getElementById("result");

  let num;
  const evaluated = calculateExpression(currentExpression);

  if (evaluated === "Error" || evaluated === undefined) {
    num = parseFloat(currentExpression);
  } else {
    num = parseFloat(evaluated);
  }

  if (isNaN(num)) return;

  const rounded = parseFloat(num.toPrecision(sf));

  LAST_RESULT = rounded;
  currentExpression = String(rounded);
  display.value = currentExpression;

  display.classList.add("sf-flash");
  setTimeout(() => display.classList.remove("sf-flash"), 500);

  closeSFPanel();
}

function toggleSFPanel() {
  const panel = document.getElementById("sf-panel");
  const btn   = document.getElementById("sf-trigger-btn");
  const isOpen = panel.classList.contains("open");

  if (isOpen) {
    closeSFPanel();
  } else {
    const rect = btn.getBoundingClientRect();         // ← add this
    panel.style.left   = rect.left   + 'px';          // ← add this
    panel.style.width  = rect.width  + 'px';          // ← add this
    panel.style.bottom = (window.innerHeight - rect.top) + 'px'; // ← add this
    panel.style.top    = 'auto';                      // ← add this

    panel.classList.add("open");
    btn.classList.add("active");
    setTimeout(() => document.addEventListener("click", outsideSFClick), 0);
  }
}

function closeSFPanel() {
  document.getElementById("sf-panel").classList.remove("open");
  document.getElementById("sf-trigger-btn").classList.remove("active");
  document.removeEventListener("click", outsideSFClick);
}

function outsideSFClick(e) {
  const wrapper = document.querySelector(".sf-panel-wrapper");
  if (!wrapper.contains(e.target)) {
    closeSFPanel();
  }
}
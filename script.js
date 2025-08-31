// ======= Config & State =======
const Stocks = [
  "AAPL", "MSFT", "GOOGL", "AMZN", "PYPL",
  "TSLA", "JPM", "NVDA", "NFLX", "DIS",
];

const stockMeta = {
  AAPL: { name: "Apple Inc." },
  MSFT: { name: "Microsoft Corporation" },
  GOOGL: { name: "Alphabet Inc. (Class A)" },
  AMZN: { name: "Amazon.com, Inc." },
  PYPL: { name: "PayPal Holdings, Inc." },
  TSLA: { name: "Tesla, Inc." },
  JPM:  { name: "JPMorgan Chase & Co." },
  NVDA: { name: "NVIDIA Corporation" },
  NFLX: { name: "Netflix, Inc." },
  DIS:  { name: "The Walt Disney Company" },
};

// LocalStorage keys
const LS_KEYS = {
  theme: "spt_theme",
  selectedStock: "spt_selected_stock",
  selectedRange: "spt_selected_range",
  shares: (sym) => `spt_shares_${sym}`,
};

let selectedStock = localStorage.getItem(LS_KEYS.selectedStock) || "AAPL";
let selectedRange = localStorage.getItem(LS_KEYS.selectedRange) || "1month";
let chart;

// ======= Mock Data =======
const mockData = {};
Stocks.forEach((sym) => {
  mockData[sym] = {
    profile: { profit: randomInt(2000, 9000), bookValue: randomInt(90, 160) },
    summary: buildSummary(sym),
    chart: {
      "1month": generateMockPrices(30),
      "3month": generateMockPrices(90),
      "1year": generateMockPrices(365),
      "5year": generateMockPrices(5 * 365),
    },
  };
});

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function buildSummary(sym) {
  const summaries = {
    AAPL: "Apple designs and sells consumer electronics and services.",
    MSFT: "Microsoft develops software, cloud, and AI solutions.",
    GOOGL: "Google provides search, ads, Android, and cloud services.",
    AMZN: "Amazon operates e-commerce, logistics, and AWS cloud.",
    PYPL: "PayPal runs a global digital payments platform.",
    TSLA: "Tesla manufactures EVs and energy solutions.",
    JPM:  "JPMorgan Chase offers banking and financial services.",
    NVDA: "NVIDIA designs GPUs and AI computing platforms.",
    NFLX: "Netflix provides streaming entertainment services.",
    DIS:  "Disney runs media networks, streaming, and parks.",
  };
  return summaries[sym] || "Public company.";
}

// Generate synthetic prices for a given number of days
function generateMockPrices(days) {
  const data = [];
  let basePrice = 100 + Math.random() * 50;
  for (let i = 0; i < days; i++) {
    basePrice += Math.random() * 4 - 2;
    data.push({
      time: Math.floor((Date.now() - (days - i) * 86400000) / 1000),
      price: parseFloat(basePrice.toFixed(2)),
    });
  }
  return data;
}

// ======= Elements =======
const stockListEl = document.getElementById("stockList");
const searchInputEl = document.getElementById("searchInput");
const stockNameEl = document.getElementById("stockName");
const stockFullNameEl = document.getElementById("stockFullName");
const latestPriceEl = document.getElementById("latestPrice");
const stockBookValueEl = document.getElementById("stockBookValue");
const stockSummaryEl = document.getElementById("stockSummary");
const peakLowValuesEl = document.getElementById("peakLowValues");
const sharesInputEl = document.getElementById("sharesInput");
const unrealizedPLEl = document.getElementById("unrealizedPL");
const totalCostEl = document.getElementById("totalCost");
const currentValueEl = document.getElementById("currentValue");
const themeToggleBtn = document.getElementById("themeToggle");
const exportBtn = document.getElementById("exportChart");

// ======= List Rendering with Search =======
function renderList(filter = "") {
  const q = filter.trim().toLowerCase();
  stockListEl.innerHTML = "";

  Stocks.filter((sym) => {
    const full = (stockMeta[sym]?.name || "").toLowerCase();
    return sym.toLowerCase().includes(q) || full.includes(q);
  }).forEach((stock) => {
    const data = mockData[stock]?.profile;
    if (!data) return;

    const item = document.createElement("div");
    item.className = "list-item";

    const left = document.createElement("div");
    left.innerHTML =
      `<div class="symbol">${stock}</div>` +
      `<div class="name">${stockMeta[stock]?.name || ""}</div>`;

    const right = document.createElement("div");
    right.innerHTML = `<div class="badge">BV: ${data.bookValue}</div>`;

    item.appendChild(left);
    item.appendChild(right);

    item.onclick = () => {
      selectedStock = stock;
      localStorage.setItem(LS_KEYS.selectedStock, selectedStock);
      updateChartAndDetails();
      highlightActiveListItem(stock);
      loadSharesForSelected();
    };

    stockListEl.appendChild(item);
  });

  highlightActiveListItem(selectedStock);
}

function highlightActiveListItem(sym) {
  [...stockListEl.children].forEach((el) => (el.style.background = ""));
  const match = [...stockListEl.children].find(
    (el) => el.querySelector(".symbol")?.textContent === sym
  );
  if (match) match.style.background = "rgba(0,0,0,.06)";
}
searchInputEl.addEventListener("input", (e) => renderList(e.target.value));

// ======= Chart Rendering =======
function renderChart() {
  const points = mockData[selectedStock].chart[selectedRange];
  const labels = points.map((p) => new Date(p.time * 1000).toLocaleDateString());
  const prices = points.map((p) => p.price);

  const max = Math.max(...prices);
  const min = Math.min(...prices);
  const maxIdx = prices.indexOf(max);
  const minIdx = prices.indexOf(min);

  peakLowValuesEl.innerHTML =
    `Peak: $${max.toFixed(2)} on ${labels[maxIdx]} | ` +
    `Low: $${min.toFixed(2)} on ${labels[minIdx]}`;

  if (chart) chart.destroy();

  const ctx = document.getElementById("stockChart").getContext("2d");

  // Gradient fill under line
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, "rgba(13,110,253,0.25)");
  gradient.addColorStop(1, "rgba(13,110,253,0.00)");

  // Peak/low point highlight
  const pointRadii = prices.map((_, i) => (i === maxIdx || i === minIdx ? 4 : 0));

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: `${selectedStock} Price`,
          data: prices,
          borderColor: getComputedStyle(document.documentElement)
                        .getPropertyValue("--primary") || "#0d6efd",
          backgroundColor: gradient,
          tension: 0.3,
          fill: true,
          pointRadius: pointRadii,
          pointHoverRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: "rgba(0,0,0,.08)" } },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => `${selectedStock}: $${Number(ctx.raw).toFixed(2)}`,
          },
        },
        legend: { display: false },
      },
    },
  });
}

// ======= Details + Portfolio =======
function renderDetails() {
  const data = mockData[selectedStock];
  const points = data.chart[selectedRange];
  const latest = points[points.length - 1]?.price ?? 0;

  stockNameEl.textContent = selectedStock;
  stockFullNameEl.textContent = stockMeta[selectedStock]?.name || "";
  latestPriceEl.textContent = `$${latest.toFixed(2)}`;
  stockBookValueEl.textContent = `$${Number(data.profile.bookValue).toFixed(2)}`;
  stockSummaryEl.textContent = data.summary;

  // Portfolio metrics
  const shares = Number(sharesInputEl.value || 0);
  const totalCost = shares * Number(data.profile.bookValue);
  const currentValue = shares * latest;
  const pl = currentValue - totalCost;

  totalCostEl.textContent = shares ? `$${totalCost.toFixed(2)}` : "—";
  currentValueEl.textContent = shares ? `$${currentValue.toFixed(2)}` : "—";
  unrealizedPLEl.textContent = shares ? `$${pl.toFixed(2)}` : "—";
  unrealizedPLEl.classList.toggle("green", pl > 0);
  unrealizedPLEl.classList.toggle("red", pl < 0);
}

function updateChartAndDetails() {
  renderChart();
  renderDetails();
  setActiveRangeButton();
}

// ======= Active Range Button =======
function setActiveRangeButton() {
  document.querySelectorAll(".range-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-range") === selectedRange);
  });
}

// ======= Shares persistence =======
function loadSharesForSelected() {
  const saved = localStorage.getItem(LS_KEYS.shares(selectedStock));
  sharesInputEl.value = saved ? Number(saved) : "";
  renderDetails();
}
sharesInputEl.addEventListener("input", () => {
  const val = Math.max(0, Number(sharesInputEl.value || 0));
  sharesInputEl.value = val;
  localStorage.setItem(LS_KEYS.shares(selectedStock), String(val));
  renderDetails();
});

// ======= Theme Toggle =======
function applyTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  themeToggleBtn.textContent = theme === "dark" ? "☀️" : "🌙";
}
function initTheme() {
  const saved = localStorage.getItem(LS_KEYS.theme);
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved || (prefersDark ? "dark" : "light");
  applyTheme(theme);
}
themeToggleBtn.addEventListener("click", () => {
  const isDark = document.documentElement.classList.toggle("dark");
  const theme = isDark ? "dark" : "light";
  localStorage.setItem(LS_KEYS.theme, theme);
  themeToggleBtn.textContent = isDark ? "☀️" : "🌙";
  // Repaint chart to pick CSS var color in dark mode
  renderChart();
});

// ======= Export Chart =======
exportBtn.addEventListener("click", () => {
  if (!chart) return;
  const link = document.createElement("a");
  link.download = `${selectedStock}_${selectedRange}_chart.png`;
  link.href = chart.toBase64Image();
  link.click();
});

// ======= Range buttons =======
document.querySelectorAll(".chart-controls .range-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedRange = btn.getAttribute("data-range");
    localStorage.setItem(LS_KEYS.selectedRange, selectedRange);
    updateChartAndDetails();
  });
});

// ======= Init =======
(function init() {
  // Theme
  initTheme();

  // UI
  renderList();
  setActiveRangeButton();

  // Shares for selected
  loadSharesForSelected();

  // Chart + details
  updateChartAndDetails();

  // Restore selected stock if it was filtered out
  searchInputEl.value = "";
})();

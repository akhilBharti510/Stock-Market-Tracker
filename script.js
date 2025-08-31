const Stocks = [
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "PYPL",
  "TSLA",
  "JPM",
  "NVDA",
  "NFLX",
  "DIS",
];

const stockListEl = document.getElementById("stockList");
const stockNameEl = document.getElementById("stockName");
const stockProfitEl = document.getElementById("stockProfit");
const stockBookValueEl = document.getElementById("stockBookValue");
const stockSummaryEl = document.getElementById("stockSummary");
const peakLowValuesEl = document.getElementById("peakLowValues");

let selectedStock = "AAPL";
let selectedRange = "1month";
let chart;

const mockData = {
  AAPL: {
    profile: { profit: 5000, bookValue: 120 },
    summary: "Apple designs and sells consumer electronics.",
    chart: {
      "1month": generateMockPrices(30),
      "3month": generateMockPrices(90),
      "1year": generateMockPrices(365),
      "5year": generateMockPrices(5 * 365),
    },
  },
  MSFT: {
    profile: { profit: 6000, bookValue: 130 },
    summary: "Microsoft develops, licenses software products.",
    chart: {
      "1month": generateMockPrices(30),
      "3month": generateMockPrices(90),
      "1year": generateMockPrices(365),
      "5year": generateMockPrices(5 * 365),
    },
  },
  GOOGL: {
    profile: { profit: 8000, bookValue: 150 },
    summary: "Google provides search engine and advertising services.",
    chart: {
      "1month": generateMockPrices(30),
      "3month": generateMockPrices(90),
      "1year": generateMockPrices(365),
      "5year": generateMockPrices(5 * 365),
    },
  },
  AMZN: {
    profile: { profit: 7000, bookValue: 140 },
    summary: "Amazon operates as an e-commerce and cloud computing company.",
    chart: {
      "1month": generateMockPrices(30),
      "3month": generateMockPrices(90),
      "1year": generateMockPrices(365),
      "5year": generateMockPrices(5 * 365),
    },
  },
  TSLA: {
    profile: { profit: 9000, bookValue: 110 },
    summary: "Tesla designs and manufactures electric vehicles.",
    chart: {
      "1month": generateMockPrices(30),
      "3month": generateMockPrices(90),
      "1year": generateMockPrices(365),
      "5year": generateMockPrices(5 * 365),
    },
  },
  NFLX: {
    profile: { profit: 4000, bookValue: 100 },
    summary: "Netflix provides streaming entertainment services.",
    chart: {
      "1month": generateMockPrices(30),
      "3month": generateMockPrices(90),
      "1year": generateMockPrices(365),
      "5year": generateMockPrices(5 * 365),
    },
  },
  JPM: {
    profile: { profit: 6500, bookValue: 125 },
    summary: "JPMorgan Chase is a financial services company.",
    chart: {
      "1month": generateMockPrices(30),
      "3month": generateMockPrices(90),
      "1year": generateMockPrices(365),
      "5year": generateMockPrices(5 * 365),
    },
  },
  NVDA: {
    profile: { profit: 7500, bookValue: 135 },
    summary: "NVIDIA designs graphics processing units.",
    chart: {
      "1month": generateMockPrices(30),
      "3month": generateMockPrices(90),
      "1year": generateMockPrices(365),
      "5year": generateMockPrices(5 * 365),
    },
  },
  DIS: {
    profile: { profit: 5200, bookValue: 115 },
    summary: "Disney operates media networks and parks.",
    chart: {
      "1month": generateMockPrices(30),
      "3month": generateMockPrices(90),
      "1year": generateMockPrices(365),
      "5year": generateMockPrices(5 * 365),
    },
  },
  PYPL: {
    profile: { profit: 5800, bookValue: 118 },
    summary: "PayPal operates a digital payments platform.",
    chart: {
      "1month": generateMockPrices(30),
      "3month": generateMockPrices(90),
      "1year": generateMockPrices(365),
      "5year": generateMockPrices(5 * 365),
    },
  },
};

// Generate prices for a given number of days
function generateMockPrices(days) {
  let data = [];
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

function renderList() {
  stockListEl.innerHTML = "";
  Stocks.forEach((stock) => {
    const data = mockData[stock]?.profile;
    if (!data) return;

    const item = document.createElement("div");
    item.className = "list-item";
    item.innerHTML = `<strong>${stock}</strong><br>Profit: <span class="${
      data.profit > 0 ? "green" : "red"
    }">${data.profit}</span><br>Book Value: ${data.bookValue}`;
    item.onclick = () => {
      selectedStock = stock;
      updateChartAndDetails();
    };
    stockListEl.appendChild(item);
  });
}

function renderChart() {
  const points = mockData[selectedStock].chart[selectedRange];
  const timestamps = points.map((p) =>
    new Date(p.time * 1000).toLocaleDateString()
  );
  const prices = points.map((p) => p.price);
  const max = Math.max(...prices);
  const min = Math.min(...prices);

  peakLowValuesEl.innerHTML = `Peak: $${max} | Low: $${min}`;

  if (chart) chart.destroy();

  const ctx = document.getElementById("stockChart").getContext("2d");
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: timestamps,
      datasets: [
        {
          label: `${selectedStock} Price`,
          data: prices,
          borderColor: "#007bff",
          tension: 0.3,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => `${selectedStock}: $${context.raw}`,
          },
        },
      },
    },
  });
}

function renderDetails() {
  const data = mockData[selectedStock];
  stockNameEl.textContent = selectedStock;
  stockProfitEl.textContent = data.profile.profit;
  stockProfitEl.className = data.profile.profit > 0 ? "green" : "red";
  stockBookValueEl.textContent = data.profile.bookValue;
  stockSummaryEl.textContent = data.summary;
}

function updateChartAndDetails() {
  renderChart();
  renderDetails();
}

document.querySelectorAll(".chart-controls button").forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedRange = btn.getAttribute("data-range");
    updateChartAndDetails();
  });
});

(function init() {
  renderList();
  updateChartAndDetails();
})();

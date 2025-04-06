// === COMPARISON TOOLS ===

/**
 * Initializes scenario comparison tools
 * Adds functionality to compare different retirement scenarios
 */
function initializeComparisonTools() {
  // Check if comparison tool container exists
  if (!document.getElementById("scenario-comparison-tool")) {
    createComparisonToolUI();
  }

  // Add event listeners to comparison buttons
  const compareButtons = document.querySelectorAll(".compare-scenario-btn");
  compareButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const scenarioId = this.getAttribute("data-scenario");
      addScenarioToComparison(scenarioId);
    });
  });

  // Add clear comparison button event listener
  const clearComparisonBtn = document.getElementById("clear-comparison-btn");
  if (clearComparisonBtn) {
    clearComparisonBtn.addEventListener("click", clearScenarioComparison);
  }
  // Add compare buttons to all scenario cards if they don't exist
  document
    .querySelectorAll("#retirement-scenarios .scenario-card")
    .forEach((card) => {
      if (!card.querySelector(".compare-scenario-btn")) {
        const scenarioTitle =
          card.querySelector(".scenario-title")?.textContent || "";
        const compareBtn = document.createElement("button");
        compareBtn.className =
          "compare-scenario-btn text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200 mt-2";
        compareBtn.textContent = "Compare";
        compareBtn.setAttribute(
          "data-scenario",
          scenarioNameToId(scenarioTitle)
        );
        card.appendChild(compareBtn);
      }
    });
}

/**
 * Creates the UI for the scenario comparison tool
 */
function createComparisonToolUI() {
  // Only create if retirement tab exists
  const retirementTab = document.getElementById("retirement-tab");
  if (!retirementTab) return;

  // Create comparison tool container
  const comparisonTool = document.createElement("div");
  comparisonTool.id = "scenario-comparison-tool";
  comparisonTool.className = "panel mt-6";

  // Create HTML content
  comparisonTool.innerHTML = `
      <div class="flex justify-between items-center mb-4">
        <h3 class="panel-title mb-0">Scenario Comparison</h3>
        <button id="clear-comparison-btn" class="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded">
          Clear All
        </button>
      </div>
      <div id="comparison-placeholder" class="text-center py-8 text-gray-500">
        Click "Compare" on any scenario to add it to the comparison
      </div>
      <div id="comparison-content" class="hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-100">
                <th class="text-left py-2 px-3">Scenario</th>
                <th class="text-right py-2 px-3">Retirement Age</th>
                <th class="text-right py-2 px-3">Monthly Savings</th>
                <th class="text-right py-2 px-3">Total Corpus</th>
                <th class="text-right py-2 px-3">Monthly Income</th>
                <th class="text-right py-2 px-3">Feasibility</th>
                <th class="text-center py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody id="comparison-scenarios">
              <!-- Scenarios will be added here -->
            </tbody>
          </table>
        </div>
        <div class="mt-6">
          <canvas id="comparison-chart" height="300"></canvas>
        </div>
      </div>
    `;

  // Add to retirement tab
  retirementTab.appendChild(comparisonTool);

  // Add compare buttons to all scenario cards
  document.querySelectorAll("#retirement-scenarios > div").forEach((card) => {
    const h5Element = card.querySelector("h5");
    if (h5Element) {
      // Check if h5 element exists
      const scenarioName = h5Element.textContent;
      const compareBtn = document.createElement("button");
      compareBtn.className =
        "compare-scenario-btn text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200 mt-2";
      compareBtn.textContent = "Compare";
      compareBtn.setAttribute("data-scenario", scenarioNameToId(scenarioName));
      card.appendChild(compareBtn);
    }
  });
}

/**
 * Converts scenario name to ID for data lookup
 *
 * @param {string} name Scenario name
 * @returns {string} Scenario ID
 */
function scenarioNameToId(name) {
  const nameMap = {
    "Base Plan": "base",
    "Early Retirement": "early_retirement",
    "Delayed Retirement": "delayed_retirement",
    "Conservative Returns": "conservative_returns",
    "Reduced Expenses": "reduced_expenses",
    Longevity: "longevity",
  };

  return nameMap[name] || name.toLowerCase().replace(/\s+/g, "_");
}

/**
 * Adds a scenario to the comparison table
 *
 * @param {string} scenarioId ID of the scenario to add
 */
function addScenarioToComparison(scenarioId) {
  // Get scenario data
  const retirementResults = window.calculationResults.retirementResults;
  const scenario = retirementResults.scenarios[scenarioId];

  if (!scenario) return;

  // Hide placeholder, show content
  document.getElementById("comparison-placeholder").classList.add("hidden");
  document.getElementById("comparison-content").classList.remove("hidden");

  // Check if scenario is already in comparison
  const existingRow = document.querySelector(`#comparison-row-${scenarioId}`);
  if (existingRow) {
    // Highlight existing row temporarily
    existingRow.classList.add("bg-yellow-100");
    setTimeout(() => {
      existingRow.classList.remove("bg-yellow-100");
    }, 1500);
    return;
  }

  // Create new row
  const tableBody = document.getElementById("comparison-scenarios");
  const row = document.createElement("tr");
  row.id = `comparison-row-${scenarioId}`;
  row.className = "border-b";

  // Calculate monthly income in retirement
  const monthlyIncome =
    (scenario.corpus * SAFE_WITHDRAWAL_RATES[userData.riskTolerance]) / 12;

  // Fill row content
  row.innerHTML = `
      <td class="py-2 px-3 font-medium">${scenario.name}</td>
      <td class="py-2 px-3 text-right">${scenario.retirement_age}</td>
      <td class="py-2 px-3 text-right">${formatCurrency(
        scenario.monthly_savings
      )}</td>
      <td class="py-2 px-3 text-right">${formatCurrency(scenario.corpus)}</td>
      <td class="py-2 px-3 text-right">${formatCurrency(monthlyIncome)}</td>
      <td class="py-2 px-3 text-right">
        <div class="inline-flex items-center">
          <span class="mr-2">${scenario.feasibility}/10</span>
          <div class="w-16 bg-gray-200 rounded-full h-1.5">
            <div class="bg-blue-600 h-1.5 rounded-full" style="width: ${
              scenario.feasibility * 10
            }%"></div>
          </div>
        </div>
      </td>
      <td class="py-2 px-3 text-center">
        <button class="remove-scenario-btn text-xs px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
          data-scenario="${scenarioId}">
          Remove
        </button>
      </td>
    `;

  // Add event listener to remove button
  row
    .querySelector(".remove-scenario-btn")
    .addEventListener("click", function () {
      removeScenarioFromComparison(this.getAttribute("data-scenario"));
    });

  // Add to table
  tableBody.appendChild(row);

  // Update comparison chart
  updateComparisonChart();
}

/**
 * Removes a scenario from the comparison table
 *
 * @param {string} scenarioId ID of the scenario to remove
 */
function removeScenarioFromComparison(scenarioId) {
  // Remove row
  const row = document.getElementById(`comparison-row-${scenarioId}`);
  if (row) {
    row.remove();
  }

  // Check if table is now empty
  const tableBody = document.getElementById("comparison-scenarios");
  if (tableBody.children.length === 0) {
    // Show placeholder, hide content
    document
      .getElementById("comparison-placeholder")
      .classList.remove("hidden");
    document.getElementById("comparison-content").classList.add("hidden");
  } else {
    // Update chart
    updateComparisonChart();
  }
}

/**
 * Clears all scenarios from the comparison
 */
function clearScenarioComparison() {
  // Clear table
  document.getElementById("comparison-scenarios").innerHTML = "";

  // Show placeholder, hide content
  document.getElementById("comparison-placeholder").classList.remove("hidden");
  document.getElementById("comparison-content").classList.add("hidden");

  // Destroy chart
  if (window.comparisonChart) {
    window.comparisonChart.destroy();
    window.comparisonChart = null;
  }
}

/**
 * Updates the scenario comparison chart
 */
function updateComparisonChart() {
  // Get scenarios from table
  const scenarios = [];
  document.querySelectorAll("#comparison-scenarios tr").forEach((row) => {
    const scenarioId = row.id.replace("comparison-row-", "");
    const retirementResults = window.calculationResults.retirementResults;
    const scenario = retirementResults.scenarios[scenarioId];

    if (scenario) {
      scenarios.push(scenario);
    }
  });

  if (scenarios.length === 0) return;

  // Prepare chart data
  const labels = scenarios.map((s) => s.name);
  const corpusData = scenarios.map((s) => s.corpus);
  const savingsData = scenarios.map((s) => s.monthly_savings * 100); // Scale for visibility
  const feasibilityData = scenarios.map((s) => (s.feasibility * s.corpus) / 10); // Scale based on corpus

  // Create or update chart
  const ctx = document.getElementById("comparison-chart").getContext("2d");

  if (window.comparisonChart) {
    window.comparisonChart.destroy();
  }

  window.comparisonChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Total Corpus",
          data: corpusData,
          backgroundColor: "rgba(79, 70, 229, 0.7)",
          borderColor: "rgba(79, 70, 229, 1)",
          borderWidth: 1,
        },
        {
          label: "Monthly Savings (×100)",
          data: savingsData,
          backgroundColor: "rgba(16, 185, 129, 0.7)",
          borderColor: "rgba(16, 185, 129, 1)",
          borderWidth: 1,
        },
        {
          label: "Feasibility Factor",
          data: feasibilityData,
          backgroundColor: "rgba(245, 158, 11, 0.7)",
          borderColor: "rgba(245, 158, 11, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              if (value >= 10000000) {
                return "₹" + (value / 10000000).toFixed(1) + "Cr";
              } else if (value >= 100000) {
                return "₹" + (value / 100000).toFixed(1) + "L";
              }
              return value;
            },
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.dataset.label || "";
              const value = context.raw;

              if (label === "Monthly Savings (×100)") {
                return "Monthly Savings: " + formatCurrency(value / 100);
              } else if (label === "Feasibility Factor") {
                const scenario = scenarios[context.dataIndex];
                return `Feasibility: ${scenario.feasibility}/10`;
              } else {
                return label + ": " + formatCurrency(value);
              }
            },
          },
        },
      },
    },
  });
}

// === TAX CALCULATORS ===

/**
 * Initializes tax calculators for investment optimization
 */
function initializeTaxCalculators() {
  // Check if tax calculator container exists
  if (!document.getElementById("tax-calculator-section")) {
    createTaxCalculatorUI();
  }

  // Add event listeners to calculator inputs
  setupTaxCalculatorEvents();
}

/**
 * Creates the UI for the tax calculator
 */
function createTaxCalculatorUI() {
  // Only create if investment tab exists
  const investmentTab = document.getElementById("investments-tab");
  if (!investmentTab) return;

  // Create tax calculator container
  const taxCalculator = document.createElement("div");
  taxCalculator.id = "tax-calculator-section";
  taxCalculator.className = "panel mt-6";

  // Create HTML content
  taxCalculator.innerHTML = `
      <h3 class="panel-title">Tax-Optimized Investment Calculator</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 class="font-medium mb-3">Compare Investment Tax Efficiency</h4>
          <div class="space-y-4">
            <div class="form-group">
              <label for="investment-amount">Investment Amount (₹)</label>
              <input type="number" id="investment-amount" class="form-input" value="100000">
            </div>
            <div class="form-group">
              <label for="investment-duration">Investment Duration (Years)</label>
              <input type="number" id="investment-duration" class="form-input" value="5">
            </div>
            <div class="form-group">
              <label for="investment-return">Expected Return Rate (%)</label>
              <input type="number" id="investment-return" class="form-input" value="10">
            </div>
            <div class="form-group">
              <label for="tax-bracket">Tax Bracket (%)</label>
              <select id="tax-bracket" class="form-select">
                <option value="0">0% (No Tax)</option>
                <option value="5">5%</option>
                <option value="10">10%</option>
                <option value="15">15%</option>
                <option value="20">20%</option>
                <option value="30" selected>30%</option>
              </select>
            </div>
            <div class="form-group">
              <label for="investment-type">Investment Type</label>
              <select id="investment-type" class="form-select">
                <option value="equity_mutual_fund">Equity Mutual Fund</option>
                <option value="debt_mutual_fund">Debt Mutual Fund</option>
                <option value="fixed_deposit">Fixed Deposit</option>
                <option value="ppf">Public Provident Fund</option>
                <option value="nps">National Pension System</option>
              </select>
            </div>
            <button id="calculate-tax-btn" class="btn-primary w-full">Calculate Returns</button>
          </div>
        </div>
        <div id="tax-results" class="bg-gray-50 p-4 rounded-lg">
          <div id="tax-results-placeholder" class="text-center py-8 text-gray-500">
            Enter investment details and click Calculate to see results
          </div>
          <div id="tax-results-content" class="hidden">
            <!-- Results will be displayed here -->
          </div>
        </div>
      </div>
    `;

  // Add to investment tab
  investmentTab.appendChild(taxCalculator);
}

/**
 * Sets up event listeners for tax calculator
 */
function setupTaxCalculatorEvents() {
  const calculateBtn = document.getElementById("calculate-tax-btn");
  if (calculateBtn) {
    calculateBtn.addEventListener("click", calculateTaxEfficiency);
  }
}

/**
 * Calculates tax efficiency of different investment options
 */
function calculateTaxEfficiency() {
  // Get input values
  const amount =
    parseFloat(document.getElementById("investment-amount").value) || 100000;
  const years =
    parseInt(document.getElementById("investment-duration").value) || 5;
  const returnRate =
    parseFloat(document.getElementById("investment-return").value) || 10;
  const taxBracket =
    parseFloat(document.getElementById("tax-bracket").value) || 30;
  const investmentType = document.getElementById("investment-type").value;

  // Hide placeholder, show content
  document.getElementById("tax-results-placeholder").classList.add("hidden");
  document.getElementById("tax-results-content").classList.remove("hidden");

  // Calculate returns based on investment type
  let result;

  switch (investmentType) {
    case "equity_mutual_fund":
      result = calculateEquityMutualFundReturns(
        amount,
        years,
        returnRate,
        taxBracket
      );
      break;
    case "debt_mutual_fund":
      result = calculateDebtMutualFundReturns(
        amount,
        years,
        returnRate,
        taxBracket
      );
      break;
    case "fixed_deposit":
      result = calculateFixedDepositReturns(
        amount,
        years,
        returnRate,
        taxBracket
      );
      break;
    case "ppf":
      result = calculatePPFReturns(amount, years, returnRate);
      break;
    case "nps":
      result = calculateNPSReturns(amount, years, returnRate, taxBracket);
      break;
    default:
      result = calculateEquityMutualFundReturns(
        amount,
        years,
        returnRate,
        taxBracket
      );
  }

  // Update results UI
  updateTaxResultsUI(result, amount, years);
}

/**
 * Calculates returns for equity mutual funds
 *
 * @param {number} amount Investment amount
 * @param {number} years Investment duration
 * @param {number} returnRate Expected annual return rate (%)
 * @param {number} taxBracket Tax bracket (%)
 * @returns {Object} Calculation results
 */
function calculateEquityMutualFundReturns(
  amount,
  years,
  returnRate,
  taxBracket
) {
  const rate = returnRate / 100;
  const taxRate = taxBracket / 100;

  // Calculate future value without tax
  const futureValue = amount * Math.pow(1 + rate, years);
  const totalGain = futureValue - amount;

  // Calculate tax
  let taxAmount;
  if (years > 1) {
    // Long-term capital gains tax (10% for equity without indexation, with ₹1 lakh exemption)
    const exemptionAmount = Math.min(totalGain, 100000);
    const taxableGain = totalGain - exemptionAmount;
    taxAmount = Math.max(0, taxableGain * 0.1);
  } else {
    // Short-term capital gains tax (15% for equity)
    taxAmount = totalGain * 0.15;
  }

  // Calculate after-tax value
  const afterTaxValue = futureValue - taxAmount;
  const effectiveTaxRate = (taxAmount / totalGain) * 100;
  const cagr = (Math.pow(afterTaxValue / amount, 1 / years) - 1) * 100;

  return {
    investmentType: "Equity Mutual Fund",
    futureValue: futureValue,
    totalGain: totalGain,
    taxAmount: taxAmount,
    afterTaxValue: afterTaxValue,
    effectiveTaxRate: effectiveTaxRate,
    cagr: cagr,
    taxNotes:
      years > 1
        ? "Long-term capital gains taxed at 10% with ₹1 lakh exemption"
        : "Short-term capital gains taxed at 15%",
  };
}

/**
 * Calculates returns for debt mutual funds
 *
 * @param {number} amount Investment amount
 * @param {number} years Investment duration
 * @param {number} returnRate Expected annual return rate (%)
 * @param {number} taxBracket Tax bracket (%)
 * @returns {Object} Calculation results
 */
function calculateDebtMutualFundReturns(amount, years, returnRate, taxBracket) {
  const rate = returnRate / 100;
  const taxRate = taxBracket / 100;

  // Calculate future value without tax
  const futureValue = amount * Math.pow(1 + rate, years);
  const totalGain = futureValue - amount;

  // Calculate tax
  let taxAmount;
  if (years > 3) {
    // Long-term capital gains tax (20% with indexation)
    // Assume inflation of 4% for indexation
    const inflationRate = 0.04;
    const indexationFactor = Math.pow(1 + inflationRate, years);
    const indexedCost = amount * indexationFactor;
    const indexedGain = Math.max(0, futureValue - indexedCost);
    taxAmount = indexedGain * 0.2;
  } else {
    // Short-term capital gains tax (added to income, taxed at slab rate)
    taxAmount = totalGain * taxRate;
  }

  // Calculate after-tax value
  const afterTaxValue = futureValue - taxAmount;
  const effectiveTaxRate = (taxAmount / totalGain) * 100;
  const cagr = (Math.pow(afterTaxValue / amount, 1 / years) - 1) * 100;

  return {
    investmentType: "Debt Mutual Fund",
    futureValue: futureValue,
    totalGain: totalGain,
    taxAmount: taxAmount,
    afterTaxValue: afterTaxValue,
    effectiveTaxRate: effectiveTaxRate,
    cagr: cagr,
    taxNotes:
      years > 3
        ? "Long-term capital gains taxed at 20% with indexation benefit"
        : "Short-term capital gains taxed at income tax slab rate",
  };
}

/**
 * Calculates returns for fixed deposits
 *
 * @param {number} amount Investment amount
 * @param {number} years Investment duration
 * @param {number} returnRate Expected annual return rate (%)
 * @param {number} taxBracket Tax bracket (%)
 * @returns {Object} Calculation results
 */
function calculateFixedDepositReturns(amount, years, returnRate, taxBracket) {
  const rate = returnRate / 100;
  const taxRate = taxBracket / 100;

  // Calculate future value with compounding (interest is taxed annually)
  let currentAmount = amount;
  for (let i = 0; i < years; i++) {
    const yearlyInterest = currentAmount * rate;
    const taxOnInterest = yearlyInterest * taxRate;
    currentAmount += yearlyInterest - taxOnInterest;
  }

  const futureValue = currentAmount;
  const totalGain = futureValue - amount;
  const taxAmount = amount * Math.pow(1 + rate, years) - futureValue;
  const effectiveTaxRate = taxRate * 100;
  const cagr = (Math.pow(futureValue / amount, 1 / years) - 1) * 100;

  return {
    investmentType: "Fixed Deposit",
    futureValue: futureValue,
    totalGain: totalGain,
    taxAmount: taxAmount,
    afterTaxValue: futureValue,
    effectiveTaxRate: effectiveTaxRate,
    cagr: cagr,
    taxNotes: "Interest is taxed annually at income tax slab rate",
  };
}

/**
 * Calculates returns for Public Provident Fund (PPF)
 *
 * @param {number} amount Investment amount
 * @param {number} years Investment duration
 * @param {number} returnRate Expected annual return rate (%)
 * @returns {Object} Calculation results
 */
function calculatePPFReturns(amount, years, returnRate) {
  // For PPF, use standard interest rate if user didn't change the default
  const rate = returnRate === 10 ? 0.071 : returnRate / 100; // Current PPF rate is 7.1%

  // Calculate future value with compounding
  const futureValue = amount * Math.pow(1 + rate, years);
  const totalGain = futureValue - amount;

  // PPF is tax-free
  const taxAmount = 0;
  const afterTaxValue = futureValue;
  const effectiveTaxRate = 0;
  const cagr = rate * 100;

  return {
    investmentType: "Public Provident Fund",
    futureValue: futureValue,
    totalGain: totalGain,
    taxAmount: taxAmount,
    afterTaxValue: afterTaxValue,
    effectiveTaxRate: effectiveTaxRate,
    cagr: cagr,
    taxNotes: "PPF is completely tax-free (exempt-exempt-exempt)",
    additionalNotes:
      "PPF has a lock-in period of 15 years with partial withdrawal allowed after 7 years",
  };
}

/**
 * Calculates returns for National Pension System (NPS)
 *
 * @param {number} amount Investment amount
 * @param {number} years Investment duration
 * @param {number} returnRate Expected annual return rate (%)
 * @param {number} taxBracket Tax bracket (%)
 * @returns {Object} Calculation results
 */
function calculateNPSReturns(amount, years, returnRate, taxBracket) {
  const rate = returnRate / 100;
  const taxRate = taxBracket / 100;

  // Calculate future value with compounding
  const futureValue = amount * Math.pow(1 + rate, years);
  const totalGain = futureValue - amount;

  // NPS taxation: 60% can be withdrawn tax-free at maturity, 40% has to be used for annuity
  const taxFreeAmount = futureValue * 0.6;
  const annuityAmount = futureValue * 0.4;

  // No immediate tax on annuity portion, but eventual annuity income will be taxed
  const taxAmount = 0;
  const afterTaxValue = futureValue;
  const effectiveTaxRate = 0; // During accumulation phase
  const cagr = rate * 100;

  return {
    investmentType: "National Pension System",
    futureValue: futureValue,
    totalGain: totalGain,
    taxAmount: taxAmount,
    afterTaxValue: afterTaxValue,
    effectiveTaxRate: effectiveTaxRate,
    cagr: cagr,
    taxNotes: "60% tax-free withdrawal at maturity, 40% mandatory annuity",
    additionalNotes:
      "Additional tax deduction of up to ₹50,000 under Sec 80CCD(1B)",
    taxFreeAmount: taxFreeAmount,
    annuityAmount: annuityAmount,
  };
}

/**
 * Updates the tax calculator results UI
 *
 * @param {Object} result Calculation results
 * @param {number} amount Original investment amount
 * @param {number} years Investment duration
 */
function updateTaxResultsUI(result, amount, years) {
  const resultsContainer = document.getElementById("tax-results-content");

  resultsContainer.innerHTML = `
      <h4 class="font-medium text-lg mb-3">${
        result.investmentType
      } - Tax Analysis</h4>
      
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div class="bg-white p-3 rounded border">
          <div class="text-sm text-gray-600">Investment Amount</div>
          <div class="font-medium text-lg">${formatCurrency(amount)}</div>
        </div>
        <div class="bg-white p-3 rounded border">
          <div class="text-sm text-gray-600">After ${years} Years</div>
          <div class="font-medium text-lg">${formatCurrency(
            result.afterTaxValue
          )}</div>
        </div>
      </div>
      
      <div class="bg-indigo-50 p-3 rounded mb-4">
        <div class="font-medium mb-1">Effective Annual Return (CAGR)</div>
        <div class="text-2xl font-bold text-indigo-700">${result.cagr.toFixed(
          2
        )}%</div>
      </div>
      
      <table class="w-full text-sm mb-4">
        <tr class="border-b">
          <td class="py-2">Total Value (Before Tax)</td>
          <td class="py-2 text-right">${formatCurrency(result.futureValue)}</td>
        </tr>
        <tr class="border-b">
          <td class="py-2">Total Gain</td>
          <td class="py-2 text-right">${formatCurrency(result.totalGain)}</td>
        </tr>
        <tr class="border-b">
          <td class="py-2">Tax Amount</td>
          <td class="py-2 text-right">${formatCurrency(result.taxAmount)}</td>
        </tr>
        <tr class="border-b">
          <td class="py-2">Net Amount</td>
          <td class="py-2 text-right font-medium">${formatCurrency(
            result.afterTaxValue
          )}</td>
        </tr>
        <tr>
          <td class="py-2">Effective Tax Rate</td>
          <td class="py-2 text-right">${result.effectiveTaxRate.toFixed(
            2
          )}%</td>
        </tr>
      </table>
      
      <div class="bg-blue-50 p-3 rounded text-sm text-blue-800">
        <div class="font-medium mb-1">Tax Information</div>
        <p>${result.taxNotes}</p>
        ${
          result.additionalNotes
            ? `<p class="mt-1">${result.additionalNotes}</p>`
            : ""
        }
      </div>
    `;

  // Add NPS-specific information if applicable
  if (result.investmentType === "National Pension System") {
    const npsInfo = document.createElement("div");
    npsInfo.className = "mt-4 bg-green-50 p-3 rounded text-sm";
    npsInfo.innerHTML = `
        <div class="font-medium mb-1">NPS Withdrawal Breakdown</div>
        <div class="grid grid-cols-2 gap-4 mt-2">
          <div>
            <div class="text-green-800">Tax-Free (60%)</div>
            <div class="font-medium">${formatCurrency(
              result.taxFreeAmount
            )}</div>
          </div>
          <div>
            <div class="text-yellow-800">Annuity (40%)</div>
            <div class="font-medium">${formatCurrency(
              result.annuityAmount
            )}</div>
          </div>
        </div>
      `;
    resultsContainer.appendChild(npsInfo);
  }
}

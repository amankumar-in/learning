// === SIP CALCULATOR ===

/**
 * Initializes the SIP calculator tool
 */
function initializeSIPCalculator() {
  // Check if SIP calculator container exists
  if (!document.getElementById("sip-calculator-section")) {
    createSIPCalculatorUI();
  }

  // Add event listeners to calculator inputs
  setupSIPCalculatorEvents();
}

/**
 * Creates the UI for the SIP calculator
 */
function createSIPCalculatorUI() {
  // Only create if investment tab exists
  const investmentTab = document.getElementById("investments-tab");
  if (!investmentTab) return;

  // Create SIP calculator container
  const sipCalculator = document.createElement("div");
  sipCalculator.id = "sip-calculator-section";
  sipCalculator.className = "panel mt-6";

  // Create HTML content
  sipCalculator.innerHTML = `
      <h3 class="panel-title">SIP Calculator</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 class="font-medium mb-3">Calculate SIP Returns</h4>
          <div class="space-y-4">
            <div class="form-group">
              <label for="sip-amount">Monthly SIP Amount (₹)</label>
              <input type="number" id="sip-amount" class="form-input" value="10000">
            </div>
            <div class="form-group">
              <label for="sip-duration">Investment Period (Years)</label>
              <input type="number" id="sip-duration" class="form-input" value="15">
            </div>
            <div class="form-group">
              <label for="sip-return">Expected Return Rate (% p.a.)</label>
              <input type="number" id="sip-return" class="form-input" value="12">
            </div>
            <div class="form-group">
              <label for="sip-step-up">Annual Step-Up (%)</label>
              <input type="number" id="sip-step-up" class="form-input" value="0">
              <div class="text-xs text-gray-500 mt-1">
                Increase your SIP amount annually to grow with your income
              </div>
            </div>
            <button id="calculate-sip-btn" class="btn-primary w-full">Calculate SIP Returns</button>
          </div>
        </div>
        <div id="sip-results" class="bg-gray-50 p-4 rounded-lg">
          <div id="sip-results-placeholder" class="text-center py-8 text-gray-500">
            Enter SIP details and click Calculate to see results
          </div>
          <div id="sip-results-content" class="hidden">
            <!-- Results will be displayed here -->
          </div>
        </div>
      </div>
    `;

  // Add to investment tab
  investmentTab.appendChild(sipCalculator);
}

/**
 * Sets up event listeners for SIP calculator
 */
function setupSIPCalculatorEvents() {
  const calculateBtn = document.getElementById("calculate-sip-btn");
  if (calculateBtn) {
    calculateBtn.addEventListener("click", calculateSIPReturns);
  }
}

/**
 * Calculates SIP returns with or without step-up
 */
function calculateSIPReturns() {
  // Get input values
  const monthlyAmount =
    parseFloat(document.getElementById("sip-amount").value) || 10000;
  const years = parseInt(document.getElementById("sip-duration").value) || 15;
  const returnRate =
    parseFloat(document.getElementById("sip-return").value) || 12;
  const stepUpRate =
    parseFloat(document.getElementById("sip-step-up").value) || 0;

  // Hide placeholder, show content
  document.getElementById("sip-results-placeholder").classList.add("hidden");
  document.getElementById("sip-results-content").classList.remove("hidden");

  // Calculate SIP returns
  const result = calculateSIP(monthlyAmount, years, returnRate, stepUpRate);

  // Update results UI
  updateSIPResultsUI(result, monthlyAmount, years, stepUpRate);
}

/**
 * Calculates SIP returns with or without step-up
 *
 * @param {number} monthlyAmount Monthly SIP amount
 * @param {number} years Investment duration
 * @param {number} returnRate Expected annual return rate (%)
 * @param {number} stepUpRate Annual step-up rate (%)
 * @returns {Object} Calculation results
 */
function calculateSIP(monthlyAmount, years, returnRate, stepUpRate) {
  const monthlyRate = returnRate / 100 / 12;
  const months = years * 12;

  let totalInvestment = 0;
  let futureValue = 0;
  let currentSipAmount = monthlyAmount;
  let yearlyData = [];

  // For no step-up, simple formula can be used
  if (stepUpRate === 0) {
    // Formula: P * ((1 + r)^n - 1) / r * (1 + r)
    futureValue =
      currentSipAmount *
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
      (1 + monthlyRate);
    totalInvestment = currentSipAmount * months;

    // Calculate yearly breakdown
    for (let year = 1; year <= years; year++) {
      const yearMonths = year * 12;
      const yearValue =
        currentSipAmount *
        ((Math.pow(1 + monthlyRate, yearMonths) - 1) / monthlyRate) *
        (1 + monthlyRate);
      const yearInvestment = currentSipAmount * yearMonths;

      yearlyData.push({
        year: year,
        invested: yearInvestment,
        value: yearValue,
        gain: yearValue - yearInvestment,
      });
    }
  } else {
    // For step-up SIP, calculate year by year
    const stepUpFactor = 1 + stepUpRate / 100;
    let cumulativeValue = 0;

    for (let year = 1; year <= years; year++) {
      // For each year, calculate using current SIP amount
      let yearValue = 0;
      let yearInvestment = 0;

      for (let month = 1; month <= 12; month++) {
        cumulativeValue =
          (cumulativeValue + currentSipAmount) * (1 + monthlyRate);
        yearInvestment += currentSipAmount;
        totalInvestment += currentSipAmount;
      }

      yearValue = cumulativeValue;

      yearlyData.push({
        year: year,
        invested: totalInvestment,
        sipAmount: currentSipAmount,
        value: yearValue,
        gain: yearValue - totalInvestment,
      });

      // Increase SIP amount for next year
      currentSipAmount = Math.round(currentSipAmount * stepUpFactor);
    }

    futureValue = cumulativeValue;
  }

  const totalGain = futureValue - totalInvestment;
  const estimatedReturns = (totalGain / totalInvestment) * 100;

  return {
    totalInvestment: totalInvestment,
    futureValue: futureValue,
    totalGain: totalGain,
    estimatedReturns: estimatedReturns,
    yearlyData: yearlyData,
    wealthRatio: futureValue / totalInvestment,
  };
}

/**
 * Updates the SIP calculator results UI
 *
 * @param {Object} result Calculation results
 * @param {number} monthlyAmount Monthly SIP amount
 * @param {number} years Investment duration
 * @param {number} stepUpRate Annual step-up rate (%)
 */
function updateSIPResultsUI(result, monthlyAmount, years, stepUpRate) {
  const resultsContainer = document.getElementById("sip-results-content");

  resultsContainer.innerHTML = `
      <h4 class="font-medium text-lg mb-3">SIP Returns Analysis</h4>
      
      <div class="bg-indigo-50 p-3 rounded mb-4">
        <div class="font-medium mb-1">Estimated Corpus After ${years} Years</div>
        <div class="text-2xl font-bold text-indigo-700">${formatCurrency(
          result.futureValue
        )}</div>
        <div class="text-sm text-gray-600">
          ${
            stepUpRate > 0
              ? `With annual step-up of ${stepUpRate}%`
              : "With fixed monthly SIP"
          }
        </div>
      </div>
      
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div class="bg-white p-3 rounded border">
          <div class="text-sm text-gray-600">Total Investment</div>
          <div class="font-medium">${formatCurrency(
            result.totalInvestment
          )}</div>
        </div>
        <div class="bg-white p-3 rounded border">
          <div class="text-sm text-gray-600">Wealth Gain</div>
          <div class="font-medium text-green-600">${formatCurrency(
            result.totalGain
          )}</div>
        </div>
      </div>
      
      <div class="mb-4">
        <div class="flex justify-between mb-1">
          <span class="text-sm font-medium">Investment vs. Returns</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div class="bg-blue-600 h-2.5 rounded-full" style="width: ${Math.min(
            100,
            (result.totalInvestment / result.futureValue) * 100
          )}%"></div>
        </div>
        <div class="flex justify-between text-xs mt-1">
          <span>Principal: ${formatCurrency(result.totalInvestment)}</span>
          <span>Returns: ${formatCurrency(result.totalGain)}</span>
        </div>
      </div>
      
      <div class="text-sm mb-4">
        <div class="grid grid-cols-2 gap-2">
          <div>Wealth Ratio: <span class="font-medium">${result.wealthRatio.toFixed(
            2
          )}x</span></div>
          <div>Returns: <span class="font-medium">${result.estimatedReturns.toFixed(
            2
          )}%</span></div>
        </div>
      </div>
      
      <div class="mt-4">
        <h5 class="font-medium mb-2">Year-by-Year Growth</h5>
        <div style="height: 200px;">
          <canvas id="sip-growth-chart"></canvas>
        </div>
      </div>
    `;

  // Create growth chart
  createSIPGrowthChart(result.yearlyData);
}

/**
 * Creates a chart showing SIP growth over time
 *
 * @param {Array} yearlyData Year-by-year SIP data
 */
function createSIPGrowthChart(yearlyData) {
  const ctx = document.getElementById("sip-growth-chart").getContext("2d");

  // Prepare chart data
  const labels = yearlyData.map((data) => `Year ${data.year}`);
  const investedData = yearlyData.map((data) => data.invested);
  const valueData = yearlyData.map((data) => data.value);

  // Create chart
  if (window.sipGrowthChart) {
    window.sipGrowthChart.destroy();
  }

  window.sipGrowthChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Investment",
          data: investedData,
          backgroundColor: "rgba(59, 130, 246, 0.2)",
          borderColor: "rgba(59, 130, 246, 1)",
          borderWidth: 1,
          fill: true,
        },
        {
          label: "Value",
          data: valueData,
          backgroundColor: "rgba(16, 185, 129, 0.2)",
          borderColor: "rgba(16, 185, 129, 1)",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
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
              return label + ": " + formatCurrency(value);
            },
          },
        },
      },
    },
  });
}

// === GOAL PLANNER ===

/**
 * Initializes the financial goal planning tool
 */
function initializeGoalPlanner() {
  // Check if goal planner container exists
  if (!document.getElementById("goal-planner-section")) {
    createGoalPlannerUI();
  }

  // Add event listeners to goal planner
  setupGoalPlannerEvents();
}

/**
 * Creates the UI for the goal planner
 */
function createGoalPlannerUI() {
  // Only create if retirement tab exists
  const retirementTab = document.getElementById("retirement-tab");
  if (!retirementTab) return;

  // Create goal planner container
  const goalPlanner = document.createElement("div");
  goalPlanner.id = "goal-planner-section";
  goalPlanner.className = "panel mt-6";

  // Create HTML content
  goalPlanner.innerHTML = `
      <h3 class="panel-title">Financial Goal Planner</h3>
      <div class="mb-4">
        <p class="text-sm text-gray-600">
          Plan for specific financial goals alongside your retirement. Calculate how much you need to
          save monthly to achieve goals like education, home purchase, or travel.
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div>
          <h4 class="font-medium mb-3">Add a Financial Goal</h4>
          <div class="space-y-4">
            <div class="form-group">
              <label for="goal-name">Goal Name</label>
              <input type="text" id="goal-name" class="form-input" placeholder="Child's Education, Home Down Payment, etc.">
            </div>
            <div class="form-group">
              <label for="goal-amount">Goal Amount (₹)</label>
              <input type="number" id="goal-amount" class="form-input" placeholder="Target amount">
            </div>
            <div class="form-group">
              <label for="goal-time">Time to Goal (Years)</label>
              <input type="number" id="goal-time" class="form-input" placeholder="Years until you need the money">
            </div>
            <div class="form-group">
              <label for="goal-return">Expected Return Rate (% p.a.)</label>
              <input type="number" id="goal-return" class="form-input" value="8">
            </div>
            <div class="form-group">
              <label for="goal-existing">Existing Savings (₹)</label>
              <input type="number" id="goal-existing" class="form-input" value="0" placeholder="Amount already saved for this goal">
            </div>
            <button id="add-goal-btn" class="btn-primary w-full">Add Goal</button>
          </div>
        </div>
        <div>
          <h4 class="font-medium mb-3">Required Monthly Savings</h4>
          <div id="goal-results" class="bg-gray-50 p-4 rounded-lg min-h-32">
            <div id="goal-results-placeholder" class="text-center py-8 text-gray-500">
              Add a goal to see how much you need to save monthly
            </div>
            <div id="goal-results-content" class="hidden">
              <!-- Results will be displayed here -->
            </div>
          </div>
        </div>
      </div>
      
      <div id="goals-list-section" class="hidden">
        <h4 class="font-medium mb-3">Your Financial Goals</h4>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-100">
                <th class="text-left py-2 px-3">Goal</th>
                <th class="text-right py-2 px-3">Amount</th>
                <th class="text-right py-2 px-3">Timeframe</th>
                <th class="text-right py-2 px-3">Monthly Saving</th>
                <th class="text-right py-2 px-3">Priority</th>
                <th class="text-center py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody id="goals-list">
              <!-- Goals will be added here -->
            </tbody>
            <tfoot>
              <tr class="font-bold border-t-2 border-gray-300">
                <td class="py-2 px-3">Total</td>
                <td class="py-2 px-3 text-right" id="goals-total-amount">₹0</td>
                <td class="py-2 px-3"></td>
                <td class="py-2 px-3 text-right" id="goals-total-monthly">₹0</td>
                <td class="py-2 px-3"></td>
                <td class="py-2 px-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    `;

  // Add to retirement tab
  retirementTab.appendChild(goalPlanner);
}

/**
 * Sets up event listeners for goal planner
 */
function setupGoalPlannerEvents() {
  const addGoalBtn = document.getElementById("add-goal-btn");
  if (addGoalBtn) {
    addGoalBtn.addEventListener("click", addFinancialGoal);
  }

  // Initialize goals array if not exists
  if (!window.financialGoals) {
    window.financialGoals = [];
  }
}

/**
 * Adds a new financial goal to the goal planner
 */
function addFinancialGoal() {
  // Get input values
  const goalName = document.getElementById("goal-name").value;
  const goalAmount = parseFloat(document.getElementById("goal-amount").value);
  const goalTime = parseInt(document.getElementById("goal-time").value);
  const goalReturn =
    parseFloat(document.getElementById("goal-return").value) || 8;
  const goalExisting =
    parseFloat(document.getElementById("goal-existing").value) || 0;

  // Validate inputs
  if (!goalName || !goalAmount || !goalTime) {
    alert("Please fill in all required fields.");
    return;
  }

  // Calculate monthly savings required
  const monthlySavings = calculateGoalMonthlySavings(
    goalAmount,
    goalTime,
    goalReturn,
    goalExisting
  );

  // Create goal object
  const goal = {
    id: Date.now(), // Unique ID for the goal
    name: goalName,
    amount: goalAmount,
    timeYears: goalTime,
    returnRate: goalReturn,
    existingSavings: goalExisting,
    monthlySavings: monthlySavings,
    priority: "Medium",
  };

  // Add to goals array
  window.financialGoals.push(goal);

  // Update UI
  updateGoalResults(goal);
  updateGoalsList();

  // Clear form
  document.getElementById("goal-name").value = "";
  document.getElementById("goal-amount").value = "";
  document.getElementById("goal-time").value = "";
  document.getElementById("goal-existing").value = "0";
}

/**
 * Calculates monthly savings required for a financial goal
 *
 * @param {number} goalAmount Target amount
 * @param {number} years Years to goal
 * @param {number} returnRate Expected annual return rate (%)
 * @param {number} existingSavings Existing savings for this goal
 * @returns {number} Monthly savings amount
 */
function calculateGoalMonthlySavings(
  goalAmount,
  years,
  returnRate,
  existingSavings
) {
  const monthlyRate = returnRate / 100 / 12;
  const months = years * 12;

  // Future value of existing savings
  const futureValueOfExisting =
    existingSavings * Math.pow(1 + returnRate / 100, years);

  // Remaining amount needed
  const amountNeeded = Math.max(0, goalAmount - futureValueOfExisting);

  // If already saved enough
  if (amountNeeded <= 0) return 0;

  // Formula: PMT = FV * r / ((1 + r)^n - 1)
  const monthlySavings =
    (amountNeeded * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1);

  return monthlySavings;
}

/**
 * Updates the goal results UI after adding a goal
 *
 * @param {Object} goal The newly added goal
 */
function updateGoalResults(goal) {
  // Hide placeholder, show content
  document.getElementById("goal-results-placeholder").classList.add("hidden");
  document.getElementById("goal-results-content").classList.remove("hidden");

  // Update content
  const resultsContainer = document.getElementById("goal-results-content");

  resultsContainer.innerHTML = `
      <h5 class="font-medium mb-2">${goal.name}</h5>
      <div class="bg-indigo-50 p-3 rounded mb-3">
        <div class="text-sm text-gray-600">Required Monthly Saving</div>
        <div class="text-2xl font-bold text-indigo-700">${formatCurrency(
          goal.monthlySavings
        )}</div>
      </div>
      
      <div class="grid grid-cols-2 gap-3 mb-3">
        <div>
          <div class="text-sm text-gray-600">Target Amount</div>
          <div class="font-medium">${formatCurrency(goal.amount)}</div>
        </div>
        <div>
          <div class="text-sm text-gray-600">Timeframe</div>
          <div class="font-medium">${goal.timeYears} years</div>
        </div>
      </div>
      
      <div class="text-sm mb-2">
        <div class="text-gray-600">Future Value of Existing Savings</div>
        <div class="font-medium">${formatCurrency(
          goal.existingSavings *
            Math.pow(1 + goal.returnRate / 100, goal.timeYears)
        )}</div>
      </div>
      
      <div class="text-xs text-gray-500">
        Assuming ${goal.returnRate}% annual returns compounded monthly
      </div>
    `;
}

/**
 * Updates the goals list UI
 */
function updateGoalsList() {
  // Show goals list section
  document.getElementById("goals-list-section").classList.remove("hidden");

  // Clear existing goals
  const goalsList = document.getElementById("goals-list");
  goalsList.innerHTML = "";

  // Add each goal to the list
  let totalAmount = 0;
  let totalMonthly = 0;

  window.financialGoals.forEach((goal) => {
    totalAmount += goal.amount;
    totalMonthly += goal.monthlySavings;

    const row = document.createElement("tr");
    row.className = "border-b";
    row.innerHTML = `
        <td class="py-2 px-3 font-medium">${goal.name}</td>
        <td class="py-2 px-3 text-right">${formatCurrency(goal.amount)}</td>
        <td class="py-2 px-3 text-right">${goal.timeYears} years</td>
        <td class="py-2 px-3 text-right">${formatCurrency(
          goal.monthlySavings
        )}</td>
        <td class="py-2 px-3 text-right">
          <select class="goal-priority-select text-xs p-1 border rounded" data-goal-id="${
            goal.id
          }">
            <option value="High" ${
              goal.priority === "High" ? "selected" : ""
            }>High</option>
            <option value="Medium" ${
              goal.priority === "Medium" ? "selected" : ""
            }>Medium</option>
            <option value="Low" ${
              goal.priority === "Low" ? "selected" : ""
            }>Low</option>
          </select>
        </td>
        <td class="py-2 px-3 text-center">
          <button class="delete-goal-btn text-xs px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
            data-goal-id="${goal.id}">
            Remove
          </button>
        </td>
      `;

    goalsList.appendChild(row);
  });

  // Update totals
  document.getElementById("goals-total-amount").textContent =
    formatCurrency(totalAmount);
  document.getElementById("goals-total-monthly").textContent =
    formatCurrency(totalMonthly);

  // Add event listeners to priority selects and delete buttons
  document.querySelectorAll(".goal-priority-select").forEach((select) => {
    select.addEventListener("change", function () {
      const goalId = parseInt(this.getAttribute("data-goal-id"));
      const priority = this.value;
      updateGoalPriority(goalId, priority);
    });
  });

  document.querySelectorAll(".delete-goal-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const goalId = parseInt(this.getAttribute("data-goal-id"));
      deleteGoal(goalId);
    });
  });
}

/**
 * Updates the priority of a goal
 *
 * @param {number} goalId ID of the goal to update
 * @param {string} priority New priority value
 */
function updateGoalPriority(goalId, priority) {
  // Find the goal
  const goalIndex = window.financialGoals.findIndex(
    (goal) => goal.id === goalId
  );
  if (goalIndex === -1) return;

  // Update priority
  window.financialGoals[goalIndex].priority = priority;

  // No need to update UI as select already shows the new value
}

/**
 * Deletes a goal
 *
 * @param {number} goalId ID of the goal to delete
 */
function deleteGoal(goalId) {
  // Filter out the goal
  window.financialGoals = window.financialGoals.filter(
    (goal) => goal.id !== goalId
  );

  // Update UI
  updateGoalsList();

  // If no goals left, hide the section and show placeholder
  if (window.financialGoals.length === 0) {
    document.getElementById("goals-list-section").classList.add("hidden");
    document.getElementById("goal-results-content").classList.add("hidden");
    document
      .getElementById("goal-results-placeholder")
      .classList.remove("hidden");
  }
}

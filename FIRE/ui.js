// === UI UPDATE FUNCTIONS ===

/**
 * Updates all UI elements with calculation results
 *
 * @param {Object} userData User profile and financial information
 * @param {Object} budgetResults Budget allocation results
 * @param {Object} retirementResults Retirement planning results
 * @param {Object} investmentResults Investment recommendations
 * @param {Object} optimizationResults Optimization opportunities
 */
function updateResultsUI(
  userData,
  budgetResults,
  retirementResults,
  investmentResults,
  optimizationResults
) {
  // Update dashboard summary metrics
  updateSummaryMetrics(userData, budgetResults, retirementResults);

  // Update income tier display banner
  updateIncomeTierBanner(userData.incomeTier);

  // Update budget tab content
  updateBudgetTab(userData, budgetResults);

  // Update retirement tab content
  updateRetirementTab(userData, retirementResults);

  // Update investment tab content
  updateInvestmentTab(userData, investmentResults);

  // Update optimization tab content
  updateOptimizationTab(userData, optimizationResults, budgetResults);

  // Activate first tab by default
  document.querySelector('.tab-btn[data-tab="budget"]').click();

  // Show deficit warning if applicable
  if (budgetResults.deficit > 0) {
    showDeficitWarning(budgetResults.deficit, userData.monthlyIncome);
  }
}

/**
 * Updates the summary metrics at the top of the dashboard
 *
 * @param {Object} userData User profile and financial information
 * @param {Object} budgetResults Budget allocation results
 * @param {Object} retirementResults Retirement planning results
 */
function updateSummaryMetrics(userData, budgetResults, retirementResults) {
  // Update monthly budget value
  document.getElementById("monthly-budget-value").textContent = formatCurrency(
    budgetResults.total_budget
  );

  // Update retirement corpus value
  document.getElementById("retirement-corpus-value").textContent =
    formatCurrency(retirementResults.total_corpus_required);

  // Update retirement age display
  document.getElementById("retirement-age-display").textContent =
    userData.retirementAge;

  // Update monthly savings values
  // Check if there's a cap being applied
  const isCapped =
    retirementResults.required_monthly_savings >
    retirementResults.recommended_monthly_savings;

  // If capped, show both values
  if (isCapped) {
    document.getElementById(
      "monthly-savings-value"
    ).innerHTML = `<span class="text-yellow-600">${formatCurrency(
      retirementResults.recommended_monthly_savings
    )}</span>
       <span class="text-xs block">(need: ${formatCurrency(
         retirementResults.required_monthly_savings
       )})</span>`;
  } else {
    document.getElementById("monthly-savings-value").textContent =
      formatCurrency(retirementResults.recommended_monthly_savings);
  }

  // Update savings percentage with similar treatment
  const savingsRate =
    (retirementResults.recommended_monthly_savings / userData.monthlyIncome) *
    100;
  const requiredRate =
    (retirementResults.required_monthly_savings / userData.monthlyIncome) * 100;

  if (isCapped) {
    document.getElementById(
      "savings-percent"
    ).innerHTML = `<span>${savingsRate.toFixed(1)}% of income</span>
       <span class="text-xs block">(need: ${requiredRate.toFixed(1)}%)</span>`;
  } else {
    document.getElementById(
      "savings-percent"
    ).textContent = `${savingsRate.toFixed(1)}% of income`;
  }

  // Update retirement readiness indicator if present
  if (document.getElementById("retirement-readiness")) {
    const readiness = retirementResults.retirement_readiness;
    document.getElementById(
      "retirement-readiness"
    ).textContent = `${readiness.score}/100 (${readiness.status})`;
  }
}

/**
 * Shows an income tier banner with appropriate guidance
 *
 * @param {string} incomeTier User's income tier
 */
function updateIncomeTierBanner(incomeTier) {
  // Create banner if it doesn't exist
  let banner = document.getElementById("income-tier-banner");
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "income-tier-banner";
    banner.className = "mb-6 p-4 rounded-lg text-white";

    // Insert after dashboard summary
    const dashboardSummary = document.querySelector(".dashboard-summary");
    dashboardSummary.parentNode.insertBefore(
      banner,
      dashboardSummary.nextSibling
    );
  }

  // Set colors and content based on income tier
  let bgColor, message;

  switch (incomeTier) {
    case "VERY_LOW":
      bgColor = "bg-gray-700";
      message =
        "You are in our Very Low Income tier. We've personalized your plan for essential needs focus.";
      break;
    case "LOW":
      bgColor = "bg-blue-700";
      message =
        "You are in our Low Income tier. Your plan balances essential needs with some future security.";
      break;
    case "LOWER_MIDDLE":
      bgColor = "bg-blue-600";
      message =
        "You are in our Lower Middle Income tier. Your plan focuses on building financial security.";
      break;
    case "MIDDLE":
      bgColor = "bg-indigo-600";
      message =
        "You are in our Middle Income tier. Your plan balances current lifestyle and future goals.";
      break;
    case "HIGH":
      bgColor = "bg-purple-600";
      message =
        "You are in our High Income tier. Your plan focuses on wealth building and quality of life.";
      break;
    case "ULTRA_HIGH":
      bgColor = "bg-purple-800";
      message =
        "You are in our Ultra-High Income tier. Your plan emphasizes wealth preservation and legacy.";
      break;
    default:
      bgColor = "bg-indigo-600";
      message =
        "Your personalized financial plan is based on your income and goals.";
  }

  // Update banner
  banner.className = `mb-6 p-4 rounded-lg text-white ${bgColor}`;
  banner.innerHTML = `
    <div class="flex items-center justify-between">
      <div>
        <p class="font-medium">${message}</p>
      </div>
      <button id="tier-info-btn" class="text-white hover:text-indigo-100">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  `;

  // Add event listener to info button
  document.getElementById("tier-info-btn").addEventListener("click", () => {
    showIncomeTierInfo(incomeTier);
  });
}

/**
 * Shows income tier information modal
 *
 * @param {string} incomeTier User's income tier
 */
function showIncomeTierInfo(incomeTier) {
  // Get tier details
  const tierInfo = {
    VERY_LOW: {
      range: "₹5,000-₹15,000/month",
      description:
        "Focus on essential needs, building tiny emergency fund, and accessible micro-savings",
      approach:
        "Survival-first budgeting with absolute minimum allocations to essential categories",
    },
    LOW: {
      range: "₹15,000-₹30,000/month",
      description:
        "Building basic financial security with gradual increase in savings",
      approach:
        "Essential-heavy allocation with minimal discretionary spending",
    },
    LOWER_MIDDLE: {
      range: "₹30,000-₹60,000/month",
      description:
        "Balancing essential needs with increased focus on future security",
      approach:
        "More balanced allocation with room for some quality of life improvements",
    },
    MIDDLE: {
      range: "₹60,000-₹1,50,000/month",
      description: "Equal importance to current lifestyle and future goals",
      approach: "Balanced approach with meaningful lifestyle enhancements",
    },
    HIGH: {
      range: "₹1,50,000-₹10,00,000/month",
      description:
        "Quality of life becomes a legitimate priority alongside future security",
      approach:
        "Sophisticated wealth building with premium expenses for quality of life",
    },
    ULTRA_HIGH: {
      range: "₹10,00,000+/month",
      description:
        "Focus shifts from accumulation to preservation and legacy planning",
      approach:
        "Wealth preservation, multi-generational planning, and sophisticated structures",
    },
  };

  const info = tierInfo[incomeTier] || tierInfo["MIDDLE"];

  // Create and show modal
  const modal = document.createElement("div");
  modal.className =
    "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
  modal.innerHTML = `
    <div class="bg-white rounded-lg p-6 max-w-lg w-full">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold">Income Tier Information</h3>
        <button id="close-modal" class="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div>
        <p class="font-medium mb-2">Income Range: ${info.range}</p>
        <p class="mb-2"><span class="font-medium">Description:</span> ${info.description}</p>
        <p class="mb-4"><span class="font-medium">Financial Approach:</span> ${info.approach}</p>
        <p class="text-sm text-gray-600">Your financial plan has been customized based on your specific income tier to maximize effectiveness for your situation.</p>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Add event listener to close button
  document.getElementById("close-modal").addEventListener("click", () => {
    document.body.removeChild(modal);
  });
}

/**
 * Shows deficit warning when retirement savings exceeds disposable income
 *
 * @param {number} deficit Deficit amount
 * @param {number} monthlyIncome Monthly income
 */
function showDeficitWarning(deficit, monthlyIncome) {
  // Create warning element
  const warning = document.createElement("div");
  warning.className =
    "bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6";
  warning.innerHTML = `
    <div class="flex">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="ml-3">
        <p class="text-sm">
          <strong>Affordability Alert:</strong> Your ideal retirement savings rate of 
          ${(
            ((deficit + budgetResults.retirement_savings) / monthlyIncome) *
            100
          ).toFixed(1)}% 
          exceeds your available income after essential expenses. We've adjusted your retirement 
          savings to a more realistic amount based on your current income.
        </p>
        <p class="text-sm mt-2">
          <strong>Options to consider:</strong> Increase income, reduce essential expenses, 
          or plan for a later retirement age.
        </p>
      </div>
    </div>
  `;

  // Insert after dashboard summary
  const dashboardSummary = document.querySelector(".dashboard-summary");
  dashboardSummary.parentNode.insertBefore(
    warning,
    dashboardSummary.nextSibling
  );
}

// === BUDGET TAB UI UPDATES ===

/**
 * Updates the budget tab with all budget-related information
 *
 * @param {Object} userData User profile and financial information
 * @param {Object} budgetResults Budget allocation results
 */
function updateBudgetTab(userData, budgetResults) {
  // Update budget breakdown table
  updateBudgetBreakdownTable(userData, budgetResults);

  // Update subcategory breakdown table
  updateSubcategoryBreakdownTable(budgetResults);

  // Create budget chart
  createBudgetChart(budgetResults);

  // Add budget summary/guidance based on income tier
  addBudgetGuidance(userData.incomeTier, budgetResults);
}

/**
 * Adds budget guidance based on income tier
 *
 * @param {string} incomeTier User's income tier
 * @param {Object} budgetResults Budget allocation results
 */
function addBudgetGuidance(incomeTier, budgetResults) {
  // Create guidance element if it doesn't exist
  let guidance = document.getElementById("budget-guidance");
  if (!guidance) {
    guidance = document.createElement("div");
    guidance.id = "budget-guidance";
    guidance.className = "panel mt-6";

    // Insert at the end of budget tab
    const budgetTab = document.getElementById("budget-tab");
    budgetTab.appendChild(guidance);
  }

  // Different guidance based on income tier
  let title, description, tips;

  switch (incomeTier) {
    case "VERY_LOW":
      title = "Low Income Budget Strategy";
      description =
        "Your budget prioritizes essential needs while building minimal emergency savings. Focus on consistent small savings to build security.";
      tips = [
        "Consider sharing housing costs if possible",
        "Prioritize nutritious but economical food options",
        "Build a tiny emergency fund of ₹5,000 first",
        "Look into government schemes for additional support",
      ];
      break;
    case "LOW":
    case "LOWER_MIDDLE":
      title = "Building Financial Security";
      description =
        "Your budget balances essential needs with gradual increase in savings. Focus on building emergency funds and starting retirement savings.";
      tips = [
        "Aim to save 3-4 months of expenses as emergency fund",
        "Consider PPF for tax-efficient long-term savings",
        "Reduce high-interest debt as quickly as possible",
        "Gradually increase retirement savings as income grows",
      ];
      break;
    case "MIDDLE":
      title = "Balanced Financial Approach";
      description =
        "Your budget allocates resources across current lifestyle and future security. Focus on optimizing for both present quality of life and long-term goals.";
      tips = [
        "Maintain 6 months of expenses as emergency fund",
        "Consider diversified investment approach for retirement",
        "Balance spending on essential categories",
        "Optimize tax efficiency across investments",
      ];
      break;
    case "HIGH":
    case "ULTRA_HIGH":
      title = "Wealth Building Strategy";
      description =
        "Your budget prioritizes wealth building while supporting quality lifestyle. Focus on tax optimization, diverse investments, and strategic planning.";
      tips = [
        "Consider more sophisticated investment vehicles",
        "Optimize for tax efficiency across your portfolio",
        "Quality of life expenses are appropriate at your income",
        "Consider charitable giving and legacy planning",
      ];
      break;
    default:
      title = "Personalized Budget Strategy";
      description =
        "Your budget is based on your specific situation and priorities.";
      tips = [
        "Focus on maintaining a balanced approach to spending",
        "Build emergency savings for unexpected expenses",
        "Regularly review and adjust your budget",
        "Consider increasing retirement savings as income grows",
      ];
  }

  // Calculate essential vs. discretionary percentages
  const essentialPercent = (
    (budgetResults.total_essentials / budgetResults.total_budget) *
    100
  ).toFixed(1);
  const savingsPercent = (
    (budgetResults.total_savings / budgetResults.total_budget) *
    100
  ).toFixed(1);
  const discretionaryPercent = (
    (budgetResults.discretionary / budgetResults.total_budget) *
    100
  ).toFixed(1);

  // Update guidance content
  guidance.innerHTML = `
    <h3 class="panel-title">${title}</h3>
    <p class="mb-4">${description}</p>
    
    <div class="mb-4">
      <div class="flex justify-between mb-1">
        <span class="text-sm font-medium">Budget Allocation</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2.5">
        <div class="bg-blue-600 h-2.5 rounded-full" style="width: ${essentialPercent}%"></div>
      </div>
      <div class="flex justify-between text-sm mt-1">
        <span>${essentialPercent}% Essentials</span>
        <span>${savingsPercent}% Savings</span>
        <span>${discretionaryPercent}% Discretionary</span>
      </div>
    </div>
    
    <h4 class="font-medium mb-2">Budget Tips:</h4>
    <ul class="list-disc pl-5 space-y-1">
      ${tips.map((tip) => `<li>${tip}</li>`).join("")}
    </ul>
  `;
}

/**
 * Updates the budget breakdown table
 *
 * @param {Object} userData User profile and financial information
 * @param {Object} budgetResults Budget allocation results
 */
function updateBudgetBreakdownTable(userData, budgetResults) {
  const table = document.getElementById("budget-breakdown-table");
  table.innerHTML = "";

  // Category display names mapping
  const categoryDisplayNames = {
    housing: "Housing",
    food: "Food",
    utilities: "Utilities",
    transport: "Transportation",
    healthcare: "Healthcare",
    education: "Education",
    personal: "Personal Care",
    household: "Household",
    retirement_savings: "Retirement Savings",
    short_term_savings: "Short-term Savings",
    discretionary: "Discretionary",
  };

  // Add rows for each category
  for (const [category, displayName] of Object.entries(categoryDisplayNames)) {
    if (budgetResults[category] !== undefined && budgetResults[category] > 0) {
      const amount = budgetResults[category];
      const percentage = ((amount / userData.monthlyIncome) * 100).toFixed(1);

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${displayName}</td>
        <td class="text-right">${formatCurrency(amount)}</td>
        <td class="text-right">${percentage}%</td>
      `;
      table.appendChild(row);
    }
  }

  // Add total row
  const totalRow = document.createElement("tr");
  totalRow.classList.add("font-bold", "border-t-2", "border-gray-300");
  totalRow.innerHTML = `
    <td>Total</td>
    <td class="text-right">${formatCurrency(budgetResults.total_budget)}</td>
    <td class="text-right">100%</td>
  `;
  table.appendChild(totalRow);
}

/**
 * Updates the subcategory breakdown table
 *
 * @param {Object} budgetResults Budget allocation results
 */
function updateSubcategoryBreakdownTable(budgetResults) {
  const table = document.getElementById("subcategory-breakdown-table");
  table.innerHTML = "";

  // Category display names mapping
  const categoryDisplayNames = {
    housing: "Housing",
    food: "Food",
    utilities: "Utilities",
    transport: "Transportation",
    healthcare: "Healthcare",
    education: "Education",
    personal: "Personal Care",
    household: "Household",
    discretionary: "Discretionary",
  };

  // Subcategory display names mapping
  const subcategoryDisplayNames = {
    // Housing
    rent_or_emi: "Rent/EMI",
    maintenance: "Maintenance",
    property_tax: "Property Tax",

    // Food
    groceries: "Groceries",
    dairy: "Dairy",
    eating_out: "Eating Out",
    ordering_in: "Food Delivery",

    // Utilities
    electricity: "Electricity",
    water: "Water",
    gas: "Gas",
    internet_cable: "Internet/Cable",

    // Transport
    fuel: "Fuel",
    maintenance: "Vehicle Maintenance",
    public_transport: "Public Transport",
    rideshare_taxi: "Rideshare/Taxi",

    // Healthcare
    insurance: "Insurance",
    medications: "Medications",
    doctor_visits: "Doctor Visits",
    wellness: "Wellness",

    // Education
    school_fees: "School Fees",
    supplies: "Supplies",
    tutoring: "Tutoring",
    extracurricular: "Extra-curricular",

    // Personal
    grooming: "Grooming",
    clothing: "Clothing",
    recreation: "Recreation",
    subscriptions: "Subscriptions",

    // Household
    domestic_help: "Domestic Help",
    furnishings: "Furnishings",
    repairs: "Repairs",
    supplies: "Household Supplies",

    // Discretionary
    entertainment: "Entertainment",
    shopping: "Shopping",
    travel: "Travel",
    gifts: "Gifts",
    miscellaneous: "Miscellaneous",
    charity: "Charity",
    luxury: "Luxury Items",
  };

  // Add rows for each subcategory
  for (const [category, breakdown] of Object.entries(
    budgetResults.category_breakdown
  )) {
    const categoryName = categoryDisplayNames[category] || category;

    for (const [subcategory, amount] of Object.entries(breakdown)) {
      // Skip if amount is zero or undefined
      if (!amount || amount <= 0) continue;

      // Handle duplicated keys (like 'maintenance' which appears in multiple categories)
      let subcategoryName = subcategoryDisplayNames[subcategory] || subcategory;
      if (subcategory === "maintenance" && category === "transport") {
        subcategoryName = "Vehicle Maintenance";
      } else if (subcategory === "maintenance" && category === "housing") {
        subcategoryName = "Home Maintenance";
      }

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${categoryName}</td>
        <td>${subcategoryName}</td>
        <td class="text-right">${formatCurrency(amount)}</td>
      `;
      table.appendChild(row);
    }
  }
}

/**
 * Creates a pie chart for budget visualization
 *
 * @param {Object} budgetResults Budget allocation results
 */
function createBudgetChart(budgetResults) {
  const ctx = document.getElementById("budget-chart").getContext("2d");

  // Prepare data for chart
  const categories = {
    housing: "Housing",
    food: "Food",
    utilities: "Utilities",
    transport: "Transportation",
    healthcare: "Healthcare",
    education: "Education",
    personal: "Personal Care",
    household: "Household",
    retirement_savings: "Retirement Savings",
    short_term_savings: "Short-term Savings",
    discretionary: "Discretionary",
  };

  const data = [];
  const labels = [];
  const backgroundColors = [
    "#4F46E5", // Indigo
    "#10B981", // Emerald
    "#F59E0B", // Amber
    "#EF4444", // Red
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#06B6D4", // Cyan
    "#84CC16", // Lime
    "#3B82F6", // Blue
    "#6366F1", // Indigo
    "#F97316", // Orange
  ];

  let i = 0;
  for (const [category, label] of Object.entries(categories)) {
    if (budgetResults[category] !== undefined && budgetResults[category] > 0) {
      data.push(budgetResults[category]);
      labels.push(label);
      i++;
    }
  }

  // Create chart
  if (window.budgetChart) {
    window.budgetChart.destroy();
  }

  window.budgetChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: backgroundColors.slice(0, data.length),
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: {
            boxWidth: 15,
            padding: 15,
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const value = context.raw;
              const total = context.chart.data.datasets[0].data.reduce(
                (a, b) => a + b,
                0
              );
              const percentage = ((value / total) * 100).toFixed(1);
              return `${context.label}: ${formatCurrency(
                value
              )} (${percentage}%)`;
            },
          },
        },
      },
    },
  });
}

// === RETIREMENT TAB UI UPDATES ===

/**
 * Updates the retirement tab with all retirement-related information
 *
 * @param {Object} userData User profile and financial information
 * @param {Object} retirementResults Retirement planning results
 */
function updateRetirementTab(userData, retirementResults) {
  // Update retirement details table
  updateRetirementDetailsTable(userData, retirementResults);

  // Add savings cap warning if needed
  addSavingsCapWarning(userData, retirementResults);

  // Update retirement scenarios
  updateRetirementScenarios(userData, retirementResults);

  // Create retirement growth chart
  createRetirementGrowthChart(userData, retirementResults);

  // Add retirement income breakdown
  updateRetirementIncomeBreakdown(retirementResults);

  // Add retirement readiness metrics
  updateRetirementReadiness(retirementResults);
}

function addSavingsCapWarning(userData, retirementResults) {
  // Remove any existing warning
  const existingWarning = document.getElementById("savings-cap-warning");
  if (existingWarning) {
    existingWarning.remove();
  }

  // Only show warning if there's a significant difference between required and recommended
  if (
    retirementResults.required_monthly_savings >
    retirementResults.recommended_monthly_savings * 1.1
  ) {
    const shortfall =
      retirementResults.required_monthly_savings -
      retirementResults.recommended_monthly_savings;
    const corpusShortfall = calculateFutureSavedAmount(
      shortfall,
      retirementResults.pre_retirement_return,
      userData.retirementAge - userData.age
    );

    const warning = document.createElement("div");
    warning.id = "savings-cap-warning";
    warning.className =
      "bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6";
    warning.innerHTML = `
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium">
            <strong>Savings Cap Alert:</strong> Your ideal monthly savings of 
            ${formatCurrency(retirementResults.required_monthly_savings)} 
            exceeds the practical budget cap of 
            ${(
              MAX_RETIREMENT_SAVINGS_PERCENT[userData.incomeTier] * 100
            ).toFixed(0)}% 
            of your income. With the capped amount of 
            ${formatCurrency(retirementResults.recommended_monthly_savings)}, 
            your retirement corpus will be short by approximately 
            ${formatCurrency(corpusShortfall)}.
          </p>
          <p class="text-sm mt-2">
            <strong>Options to consider:</strong> Increase income, reduce retirement expenses, 
            plan for a later retirement age, or adjust your return expectations.
          </p>
        </div>
      </div>
    `;

    // Insert after retirement details table
    const retirementDetails = document.querySelector(".retirement-details");
    retirementDetails.parentNode.appendChild(warning);
  }
}

/**
 * Updates the retirement details table
 *
 * @param {Object} userData User profile and financial information
 * @param {Object} retirementResults Retirement planning results
 */
function updateRetirementDetailsTable(userData, retirementResults) {
  const table = document.getElementById("retirement-details-table");
  table.innerHTML = "";

  // Add details rows
  const details = [
    {
      label: "Current Monthly Expenses",
      value: formatCurrency(retirementResults.current_monthly_expenses),
    },
    {
      label: "Future Monthly Expenses at Retirement",
      value: formatCurrency(retirementResults.future_monthly_expenses),
    },
    {
      label: "Future Annual Expenses at Retirement",
      value: formatCurrency(retirementResults.future_annual_expenses),
    },
    {
      label: "Years Until Retirement",
      value: `${userData.retirementAge - userData.age} years`,
    },
    {
      label: "Expected Years in Retirement",
      value: `${userData.lifeExpectancy - userData.retirementAge} years`,
    },
    {
      label: "Safe Withdrawal Rate",
      value: `${(retirementResults.safe_withdrawal_rate * 100).toFixed(1)}%`,
    },
    {
      label: "Current Savings & Investments",
      value: formatCurrency(retirementResults.current_savings),
    },
    {
      label: "Future Value of Current Savings",
      value: formatCurrency(retirementResults.future_value_of_current_savings),
    },
    {
      label: "Additional Corpus Needed",
      value: formatCurrency(
        Math.max(0, retirementResults.additional_corpus_needed)
      ),
    },
    {
      label: "Ideal Monthly Savings Needed",
      value: formatCurrency(retirementResults.required_monthly_savings),
      tooltip:
        "This is the amount you would ideally need to save each month to reach your retirement goal",
    },
    {
      label: "Capped Monthly Savings (Income Limit)",
      value: formatCurrency(retirementResults.recommended_monthly_savings),
      tooltip: `This is limited to ${(
        MAX_RETIREMENT_SAVINGS_PERCENT[userData.incomeTier] * 100
      ).toFixed(0)}% of your income as a practical budget constraint`,
      class:
        retirementResults.required_monthly_savings >
        retirementResults.recommended_monthly_savings
          ? "text-red-600"
          : "",
    },
    {
      label: "Recommended Monthly Savings",
      value: formatCurrency(retirementResults.recommended_monthly_savings),
      tooltip:
        "This is your ideal monthly savings amount based on your retirement goals and current budget",
    },
  ];
  // Add new rows for deficit information
  if (
    retirementResults.required_monthly_savings >
    retirementResults.recommended_monthly_savings
  ) {
    const shortfall =
      retirementResults.required_monthly_savings -
      retirementResults.recommended_monthly_savings;
    const corpusShortfall = calculateFutureSavedAmount(
      shortfall,
      retirementResults.pre_retirement_return,
      userData.retirementAge - userData.age
    );
    const reducedMonthlyIncome =
      ((retirementResults.total_corpus_required - corpusShortfall) *
        retirementResults.safe_withdrawal_rate) /
      12;

    details.push({
      label: "Monthly Savings Shortfall",
      value: formatCurrency(shortfall),
      class: "text-red-600",
      tooltip:
        "The difference between what you need to save and what's within your income limit",
    });

    details.push({
      label: "Projected Corpus Shortfall",
      value: formatCurrency(corpusShortfall),
      class: "text-red-600",
      tooltip:
        "The amount your retirement corpus will be short if you only save the capped amount",
    });

    details.push({
      label: "Projected Monthly Retirement Income",
      value: formatCurrency(reducedMonthlyIncome),
      tooltip:
        "Your estimated monthly income in retirement with the capped savings amount",
    });

    // Add percent of expenses covered
    const percentCovered =
      (reducedMonthlyIncome / retirementResults.future_monthly_expenses) * 100;
    details.push({
      label: "% of Retirement Expenses Covered",
      value: percentCovered.toFixed(1) + "%",
      class: percentCovered < 90 ? "text-red-600" : "text-green-600",
      tooltip:
        "How much of your retirement expenses will be covered by your projected corpus",
    });
  }
  // Show excess if applicable
  if (retirementResults.excess > 0) {
    details.push({
      label: "Projected Surplus",
      value: formatCurrency(retirementResults.excess),
      class: "text-green-600",
    });
  }

  details.forEach((detail) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="font-medium">${detail.label}${
      detail.tooltip
        ? ` <span class="info-tooltip" title="${detail.tooltip}">ⓘ</span>`
        : ""
    }</td>
      <td class="text-right ${detail.class || ""}">${detail.value}</td>
    `;
    table.appendChild(row);
  });
}

/**
 * Updates the retirement scenarios section with better explanations
 *
 * @param {Object} userData User profile information
 * @param {Object} retirementResults Retirement planning results
 */
function updateRetirementScenarios(userData, retirementResults) {
  const container = document.getElementById("retirement-scenarios");
  container.innerHTML = "";

  // Add explanation section at the top
  const explanationDiv = document.createElement("div");
  explanationDiv.className = "bg-indigo-50 p-4 rounded-lg mb-4 text-sm";
  explanationDiv.innerHTML = `
    <h4 class="font-medium mb-2">About These Scenarios</h4>
    <p class="mb-2">These cards show alternative retirement strategies you might consider. Each scenario shows:</p>
    <ul class="list-disc pl-5 mb-2">
      <li><strong>Feasibility Score</strong>: How realistic this scenario is based on your finances (0-10)</li>
      <li><strong>Required Corpus</strong>: The total savings you'd need for this scenario</li>
      <li><strong>Monthly Savings</strong>: How much you'd need to save monthly to achieve this</li>
    </ul>
    <p>Color indicates feasibility: <span class="text-green-700">Green</span> = highly feasible, <span class="text-yellow-700">Yellow</span> = moderately feasible, <span class="text-red-700">Red</span> = challenging</p>
  `;
  container.appendChild(explanationDiv);

  // Add scenario cards for each scenario
  for (const [key, scenario] of Object.entries(retirementResults.scenarios)) {
    // Skip the base scenario as it's already shown in the main view
    if (key === "base") continue;

    // Create card with appropriate color based on feasibility
    let cardClass = "border-gray-200";
    let feasibilityClass = "text-gray-600";
    let feasibilityText = "";

    if (scenario.feasibility >= 8) {
      cardClass = "border-green-200 bg-green-50";
      feasibilityClass = "text-green-800";
      feasibilityText = "Highly Feasible";
    } else if (scenario.feasibility >= 5) {
      cardClass = "border-yellow-200 bg-yellow-50";
      feasibilityClass = "text-yellow-800";
      feasibilityText = "Moderately Feasible";
    } else if (scenario.feasibility >= 3) {
      cardClass = "border-orange-200 bg-orange-50";
      feasibilityClass = "text-orange-800";
      feasibilityText = "Challenging";
    } else {
      cardClass = "border-red-200 bg-red-50";
      feasibilityClass = "text-red-800";
      feasibilityText = "Very Difficult";
    }

    const card = document.createElement("div");
    card.className = `border rounded-lg p-4 ${cardClass} mb-3`;

    // Add explanation text based on scenario type
    let scenarioExplanation = "";
    switch (key) {
      case "early_retirement":
        scenarioExplanation = `This scenario shows what happens if you retire at ${scenario.retirement_age} instead of ${userData.retirementAge}. Early retirement requires a larger corpus because you'll have fewer years to save and more years to spend.`;
        break;
      case "delayed_retirement":
        scenarioExplanation = `This scenario shows what happens if you retire at ${scenario.retirement_age} instead of ${userData.retirementAge}. Delaying retirement gives you more time to save and fewer retirement years to fund.`;
        break;
      case "conservative_returns":
        const lowerReturn =
          userData.riskTolerance === "CONSERVATIVE"
            ? "7%"
            : userData.riskTolerance === "MODERATE"
            ? "9%"
            : "11%";
        scenarioExplanation = `This scenario uses more conservative investment return assumptions (${
          lowerReturn - 2
        }% instead of ${lowerReturn}%). This helps plan for periods of lower market performance.`;
        break;
      case "reduced_expenses":
        scenarioExplanation = `This scenario assumes you can live on 20% less in retirement through lifestyle adjustments. This significantly reduces your required corpus.`;
        break;
      case "longevity":
        scenarioExplanation = `This scenario plans for living 10 years longer than your life expectancy. This increases your required corpus to avoid outliving your savings.`;
        break;
    }

    card.innerHTML = `
      <div class="flex justify-between items-center mb-2">
        <h5 class="font-semibold">${scenario.name}</h5>
        <div class="text-sm ${feasibilityClass} px-2 py-1 rounded-full bg-white border ${cardClass.replace(
      "bg-",
      "border-"
    )}">
          ${feasibilityText} (${scenario.feasibility}/10)
        </div>
      </div>
      <p class="text-sm text-gray-600 mb-3">${scenario.description}</p>
      <p class="text-xs text-gray-600 mb-3">${scenarioExplanation}</p>
      
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div class="bg-white p-3 rounded border">
          <div class="text-xs text-gray-500">Required Corpus</div>
          <div class="font-medium">${formatCurrency(scenario.corpus)}</div>
          <div class="text-xs ${
            scenario.corpus < retirementResults.total_corpus_required
              ? "text-green-600"
              : "text-red-600"
          }">
            ${
              scenario.corpus < retirementResults.total_corpus_required
                ? "↓ " +
                  formatCurrency(
                    retirementResults.total_corpus_required - scenario.corpus
                  ) +
                  " less"
                : "↑ " +
                  formatCurrency(
                    scenario.corpus - retirementResults.total_corpus_required
                  ) +
                  " more"
            }
            than base plan
          </div>
        </div>
        
        <div class="bg-white p-3 rounded border">
          <div class="text-xs text-gray-500">Monthly Savings Needed</div>
          <div class="font-medium">${formatCurrency(
            scenario.monthly_savings
          )}</div>
          <div class="text-xs ${
            scenario.monthly_savings <
            retirementResults.required_monthly_savings
              ? "text-green-600"
              : "text-red-600"
          }">
            ${
              scenario.monthly_savings <
              retirementResults.required_monthly_savings
                ? "↓ " +
                  formatCurrency(
                    retirementResults.required_monthly_savings -
                      scenario.monthly_savings
                  ) +
                  " less"
                : "↑ " +
                  formatCurrency(
                    scenario.monthly_savings -
                      retirementResults.required_monthly_savings
                  ) +
                  " more"
            }
            than base plan
          </div>
        </div>
      </div>
    `;

    container.appendChild(card);
  }

  // Add comparison insight
  const insightDiv = document.createElement("div");
  insightDiv.className = "bg-blue-50 p-4 rounded-lg mt-4 text-sm";

  // Find the most feasible alternative scenario
  let mostFeasibleScenario = null;
  let highestFeasibility = -1;

  for (const [key, scenario] of Object.entries(retirementResults.scenarios)) {
    if (key !== "base" && scenario.feasibility > highestFeasibility) {
      mostFeasibleScenario = scenario;
      highestFeasibility = scenario.feasibility;
    }
  }

  if (mostFeasibleScenario) {
    insightDiv.innerHTML = `
      <h4 class="font-medium mb-2">Planning Insight</h4>
      <p>Based on your inputs, the <strong>${mostFeasibleScenario.name}</strong> scenario appears most achievable 
      with a feasibility score of ${mostFeasibleScenario.feasibility}/10. 
      Consider exploring this option as an alternative to your base retirement plan.</p>
    `;
    container.appendChild(insightDiv);
  }
}

/**
 * Creates a line chart for retirement corpus growth visualization
 *
 * @param {Object} userData User profile and financial information
 * @param {Object} retirementResults Retirement planning results
 */
function createRetirementGrowthChart(userData, retirementResults) {
  const ctx = document
    .getElementById("retirement-growth-chart")
    .getContext("2d");

  // Prepare data for chart
  const labels = [];
  const accumulationData = [];
  const retirementData = [];

  const projection = retirementResults.growth_projection;

  projection.forEach((point) => {
    labels.push(`Age ${point.age}`);

    if (point.phase === "accumulation") {
      accumulationData.push(point.amount);
      retirementData.push(null);
    } else {
      accumulationData.push(null);
      retirementData.push(point.amount);
    }
  });

  // Create chart
  if (window.retirementChart) {
    window.retirementChart.destroy();
  }

  window.retirementChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Accumulation Phase",
          data: accumulationData,
          backgroundColor: "rgba(79, 70, 229, 0.2)",
          borderColor: "rgba(79, 70, 229, 1)",
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: "rgba(79, 70, 229, 1)",
          tension: 0.1,
          fill: true,
        },
        {
          label: "Retirement Phase",
          data: retirementData,
          backgroundColor: "rgba(16, 185, 129, 0.2)",
          borderColor: "rgba(16, 185, 129, 1)",
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: "rgba(16, 185, 129, 1)",
          tension: 0.1,
          fill: true,
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
                return "₹" + (value / 10000000).toFixed(1) + " Cr";
              } else if (value >= 100000) {
                return "₹" + (value / 100000).toFixed(1) + " L";
              } else if (value >= 1000) {
                return "₹" + (value / 1000).toFixed(0) + "K";
              }
              return "₹" + value;
            },
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              return "Corpus: " + formatCurrency(context.raw);
            },
          },
        },
        annotation: {
          annotations: {
            retirementLine: {
              type: "line",
              yMin: 0,
              yMax: 0,
              xMin: userData.retirementAge - userData.age,
              xMax: userData.retirementAge - userData.age,
              borderColor: "rgba(255, 99, 132, 0.5)",
              borderWidth: 2,
              label: {
                content: "Retirement",
                enabled: true,
              },
            },
          },
        },
      },
    },
  });
}

/**
 * Updates the retirement income breakdown section
 * This function should be in ui.js
 *
 * @param {Object} retirementResults Retirement planning results
 */
function updateRetirementIncomeBreakdown(retirementResults) {
  // Check if retirement income breakdown section exists
  let retirementIncomeSection = document.getElementById(
    "retirement-income-breakdown"
  );
  if (!retirementIncomeSection) {
    // Create section if it doesn't exist
    retirementIncomeSection = document.createElement("div");
    retirementIncomeSection.id = "retirement-income-breakdown";
    retirementIncomeSection.className = "panel mt-6";

    // Add to retirement tab
    const retirementTab = document.getElementById("retirement-tab");
    retirementTab.appendChild(retirementIncomeSection);
  }

  // Get income breakdown data for both scenarios
  const idealScenario = retirementResults.retirement_income_breakdown.ideal;
  const projectedScenario =
    retirementResults.retirement_income_breakdown.projected;

  // Format surplus/deficit for both scenarios
  const idealSurplusDeficitText = formatSurplusDeficit(
    idealScenario.surplus_deficit
  );
  const projectedSurplusDeficitText = formatSurplusDeficit(
    projectedScenario.surplus_deficit
  );

  // Create explanation text based on scenarios
  const explanationText = getScenarioExplanation(
    idealScenario,
    projectedScenario
  );

  // Create content
  let content = `
    <h3 class="panel-title">Retirement Income Sources</h3>
    
    <div class="mb-4 p-3 bg-indigo-50 rounded-lg text-sm">
      <p><strong>Understanding this section:</strong> ${explanationText}</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Ideal Scenario Column -->
      <div class="bg-green-50 p-4 rounded-lg">
        <h4 class="font-medium mb-2 text-green-800">Ideal Scenario</h4>
        <p class="text-xs mb-3 text-gray-600">If you reach your target retirement corpus</p>
        
        <div class="flex justify-between mb-2">
          <span class="font-medium">Annual Expenses:</span>
          <span>${formatCurrency(idealScenario.annual_expenses)}</span>
        </div>
        <div class="flex justify-between mb-2">
          <span class="font-medium">Total Annual Income:</span>
          <span>${formatCurrency(idealScenario.total_income)}</span>
        </div>
        <div class="flex justify-between mb-4">
          <span class="font-medium">Income vs. Expenses:</span>
          <span>${idealSurplusDeficitText}</span>
        </div>
        
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b">
              <th class="text-left py-2">Income Source</th>
              <th class="text-right py-2">Annual Amount</th>
              <th class="text-right py-2">Percentage</th>
            </tr>
          </thead>
          <tbody>
            ${createIncomeSourceRows(idealScenario)}
          </tbody>
        </table>
      </div>
      
      <!-- Projected Scenario Column -->
      <div class="bg-yellow-50 p-4 rounded-lg">
        <h4 class="font-medium mb-2 text-yellow-800">Projected Scenario</h4>
        <p class="text-xs mb-3 text-gray-600">Based on your current savings rate</p>
        
        <div class="flex justify-between mb-2">
          <span class="font-medium">Annual Expenses:</span>
          <span>${formatCurrency(projectedScenario.annual_expenses)}</span>
        </div>
        <div class="flex justify-between mb-2">
          <span class="font-medium">Total Annual Income:</span>
          <span>${formatCurrency(projectedScenario.total_income)}</span>
        </div>
        <div class="flex justify-between mb-4">
          <span class="font-medium">Income vs. Expenses:</span>
          <span>${projectedSurplusDeficitText}</span>
        </div>
        
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b">
              <th class="text-left py-2">Income Source</th>
              <th class="text-right py-2">Annual Amount</th>
              <th class="text-right py-2">Percentage</th>
            </tr>
          </thead>
          <tbody>
            ${createIncomeSourceRows(projectedScenario)}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Update section
  retirementIncomeSection.innerHTML = content;
}

/**
 * Helper function to format surplus/deficit text with appropriate styling
 */
function formatSurplusDeficit(surplusDeficit) {
  if (surplusDeficit >= 0) {
    return `<span class="text-green-600">Surplus: ${formatCurrency(
      surplusDeficit
    )}</span>`;
  } else {
    return `<span class="text-red-600">Deficit: ${formatCurrency(
      Math.abs(surplusDeficit)
    )}</span>`;
  }
}

/**
 * Helper function to create table rows for income sources
 */
function createIncomeSourceRows(scenario) {
  let rows = "";

  // Add sources with values > 0
  if (scenario.corpus_income > 0) {
    rows += createSourceRow(
      "Investment Corpus",
      scenario.corpus_income,
      scenario.income_sources.corpus
    );
  }

  if (scenario.epf_ppf > 0) {
    rows += createSourceRow(
      "EPF/PPF",
      scenario.epf_ppf,
      scenario.income_sources.epf_ppf
    );
  }

  if (scenario.nps > 0) {
    rows += createSourceRow("NPS", scenario.nps, scenario.income_sources.nps);
  }

  if (scenario.rental > 0) {
    rows += createSourceRow(
      "Rental Income",
      scenario.rental,
      scenario.income_sources.rental
    );
  }

  if (scenario.other > 0) {
    rows += createSourceRow(
      "Other Sources",
      scenario.other,
      scenario.income_sources.other
    );
  }

  return rows;
}

/**
 * Helper function to create a single row
 */
function createSourceRow(name, amount, percentage) {
  return `
    <tr class="border-b">
      <td class="py-2">${name}</td>
      <td class="text-right">${formatCurrency(amount)}</td>
      <td class="text-right">${percentage.toFixed(1)}%</td>
    </tr>
  `;
}

/**
 * Helper function to generate explanation text based on scenario comparison
 */
function getScenarioExplanation(idealScenario, projectedScenario) {
  if (projectedScenario.surplus_deficit >= 0) {
    return "Your current savings are on track to meet your retirement goals.";
  } else {
    const percentCovered =
      (projectedScenario.total_income / projectedScenario.annual_expenses) *
      100;
    return `Based on your current savings rate, you're projected to cover ${percentCovered.toFixed(
      1
    )}% of your retirement expenses. Consider increasing your savings rate, delaying retirement, or adjusting your retirement lifestyle expectations to close this gap.`;
  }
}

/**
 * Creates a pie chart for retirement income sources
 *
 * @param {Object} incomeBreakdown Retirement income breakdown data
 */
function createRetirementIncomeChart(incomeBreakdown) {
  const ctx = document
    .getElementById("retirement-income-chart")
    .getContext("2d");

  // Prepare data
  const data = [];
  const labels = [];
  const backgroundColors = [
    "#4F46E5", // Indigo
    "#10B981", // Emerald
    "#F59E0B", // Amber
    "#EF4444", // Red
    "#8B5CF6", // Purple
  ];

  // Add sources with values > 0
  if (incomeBreakdown.corpus_income > 0) {
    data.push(incomeBreakdown.corpus_income);
    labels.push("Investment Corpus");
  }

  if (incomeBreakdown.epf_ppf > 0) {
    data.push(incomeBreakdown.epf_ppf);
    labels.push("EPF/PPF");
  }

  if (incomeBreakdown.nps > 0) {
    data.push(incomeBreakdown.nps);
    labels.push("NPS");
  }

  if (incomeBreakdown.rental > 0) {
    data.push(incomeBreakdown.rental);
    labels.push("Rental Income");
  }

  if (incomeBreakdown.other > 0) {
    data.push(incomeBreakdown.other);
    labels.push("Other Sources");
  }

  // Create chart
  if (window.retirementIncomeChart) {
    window.retirementIncomeChart.destroy();
  }

  window.retirementIncomeChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: backgroundColors.slice(0, data.length),
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            boxWidth: 12,
            padding: 15,
            font: {
              size: 11,
            },
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const value = context.raw;
              const total = context.chart.data.datasets[0].data.reduce(
                (a, b) => a + b,
                0
              );
              const percentage = ((value / total) * 100).toFixed(1);
              return `${context.label}: ${formatCurrency(
                value
              )} (${percentage}%)`;
            },
          },
        },
      },
    },
  });
}

/**
 * Updates the retirement readiness section with correct percentage calculations
 *
 * @param {Object} retirementResults Retirement planning results
 */
function updateRetirementReadiness(retirementResults) {
  // Check if retirement readiness section exists
  let readinessSection = document.getElementById(
    "retirement-readiness-section"
  );
  if (!readinessSection) {
    // Create section if it doesn't exist
    readinessSection = document.createElement("div");
    readinessSection.id = "retirement-readiness-section";
    readinessSection.className = "panel mt-6";

    // Add to retirement tab
    const retirementTab = document.getElementById("retirement-tab");
    retirementTab.appendChild(readinessSection);
  }

  // Get readiness data
  const readiness = retirementResults.retirement_readiness;

  // Determine color based on score
  let scoreColor, bgColor;
  if (readiness.score >= 90) {
    scoreColor = "text-green-700";
    bgColor = "bg-green-100";
  } else if (readiness.score >= 75) {
    scoreColor = "text-green-600";
    bgColor = "bg-green-50";
  } else if (readiness.score >= 50) {
    scoreColor = "text-yellow-700";
    bgColor = "bg-yellow-50";
  } else if (readiness.score >= 25) {
    scoreColor = "text-orange-700";
    bgColor = "bg-orange-50";
  } else {
    scoreColor = "text-red-700";
    bgColor = "bg-red-50";
  }

  // FIXED: Calculate the savings and corpus ratios correctly
  const savingsRatio =
    retirementResults.recommended_monthly_savings /
    retirementResults.required_monthly_savings;

  const corpusRatio =
    retirementResults.retirement_readiness.projected_corpus /
    retirementResults.total_corpus_required;

  // Calculate expense coverage correctly
  const expenseCoverageRatio = Math.min(1, corpusRatio);

  // Format the ratios as percentages
  const savingsPercentage = (savingsRatio * 100).toFixed(1);
  const corpusPercentage = (corpusRatio * 100).toFixed(1);
  const expenseCoveragePercentage = (expenseCoverageRatio * 100).toFixed(1);

  // Create content with explanations for transparency
  readinessSection.innerHTML = `
  <h3 class="panel-title">Retirement Readiness Assessment</h3>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="col-span-1">
      <div class="flex flex-col items-center ${bgColor} p-4 rounded-lg">
        <h4 class="font-medium mb-2">Readiness Score</h4>
        <div class="text-4xl font-bold ${scoreColor} mb-2">${
    readiness.score
  }/100</div>
        <div class="font-medium ${scoreColor} mb-2">${readiness.status}</div>
        <div class="w-full bg-gray-200 rounded-full h-2.5 mb-1">
          <div class="h-2.5 rounded-full" 
              style="width: ${
                readiness.score
              }%; background-color: var(--color-${scoreColor.replace(
    "text-",
    ""
  )})"></div>
        </div>
        <div class="flex justify-between w-full text-xs text-gray-600">
          <span>Critical</span>
          <span>Fair</span>
          <span>Excellent</span>
        </div>
        <div class="mt-3 text-xs text-gray-600 text-center">
          <p>Based primarily on your projected ability to cover ${expenseCoveragePercentage}% of retirement expenses</p>
        </div>
      </div>
    </div>
    <div class="col-span-2">
      <h4 class="font-medium mb-3">Key Metrics</h4>
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div class="text-sm text-gray-500">Monthly Savings</div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <div class="text-xs text-gray-500">Current</div>
              <div class="font-medium">${formatCurrency(
                retirementResults.recommended_monthly_savings
              )}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500">Required</div>
              <div class="font-medium">${formatCurrency(
                retirementResults.required_monthly_savings
              )}</div>
            </div>
          </div>
          <div class="mt-1 mb-1 relative">
            <div class="w-full h-4 border border-gray-300 rounded-full overflow-hidden">
              <div class="bg-blue-600 h-full absolute left-0 top-0 z-0" 
                  style="width: ${Math.min(100, savingsRatio * 100)}%"></div>
              <div class="relative z-10 text-xs text-white text-center py-0.5">
                ${savingsPercentage}% of needed
              </div>
            </div>
          </div>
        </div>
        <div>
          <div class="text-sm text-gray-500">Retirement Corpus</div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <div class="text-xs text-gray-500">Projected</div>
              <div class="font-medium">${formatCurrency(
                readiness.projected_corpus
              )}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500">Required</div>
              <div class="font-medium">${formatCurrency(
                retirementResults.total_corpus_required
              )}</div>
            </div>
          </div>
          <div class="mt-1 mb-1 relative">
            <div class="w-full h-4 border border-gray-300 rounded-full overflow-hidden">
              <div class="bg-blue-600 h-full absolute left-0 top-0 z-0" 
                  style="width: ${Math.min(100, corpusRatio * 100)}%"></div>
              <div class="relative z-10 text-xs text-white text-center py-0.5">
  ${expenseCoveragePercentage}% of needed
</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="bg-gray-50 p-3 rounded-lg text-sm mb-3">
        <p><strong>Retirement Expense Coverage:</strong> Your projected retirement income is expected to cover <strong>${expenseCoveragePercentage}%</strong> of your retirement expenses.</p>
      </div>
      
      <h4 class="font-medium mb-2">Next Steps</h4>
      <ul class="list-disc pl-5 space-y-1 text-sm">
        ${readiness.next_steps.map((step) => `<li>${step}</li>`).join("")}
      </ul>
    </div>
  </div>
`;
}

// === INVESTMENT TAB UI UPDATES ===

/**
 * Updates the investment tab with all investment-related information
 *
 * @param {Object} userData User profile and financial information
 * @param {Object} investmentResults Investment recommendations
 */
function updateInvestmentTab(userData, investmentResults) {
  // Update investment breakdown table
  updateInvestmentBreakdownTable(investmentResults);

  // Update investment recommendations
  updateInvestmentRecommendations(investmentResults);

  // Create investment chart
  createInvestmentChart(investmentResults);

  // Add wealth building plan
  updateWealthBuildingPlan(userData, investmentResults);
}

/**
 * Updates the investment breakdown table
 *
 * @param {Object} investmentResults Investment recommendations
 */
function updateInvestmentBreakdownTable(investmentResults) {
  const table = document.getElementById("investment-breakdown-table");
  table.innerHTML = "";

  // Category display names mapping
  const categoryDisplayNames = {
    equity: "Equity",
    debt: "Debt",
    gold: "Gold",
    alternatives: "Alternatives",
  };

  // Add rows for each category
  for (const [category, percentage] of Object.entries(
    investmentResults.allocation_percentages
  )) {
    const displayName = categoryDisplayNames[category] || category;
    const amount = investmentResults.monthly_investment * (percentage / 100);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${displayName}</td>
      <td class="text-right">${percentage.toFixed(1)}%</td>
      <td class="text-right">${formatCurrency(amount)}</td>
    `;
    table.appendChild(row);
  }

  // Add total row
  const totalRow = document.createElement("tr");
  totalRow.classList.add("font-bold", "border-t-2", "border-gray-300");
  totalRow.innerHTML = `
    <td>Total</td>
    <td class="text-right">100%</td>
    <td class="text-right">${formatCurrency(
      investmentResults.monthly_investment
    )}</td>
  `;
  table.appendChild(totalRow);
}

/**
 * Updates investment recommendations section
 *
 * @param {Object} investmentResults Investment recommendations
 */
function updateInvestmentRecommendations(investmentResults) {
  const container = document.getElementById("investment-recommendations");
  container.innerHTML = "";

  // Create recommendation sections for each category
  const categories = ["equity", "debt", "gold", "alternatives"];
  const categoryTitles = {
    equity: "Equity Investments",
    debt: "Debt Investments",
    gold: "Gold Investments",
    alternatives: "Alternative Investments",
  };

  categories.forEach((category) => {
    if (
      investmentResults.specific_recommendations[category] &&
      investmentResults.specific_recommendations[category].length > 0
    ) {
      const section = document.createElement("div");
      section.className = "mb-6";

      const heading = document.createElement("h4");
      heading.className = "font-semibold text-lg mb-3";
      heading.textContent = categoryTitles[category];
      section.appendChild(heading);

      const recommendations =
        investmentResults.specific_recommendations[category];
      recommendations.forEach((rec) => {
        // Determine risk level color
        let riskColor = "bg-blue-100 text-blue-800";
        if (rec.riskLevel === "Very Low" || rec.riskLevel === "Low") {
          riskColor = "bg-green-100 text-green-800";
        } else if (rec.riskLevel === "Medium") {
          riskColor = "bg-blue-100 text-blue-800";
        } else if (rec.riskLevel === "Medium-High") {
          riskColor = "bg-yellow-100 text-yellow-800";
        } else if (rec.riskLevel === "High" || rec.riskLevel === "Very High") {
          riskColor = "bg-red-100 text-red-800";
        }

        // Determine tax efficiency color
        let taxColor = "bg-blue-100 text-blue-800";
        if (rec.taxEfficiency === "Very High" || rec.taxEfficiency === "High") {
          taxColor = "bg-green-100 text-green-800";
        } else if (
          rec.taxEfficiency === "Medium-High" ||
          rec.taxEfficiency === "Medium"
        ) {
          taxColor = "bg-blue-100 text-blue-800";
        } else if (rec.taxEfficiency === "Low") {
          taxColor = "bg-yellow-100 text-yellow-800";
        }

        const recCard = document.createElement("div");
        recCard.className = "bg-gray-50 p-3 mb-3 rounded";

        const header = document.createElement("div");
        header.className = "flex justify-between items-center mb-2";

        const title = document.createElement("div");
        title.className = "font-medium";
        title.textContent = rec.type;

        const allocation = document.createElement("div");
        allocation.className = "text-sm";
        allocation.innerHTML = `${rec.allocation.toFixed(
          1
        )}% <span class="text-gray-500">(${formatCurrency(rec.amount)})</span>`;

        header.appendChild(title);
        header.appendChild(allocation);

        const details = document.createElement("div");
        details.className = "text-sm text-gray-600 mb-2";
        details.textContent = rec.details;

        const metrics = document.createElement("div");
        metrics.className = "flex flex-wrap gap-2 mb-2";
        metrics.innerHTML = `
          <span class="text-xs px-2 py-1 rounded ${riskColor}">
            Risk: ${rec.riskLevel}
          </span>
          <span class="text-xs px-2 py-1 rounded ${taxColor}">
            Tax: ${rec.taxEfficiency}
          </span>
          <span class="text-xs px-2 py-1 rounded bg-gray-100 text-gray-800">
            For: ${rec.recommendedFor}
          </span>
        `;

        const options = document.createElement("div");
        options.className =
          "text-sm bg-white p-2 rounded border border-gray-200";
        options.innerHTML = rec.options
          .map((opt) => `<div class="mb-1">• ${opt}</div>`)
          .join("");

        recCard.appendChild(header);
        recCard.appendChild(details);
        recCard.appendChild(metrics);
        recCard.appendChild(options);

        section.appendChild(recCard);
      });

      container.appendChild(section);
    }
  });

  // Add tax tips if available
  if (investmentResults.specific_recommendations.tax_tips) {
    const taxTipsSection = document.createElement("div");
    taxTipsSection.className = "mt-6 p-4 bg-blue-50 rounded-lg";

    const taxTipsHeading = document.createElement("h4");
    taxTipsHeading.className = "font-semibold text-lg mb-2 text-blue-800";
    taxTipsHeading.textContent = "Tax Optimization Tips";

    const taxTipsList = document.createElement("ul");
    taxTipsList.className = "list-disc pl-5 space-y-1";
    taxTipsList.innerHTML = investmentResults.specific_recommendations.tax_tips
      .map((tip) => `<li class="text-blue-800">${tip}</li>`)
      .join("");

    taxTipsSection.appendChild(taxTipsHeading);
    taxTipsSection.appendChild(taxTipsList);
    container.appendChild(taxTipsSection);
  }
}

/**
 * Creates a pie chart for investment allocation visualization
 *
 * @param {Object} investmentResults Investment recommendations
 */
function createInvestmentChart(investmentResults) {
  const ctx = document.getElementById("investment-chart").getContext("2d");

  // Prepare data for chart
  const labels = [];
  const data = [];
  const backgroundColors = [
    "#4F46E5", // Indigo
    "#10B981", // Emerald
    "#F59E0B", // Amber
    "#8B5CF6", // Purple
  ];

  // Add data for each category
  for (const [category, percentage] of Object.entries(
    investmentResults.allocation_percentages
  )) {
    const displayName = category.charAt(0).toUpperCase() + category.slice(1);
    labels.push(displayName);
    data.push(percentage);
  }

  // Create chart
  if (window.investmentChart) {
    window.investmentChart.destroy();
  }

  window.investmentChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: backgroundColors.slice(0, data.length),
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            boxWidth: 15,
            padding: 15,
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const value = context.raw;
              const amount =
                investmentResults.monthly_investment * (value / 100);
              return `${context.label}: ${value.toFixed(1)}% (${formatCurrency(
                amount
              )})`;
            },
          },
        },
      },
    },
  });
}

/**
 * Updates the wealth building plan section
 *
 * @param {Object} userData User profile information
 * @param {Object} investmentResults Investment recommendations
 */
function updateWealthBuildingPlan(userData, investmentResults) {
  // Check if wealth building plan section exists
  let wealthPlanSection = document.getElementById("wealth-building-plan");
  if (!wealthPlanSection) {
    // Create section if it doesn't exist
    wealthPlanSection = document.createElement("div");
    wealthPlanSection.id = "wealth-building-plan";
    wealthPlanSection.className = "panel mt-6";

    // Add to investment tab
    const investmentTab = document.getElementById("investments-tab");
    investmentTab.appendChild(wealthPlanSection);
  }

  // Get plan data
  const plan = investmentResults.wealth_building_plan;

  // Create timeline HTML
  let timelineHTML = "";

  plan.timeline.forEach((phase, index) => {
    const isLast = index === plan.timeline.length - 1;

    timelineHTML += `
      <div class="relative pb-8 ${isLast ? "" : "border-l border-gray-200"}">
        <div class="relative flex items-start">
          <span class="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
            <svg class="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
            </svg>
          </span>
          <div class="ml-4 min-w-0 flex-1">
            <div>
              <p class="text-sm font-bold text-gray-700">${phase.phase}</p>
              <p class="text-xs text-gray-500">${phase.years}</p>
            </div>
            <div class="mt-2">
              <p class="text-sm font-medium text-indigo-600">${phase.focus}</p>
              <p class="mt-1 text-sm text-gray-600">${phase.description}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  // Create milestones HTML
  let milestonesHTML = "";

  plan.milestones.forEach((milestone) => {
    milestonesHTML += `
      <div class="bg-white p-4 rounded-lg border border-gray-200 mb-3">
        <h4 class="font-medium text-indigo-700">${milestone.name}</h4>
        <p class="text-sm text-gray-600 mb-1">${milestone.description}</p>
        <p class="text-xs text-gray-500">Timeframe: ${milestone.timeframe}</p>
      </div>
    `;
  });

  // Create strategies HTML
  let strategiesHTML = "";

  plan.strategies.forEach((strategy) => {
    strategiesHTML += `
      <div class="mb-4">
        <h4 class="font-medium text-gray-800">${strategy.name}</h4>
        <p class="text-sm text-gray-600 mb-1">${strategy.description}</p>
        <p class="text-xs text-gray-500">Benefit: ${strategy.benefit}</p>
      </div>
    `;
  });

  // Update section
  wealthPlanSection.innerHTML = `
    <h3 class="panel-title">Long-Term Wealth Building Plan</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 class="font-semibold text-lg mb-3">Wealth Building Timeline</h4>
        <div class="flow-root">
          <ul class="-mb-8">
            ${timelineHTML}
          </ul>
        </div>
      </div>
      <div>
        <div class="mb-6">
          <h4 class="font-semibold text-lg mb-3">Key Financial Milestones</h4>
          <div class="space-y-2">
            ${milestonesHTML}
          </div>
        </div>
        <div>
          <h4 class="font-semibold text-lg mb-3">Recommended Strategies</h4>
          <div class="bg-gray-50 p-4 rounded-lg">
            ${strategiesHTML}
          </div>
        </div>
      </div>
    </div>
  `;
}

// === OPTIMIZATION TAB UI UPDATES ===

/**
 * Updates the optimization tab with expense optimization opportunities
 *
 * @param {Object} userData User profile and financial information
 * @param {Object} optimizationResults Optimization opportunities
 * @param {Object} budgetResults Budget allocation results
 */
function updateOptimizationTab(userData, optimizationResults, budgetResults) {
  const container = document.getElementById("optimization-opportunities");
  container.innerHTML = "";

  if (!optimizationResults.has_opportunities) {
    const noOpportunities = document.createElement("div");
    noOpportunities.className = "text-center py-4 text-gray-500";
    noOpportunities.textContent =
      "No significant optimization opportunities found. Your budget is well-balanced!";
    container.appendChild(noOpportunities);

    // Add income improvement section even if no expense optimizations
    addIncomeImprovementSection(userData, optimizationResults);
    return;
  }

  // Add summary card
  const summaryCard = document.createElement("div");
  summaryCard.className = "bg-green-50 p-4 rounded-lg mb-6";
  summaryCard.innerHTML = `
    <h4 class="font-semibold text-lg mb-2">Potential Monthly Savings</h4>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <div class="text-sm text-gray-600">Conservative</div>
        <div class="font-semibold text-xl">${formatCurrency(
          optimizationResults.total_potential_savings.conservative
        )}</div>
      </div>
      <div>
        <div class="text-sm text-gray-600">Moderate</div>
        <div class="font-semibold text-xl text-green-600">${formatCurrency(
          optimizationResults.total_potential_savings.moderate
        )}</div>
      </div>
      <div>
        <div class="text-sm text-gray-600">Aggressive</div>
        <div class="font-semibold text-xl">${formatCurrency(
          optimizationResults.total_potential_savings.aggressive
        )}</div>
      </div>
    </div>
  `;
  container.appendChild(summaryCard);

  // Category display names mapping
  const categoryDisplayNames = {
    housing: "Housing",
    food: "Food",
    utilities: "Utilities",
    transport: "Transportation",
    healthcare: "Healthcare",
    education: "Education",
    personal: "Personal Care",
    household: "Household",
    discretionary: "Discretionary Spending",
  };

  // Add opportunity cards for each category
  optimizationResults.opportunities.forEach((opportunity) => {
    const categoryName =
      categoryDisplayNames[opportunity.category] || opportunity.category;

    const card = document.createElement("div");
    card.className = "mb-6 border rounded-lg shadow-sm";

    // Card header
    const header = document.createElement("div");
    header.className = "p-4 border-b bg-gray-50";
    header.innerHTML = `
      <div class="flex justify-between items-center">
        <div class="opportunity-title font-semibold">${categoryName}</div>
        <div class="opportunity-amount text-green-600 font-semibold">
          Save up to ${formatCurrency(opportunity.potential_savings.moderate)}
        </div>
      </div>
    `;

    // Card details
    const details = document.createElement("div");
    details.className = "p-4 border-b";
    details.innerHTML = `
      <div class="grid grid-cols-2 gap-4">
        <div>
          <div class="flex justify-between items-center mb-2">
            <div class="text-sm text-gray-600">Current Spending</div>
            <div class="font-medium">${formatCurrency(
              opportunity.current_spending
            )}</div>
          </div>
          <div class="flex justify-between items-center mb-2">
            <div class="text-sm text-gray-600">Benchmark</div>
            <div class="font-medium">${formatCurrency(
              opportunity.benchmark
            )}</div>
          </div>
          <div class="flex justify-between items-center">
            <div class="text-sm text-gray-600">Excess</div>
            <div class="font-medium text-red-500">+${opportunity.excess_percentage.toFixed(
              0
            )}%</div>
          </div>
        </div>
        <div>
          <div class="mb-2">
            <div class="text-sm text-gray-600 mb-1">Spending vs. Benchmark</div>
            <div class="w-full h-4 bg-gray-200 rounded">
              <div class="h-4 bg-blue-600 rounded" style="width: ${Math.min(
                100,
                (opportunity.benchmark / opportunity.current_spending) * 100
              )}%"></div>
            </div>
            <div class="flex justify-between text-xs mt-1">
              <span>Benchmark: ${formatCurrency(opportunity.benchmark)}</span>
              <span>Current: ${formatCurrency(
                opportunity.current_spending
              )}</span>
            </div>
          </div>
          <div>
            <div class="text-sm text-gray-600 mb-1">Income Percentage</div>
            <div class="w-full h-4 bg-gray-200 rounded">
              <div class="h-4 bg-green-600 rounded" style="width: ${Math.min(
                100,
                opportunity.income_percentage
              )}%"></div>
            </div>
            <div class="flex justify-between text-xs mt-1">
              <span>0%</span>
              <span>${opportunity.income_percentage.toFixed(
                1
              )}% of income</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Card recommendations
    const recommendations = document.createElement("div");
    recommendations.className = "opportunity-recommendations";

    opportunity.recommendations.forEach((rec) => {
      // Set effort badge color
      let effortClass = "bg-gray-100 text-gray-600";
      if (rec.effort === "low") {
        effortClass = "bg-green-100 text-green-600";
      } else if (rec.effort === "high") {
        effortClass = "bg-red-100 text-red-600";
      }

      // Set type badge color
      let typeClass = "bg-gray-100 text-gray-600";
      if (rec.type === "immediate") {
        typeClass = "bg-green-100 text-green-600";
      } else if (rec.type === "behavioral") {
        typeClass = "bg-blue-100 text-blue-600";
      } else if (rec.type === "structural") {
        typeClass = "bg-orange-100 text-orange-600";
      }

      const recItem = document.createElement("div");
      recItem.className = "p-3 border-t flex items-start";

      recItem.innerHTML = `
        <div class="recommendation-icon mr-3 mt-1 text-green-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="recommendation-text flex-1">
          <div class="mb-1">${rec.action}</div>
          <div class="flex flex-wrap gap-2">
            <span class="recommendation-impact text-sm text-green-600 font-medium">
              Save ${formatCurrency(rec.impact)}
            </span>
            <span class="recommendation-effort text-xs px-2 py-1 rounded-full ${effortClass}">
              ${rec.effort.charAt(0).toUpperCase() + rec.effort.slice(1)} effort
            </span>
            <span class="recommendation-type text-xs px-2 py-1 rounded-full ${typeClass}">
              ${rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}
            </span>
          </div>
        </div>
      `;

      recommendations.appendChild(recItem);
    });

    card.appendChild(header);
    card.appendChild(details);
    card.appendChild(recommendations);

    container.appendChild(card);
  });

  // Add income improvement section
  addIncomeImprovementSection(userData, optimizationResults);
}

/**
 * Adds the income improvement section to the optimization tab
 *
 * @param {Object} userData User profile information
 * @param {Object} optimizationResults Optimization opportunities
 */
function addIncomeImprovementSection(userData, optimizationResults) {
  // Check if income improvement section exists
  let incomeSection = document.getElementById("income-improvement-section");
  if (!incomeSection) {
    // Create section if it doesn't exist
    incomeSection = document.createElement("div");
    incomeSection.id = "income-improvement-section";
    incomeSection.className = "panel mt-6";

    // Add to optimization tab
    const optimizationTab = document.getElementById("optimization-tab");
    optimizationTab.appendChild(incomeSection);
  }

  // Get income improvement suggestions
  const suggestions = optimizationResults.income_improvement;

  // Create content
  incomeSection.innerHTML = `
    <h3 class="panel-title">Income Improvement Opportunities</h3>
    <p class="mb-4">Increasing your income can have a larger impact on your financial future than reducing expenses. Consider these suggestions:</p>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      ${suggestions
        .map(
          (suggestion) => `
        <div class="bg-blue-50 rounded-lg p-4">
          <h4 class="font-semibold text-lg mb-1">${suggestion.title}</h4>
          <p class="text-sm text-gray-700 mb-2">${suggestion.description}</p>
          <div class="flex flex-wrap gap-2 mb-2">
            <span class="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
              ${
                suggestion.effort.charAt(0).toUpperCase() +
                suggestion.effort.slice(1)
              } Effort
            </span>
            <span class="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
              ${
                suggestion.impact.charAt(0).toUpperCase() +
                suggestion.impact.slice(1)
              } Impact
            </span>
          </div>
          ${
            suggestion.resources
              ? `
            <div class="mt-2">
              <div class="text-xs font-medium text-gray-500 mb-1">Resources:</div>
              <ul class="text-xs text-gray-700 list-disc pl-4">
                ${suggestion.resources
                  .map((resource) => `<li>${resource}</li>`)
                  .join("")}
              </ul>
            </div>
          `
              : ""
          }
          ${
            suggestion.steps
              ? `
            <div class="mt-2">
              <div class="text-xs font-medium text-gray-500 mb-1">Steps:</div>
              <ol class="text-xs text-gray-700 list-decimal pl-4">
                ${suggestion.steps.map((step) => `<li>${step}</li>`).join("")}
              </ol>
            </div>
          `
              : ""
          }
          ${
            suggestion.examples
              ? `
            <div class="mt-2">
              <div class="text-xs font-medium text-gray-500 mb-1">Examples:</div>
              <ul class="text-xs text-gray-700 list-disc pl-4">
                ${suggestion.examples
                  .map((example) => `<li>${example}</li>`)
                  .join("")}
              </ul>
            </div>
          `
              : ""
          }
        </div>
      `
        )
        .join("")}
    </div>
  `;
}

// === PDF EXPORT FUNCTION ===

/**
 * Generates a PDF export of the retirement plan
 * This is a placeholder function that would need to be implemented
 * with a PDF generation library
 */
function generatePDF() {
  // Placeholder for PDF generation functionality
  alert("PDF export would generate a complete report of your retirement plan");

  // In a real implementation, this would use a library like jsPDF to:
  // 1. Capture data from all tabs
  // 2. Format it into a professionally designed PDF
  // 3. Include charts and visualizations
  // 4. Provide download option
}
// === ADVANCED FEATURES AND INTERACTIVE ELEMENTS ===

/**
 * Initializes all interactive elements and advanced features
 * Called after DOM content is loaded and UI is updated
 */
function initializeAdvancedFeatures() {
  // Initialize tooltips
  initializeTooltips();

  // Initialize interactive comparison tools
  initializeComparisonTools();

  // Initialize tax calculators
  initializeTaxCalculators();

  // Initialize SIP calculator
  initializeSIPCalculator();

  // Initialize goal planning tools
  initializeGoalPlanner();

  // Set up event listeners for dynamic content
  setupDynamicEventListeners();
}

/**
 * Initializes tooltip functionality
 * Adds tooltips to all elements with info-tooltip class
 */
function initializeTooltips() {
  // Get all tooltip elements
  const tooltipElements = document.querySelectorAll(".info-tooltip");

  tooltipElements.forEach((element) => {
    // Add event listeners for mouse hover
    element.addEventListener("mouseenter", showTooltip);
    element.addEventListener("mouseleave", hideTooltip);
  });
}

/**
 * Shows tooltip on hover
 *
 * @param {Event} event Mouse event
 */
function showTooltip(event) {
  const tooltipText =
    event.target.title || event.target.getAttribute("data-tooltip");
  if (!tooltipText) return;

  // Create tooltip element
  const tooltip = document.createElement("div");
  tooltip.className =
    "tooltip bg-gray-800 text-white p-2 rounded text-xs max-w-xs absolute z-50";
  tooltip.textContent = tooltipText;

  // Position tooltip
  const rect = event.target.getBoundingClientRect();
  tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;
  tooltip.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
  tooltip.style.transform = "translateX(-50%)";

  // Add to document
  document.body.appendChild(tooltip);

  // Store reference to tooltip in element
  event.target.tooltip = tooltip;
}

/**
 * Hides tooltip when mouse leaves element
 *
 * @param {Event} event Mouse event
 */
function hideTooltip(event) {
  if (event.target.tooltip) {
    document.body.removeChild(event.target.tooltip);
    event.target.tooltip = null;
  }
}

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
    const scenarioName = card.querySelector("h5").textContent;
    const compareBtn = document.createElement("button");
    compareBtn.className =
      "compare-scenario-btn text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200 mt-2";
    compareBtn.textContent = "Compare";
    compareBtn.setAttribute("data-scenario", scenarioNameToId(scenarioName));
    card.appendChild(compareBtn);
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
        <td class="py-2 text-right">${result.effectiveTaxRate.toFixed(2)}%</td>
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
          <div class="font-medium">${formatCurrency(result.taxFreeAmount)}</div>
        </div>
        <div>
          <div class="text-yellow-800">Annuity (40%)</div>
          <div class="font-medium">${formatCurrency(result.annuityAmount)}</div>
        </div>
      </div>
    `;
    resultsContainer.appendChild(npsInfo);
  }
}

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
        <div class="font-medium">${formatCurrency(result.totalInvestment)}</div>
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

// === DYNAMIC EVENT HANDLERS ===

/**
 * Sets up event listeners for dynamically created UI elements
 */
function setupDynamicEventListeners() {
  // Event delegation for dynamically created elements
  document.addEventListener("click", function (event) {
    // Handle clicks on dynamic elements using closest() method

    // Example: handling scenario compare buttons that might be added dynamically
    const compareBtn = event.target.closest(".compare-scenario-btn");
    if (compareBtn) {
      const scenarioId = compareBtn.getAttribute("data-scenario");
      addScenarioToComparison(scenarioId);
    }

    // Example: handling goal delete buttons that might be added dynamically
    const deleteGoalBtn = event.target.closest(".delete-goal-btn");
    if (deleteGoalBtn) {
      const goalId = parseInt(deleteGoalBtn.getAttribute("data-goal-id"));
      deleteGoal(goalId);
    }
  });
}

// === ADDITIONAL UTILITY FUNCTIONS ===

/**
 * Implementation of debounce function for performance optimization
 *
 * @param {Function} func Function to debounce
 * @param {number} wait Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

/**
 * Safely parses a number, returning a default value if parsing fails
 *
 * @param {string|number} value Value to parse
 * @param {number} defaultValue Default value to return if parsing fails
 * @returns {number} Parsed number or default value
 */
function safeParseNumber(value, defaultValue = 0) {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Validates a number is within a specified range
 *
 * @param {number} value Value to validate
 * @param {number} min Minimum allowed value
 * @param {number} max Maximum allowed value
 * @returns {number} Value clamped to the range
 */
function validateNumberInRange(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Converts a number to Indian formatting (with lakhs and crores)
 *
 * @param {number} value Number to format
 * @returns {string} Formatted string
 */
function formatIndianNumber(value) {
  // Shortcut for low values
  if (value < 1000) {
    return value.toFixed(0);
  }

  // Convert to string and split on decimal
  const parts = value.toFixed(2).split(".");

  // Extract the whole number part
  let numberString = parts[0];

  // Format with Indian number system (thousands, lakhs, crores)
  // First add comma for thousands
  if (numberString.length > 3) {
    numberString = numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // Convert to Indian format (replace commas for lakhs and crores)
  numberString = numberString.replace(
    /,(\d{2})\,(\d{2})\,(\d{3})$/,
    ",$1,$2,$3"
  );
  numberString = numberString.replace(/,(\d{2})\,(\d{3})$/, ",$1,$2");

  // Return with or without decimal part
  if (parseInt(parts[1]) === 0) {
    return numberString;
  } else {
    return `${numberString}.${parts[1]}`;
  }
}

/**
 * Adds thousand separators to a number
 *
 * @param {number} x Number to format
 * @returns {string} Formatted number with thousand separators
 */
function addThousandSeparator(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// === INITIALIZATION ===

/**
 * Initializes the application when the DOM is loaded
 * Combines all initialization functions
 */
document.addEventListener("DOMContentLoaded", function () {
  // Core initialization
  initApp();

  // Initialize advanced features after calculations are complete
  document.addEventListener("calculationsComplete", initializeAdvancedFeatures);
});

/**
 * Custom event fired when all calculations are complete
 * This signals that UI is ready for advanced features
 */
function fireCalculationsCompleteEvent() {
  const event = new CustomEvent("calculationsComplete", {
    detail: {
      timestamp: new Date(),
      status: "complete",
    },
  });
  document.dispatchEvent(event);
}

// Modify the calculateResults function to fire the event
const originalCalculateResults = calculateResults;
calculateResults = function () {
  // Call the original function
  originalCalculateResults.apply(this, arguments);

  // Fire the event when calculations are complete
  setTimeout(fireCalculationsCompleteEvent, 100);
};

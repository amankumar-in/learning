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

  // Create short-term savings explanation panel
  addShortTermSavingsExplanation(userData, budgetResults);
}

/**
 * Adds an explanation panel for short-term savings
 *
 * @param {Object} userData User profile information
 * @param {Object} budgetResults Budget allocation results
 */
function addShortTermSavingsExplanation(userData, budgetResults) {
  // Only add explanation if short-term savings exist
  if (
    !budgetResults.short_term_savings ||
    budgetResults.short_term_savings <= 0
  )
    return;

  // Calculate the percentage of income
  const shortTermSavingsPercent = (
    (budgetResults.short_term_savings / userData.monthlyIncome) *
    100
  ).toFixed(1);

  // Create panel if it doesn't exist
  let explanationPanel = document.getElementById(
    "short-term-savings-explanation"
  );
  if (!explanationPanel) {
    explanationPanel = document.createElement("div");
    explanationPanel.id = "short-term-savings-explanation";
    explanationPanel.className = "panel mt-6";

    // Find the budget tab and append
    const budgetTab = document.getElementById("budget-tab");
    budgetTab.appendChild(explanationPanel);
  }

  // Create recommended breakdown based on user's income tier and life stage
  const emergencyMonths =
    userData.incomeTier === "HIGH" || userData.incomeTier === "ULTRA_HIGH"
      ? 6
      : 4;
  const monthlyExpenses =
    userData.monthlyExpenses > 0
      ? userData.monthlyExpenses
      : budgetResults.total_essentials;
  const recommendedEmergencyFund = monthlyExpenses * emergencyMonths;

  // Calculate emergency fund contribution (50% of short-term savings until funded)
  const emergencyFundContribution = Math.min(
    budgetResults.short_term_savings * 0.5,
    recommendedEmergencyFund / 24
  ); // Fund within 2 years

  // Calculate other allocations
  const majorExpensesAllocation = budgetResults.short_term_savings * 0.3;
  const lifeGoalsAllocation = budgetResults.short_term_savings * 0.2;

  // Build the panel HTML
  explanationPanel.innerHTML = `
    <h3 class="panel-title">Understanding Your Short-Term Savings</h3>
    
    <div class="bg-blue-50 p-4 rounded-lg mb-4">
      <p class="mb-3">Your budget allocates <strong>${formatCurrency(
        budgetResults.short_term_savings
      )}</strong> 
        (${shortTermSavingsPercent}% of income) to short-term savings each month. These savings are separate from 
        your retirement funds and serve different purposes.</p>
        
      <h4 class="font-medium mb-2">What Are Short-Term Savings For?</h4>
      <ul class="list-disc pl-5 mb-4 space-y-1">
        <li><strong>Emergency Fund:</strong> For unexpected expenses like medical emergencies or sudden income loss</li>
        <li><strong>Major Planned Expenses:</strong> For infrequent large costs like home repairs, vehicle purchases</li>
        <li><strong>Life Goals:</strong> For medium-term objectives like education, vacations, or special events</li>
        <li><strong>Opportunity Fund:</strong> For unexpected investment or business opportunities</li>
      </ul>
    </div>
    
    <h4 class="font-medium mb-3">Recommended Monthly Allocation</h4>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div class="bg-white p-3 rounded-lg border border-gray-200">
        <div class="flex justify-between mb-1">
          <div class="text-sm text-indigo-700 font-medium">Emergency Fund</div>
          <div class="text-sm font-medium">50%</div>
        </div>
        <div class="font-bold mb-1">${formatCurrency(
          emergencyFundContribution
        )}/month</div>
        <div class="text-xs text-gray-600 mb-2">Goal: ${formatCurrency(
          recommendedEmergencyFund
        )} (${emergencyMonths} months expenses)</div>
        <div class="h-2 w-full bg-gray-200 rounded">
          <div class="bg-indigo-600 h-2 rounded" style="width: 50%"></div>
        </div>
        <div class="mt-1 text-xs text-gray-500">Allocation: 50% of short-term savings</div>
      </div>
      
      <div class="bg-white p-3 rounded-lg border border-gray-200">
        <div class="flex justify-between mb-1">
          <div class="text-sm text-green-700 font-medium">Major Planned Expenses</div>
          <div class="text-sm font-medium">30%</div>
        </div>
        <div class="font-bold mb-1">${formatCurrency(
          majorExpensesAllocation
        )}/month</div>
        <div class="text-xs text-gray-600 mb-2">For vehicle, home repairs, electronics</div>
        <div class="h-2 w-full bg-gray-200 rounded">
          <div class="bg-green-600 h-2 rounded" style="width: 30%"></div>
        </div>
        <div class="mt-1 text-xs text-gray-500">Allocation: 30% of short-term savings</div>
      </div>
      
      <div class="bg-white p-3 rounded-lg border border-gray-200">
    <div class="flex justify-between mb-1">
      <div class="text-sm font-medium" style="color: #f59e0b;">Life Goals</div>
      <div class="text-sm font-medium">20%</div>
    </div>
    <div class="font-bold mb-1">${formatCurrency(
      lifeGoalsAllocation
    )}/month</div>
    <div class="text-xs text-gray-600 mb-2">For education, travel, special events</div>
    
    <!-- Completely simplified progress bar with inline styles -->
    <div style="width: 100%; height: 8px; background-color: #e5e7eb; border-radius: 4px; position: relative;">
      <div style="position: absolute; top: 0; left: 0; width: 20%; height: 8px; background-color: #f59e0b; border-radius: 4px;"></div>
    </div>
    
    <div class="mt-1 text-xs text-gray-500">Allocation: 20% of short-term savings</div>
  </div>
    </div>
    
    <div class="text-sm bg-gray-50 p-3 rounded-lg">
      <p class="font-medium mb-1">Pro Tips for Short-Term Savings:</p>
      <ul class="list-disc pl-5 space-y-1">
        <li>Keep your emergency fund in a separate high-yield savings account for easy access</li>
        <li>For planned expenses 1-3 years away, consider short-term fixed deposits or liquid debt funds</li>
        <li>Create separate sub-accounts for different goals to avoid dipping into your emergency fund</li>
        <li>Review and adjust your short-term savings allocations every 6 months</li>
      </ul>
    </div>
  `;
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
    
    <!-- Stacked progress bar with inline styles for reliability -->
    <div style="width: 100%; height: 10px; background-color: #f3f4f6; border-radius: 9999px; position: relative; overflow: hidden;">
      <!-- Essentials segment -->
      <div style="position: absolute; top: 0; left: 0; height: 10px; background-color: #3b82f6; width: ${essentialPercent}%;"></div>
      
      <!-- Savings segment -->
      <div style="position: absolute; top: 0; left: ${essentialPercent}%; height: 10px; background-color: #10b981; width: ${savingsPercent}%;"></div>
      
      <!-- Discretionary segment -->
      <div style="position: absolute; top: 0; left: ${
        Number(essentialPercent) + Number(savingsPercent)
      }%; height: 10px; background-color: #f59e0b; width: ${discretionaryPercent}%;"></div>
    </div>
    
    <div class="flex justify-between text-sm mt-2">
      <div>
        <span class="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
        <span>${essentialPercent}% Essentials</span>
      </div>
      <div>
        <span class="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
        <span>${savingsPercent}% Savings</span>
      </div>
      <div>
        <span class="inline-block w-3 h-3 bg-amber-500 rounded-full mr-1"></span>
        <span>${discretionaryPercent}% Discretionary</span>
      </div>
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
    debt_payment: "Debt Payment", // latest change
    personal: "Personal Care",
    household: "Household",
    retirement_savings: "Retirement Savings",
    short_term_savings: "Short-term Savings",
    discretionary: "Discretionary",
  };

  // Add rows for each category
  let totalShown = 0;

  for (const [category, displayName] of Object.entries(categoryDisplayNames)) {
    if (budgetResults[category] !== undefined && budgetResults[category] > 0) {
      const amount = budgetResults[category];
      const percentage = ((amount / userData.monthlyIncome) * 100).toFixed(1);

      // For retirement savings, add special indicator when it differs from ideal
      let specialClass = "";
      let infoSpan = "";

      if (
        category === "retirement_savings" &&
        window.calculationResults &&
        window.calculationResults.retirementResults
      ) {
        const requiredAmount =
          window.calculationResults.retirementResults.required_monthly_savings;

        if (amount < requiredAmount) {
          // Below ideal
          specialClass = "text-yellow-600";
          infoSpan = `<span class="text-xs text-yellow-600"> (${(
            (amount / requiredAmount) *
            100
          ).toFixed(0)}% of ideal)</span>`;
        } else if (amount > requiredAmount) {
          // Above ideal (savings surplus)
          specialClass = "text-green-600";
          infoSpan = `<span class="text-xs text-green-600"> (Exceeds ideal)</span>`;
        }
      }

      const row = document.createElement("tr");
      row.innerHTML = `
          <td>${displayName}${infoSpan}</td>
          <td class="text-right ${specialClass}">${formatCurrency(amount)}</td>
          <td class="text-right ${specialClass}">${percentage}%</td>
        `;
      table.appendChild(row);
      totalShown += amount;
    }
  }

  // Add total row
  const totalRow = document.createElement("tr");
  totalRow.classList.add("font-bold", "border-t-2", "border-gray-300");
  totalRow.innerHTML = `
      <td>Total</td>
      <td class="text-right">${formatCurrency(totalShown)}</td>
      <td class="text-right">${(
        (totalShown / userData.monthlyIncome) *
        100
      ).toFixed(1)}%</td>
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

    // Short-term savings subcategories
    emergency_fund: "Emergency Fund",
    major_expenses: "Major Planned Expenses",
    life_goals: "Life Goals & Opportunities",

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
    "#4F46E5", // Indigo - Essentials
    "#10B981", // Emerald - Essentials
    "#F59E0B", // Amber - Essentials
    "#EF4444", // Red - Essentials
    "#8B5CF6", // Purple - Essentials
    "#EC4899", // Pink - Essentials
    "#06B6D4", // Cyan - Essentials
    "#84CC16", // Lime - Essentials
    "#3B82F6", // Blue - Retirement (highlighted)
    "#6366F1", // Indigo - Short-term
    "#F97316", // Orange - Discretionary
  ];

  let i = 0;
  for (const [category, label] of Object.entries(categories)) {
    if (budgetResults[category] !== undefined && budgetResults[category] > 0) {
      data.push(budgetResults[category]);

      // Add special indicator for retirement when it differs from ideal
      if (
        category === "retirement_savings" &&
        window.calculationResults &&
        window.calculationResults.retirementResults
      ) {
        const requiredAmount =
          window.calculationResults.retirementResults.required_monthly_savings;
        const currentAmount = budgetResults[category];

        if (currentAmount < requiredAmount) {
          // Below ideal
          labels.push(
            `${label} (${((currentAmount / requiredAmount) * 100).toFixed(
              0
            )}% of ideal)`
          );
        } else if (currentAmount > requiredAmount) {
          // Above ideal
          labels.push(`${label} (Exceeds ideal)`);
        } else {
          labels.push(label);
        }
      } else {
        labels.push(label);
      }
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

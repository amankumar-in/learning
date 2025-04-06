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

  // In the updateResultsUI function, add this after updating the budget tab:
  addPriorityConsistencyScore(userData, budgetResults);

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

  // Initialize and update tradeoff visualizer
  if (typeof addTradeoffVisualizer === "function") {
    addTradeoffVisualizer();
  }
}

/**
 * Adds priority consistency score to the budget tab
 * @param {Object} userData - User profile information
 * @param {Object} budgetResults - Budget allocation results
 */
function addPriorityConsistencyScore(userData, budgetResults) {
  // Create or get container
  let consistencySection = document.getElementById(
    "priority-consistency-score"
  );
  if (!consistencySection) {
    consistencySection = document.createElement("div");
    consistencySection.id = "priority-consistency-score";
    consistencySection.className = "panel mt-6";

    // Find placement in budget tab
    const budgetTab = document.getElementById("budget-tab");
    const guidancePanel = document.getElementById("budget-guidance");
    if (guidancePanel) {
      budgetTab.insertBefore(consistencySection, guidancePanel);
    } else {
      budgetTab.appendChild(consistencySection);
    }
  }

  // Calculate baseline allocations for a balanced approach
  const balancedRetirement = userData.monthlyIncome * 0.15; // Example baseline
  const balancedShortTerm = userData.monthlyIncome * 0.1; // Example baseline
  const balancedDiscretionary = userData.monthlyIncome * 0.15; // Example baseline

  // Calculate actual allocations
  const actualAllocations = {
    baseline: {
      retirement: balancedRetirement,
      shortterm: balancedShortTerm,
      discretionary: balancedDiscretionary,
    },
    actual: {
      retirement: budgetResults.retirement_savings,
      shortterm: budgetResults.short_term_savings,
      discretionary: budgetResults.discretionary,
    },
  };

  // Calculate consistency score
  const consistency = calculateConsistencyScore(
    actualAllocations,
    userData.financialPriority,
    userData
  );

  // Check if minimum savings requirements are constraining choices
  const minSavingsRate = getAdjustedMinimumSavingsRate(userData);
  const actualSavingsRate =
    budgetResults.retirement_savings / userData.monthlyIncome;
  const isConstrained = Math.abs(actualSavingsRate - minSavingsRate) < 0.01;

  // Get constraint explanation
  const constraintExplanation = getConstraintRecommendation(
    consistency,
    userData.financialPriority,
    userData.incomeTier
  );

  // Update UI with consistency score
  consistencySection.innerHTML = `
    <h3 class="panel-title">Priority Alignment</h3>
    <div class="bg-gray-50 p-4 rounded-lg">
      <div class="flex justify-between items-center mb-3">
        <div>
          <span class="text-sm text-gray-600">How well your budget aligns with your selected priority:</span>
          <div class="font-medium">${
            PRIORITY_TEMPLATES[userData.financialPriority].title
          }</div>
        </div>
        <div class="text-2xl font-bold ${getScoreColorClass(
          consistency.score
        )}">
          ${Math.round(consistency.score)}%
          ${
            isConstrained
              ? `<span class="text-xs font-normal bg-yellow-100 text-yellow-800 px-2 py-1 rounded ml-2">System Constrained</span>`
              : ""
          }
        </div>
      </div>
      
      <div class="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div class="h-2.5 rounded-full ${getScoreColorClass(
          consistency.score
        )}" 
             style="width: ${consistency.score}%"></div>
      </div>
      
      <div class="grid grid-cols-3 gap-3 mb-3">
        <div class="text-center">
          <div class="text-sm font-medium">Retirement</div>
          <div class="text-xs ${getScoreColorClass(
            consistency.retirement.match
          )}">
            ${Math.round(consistency.retirement.match)}% match
            ${
              consistency.retirement.constrained
                ? '<span class="block mt-1 bg-yellow-100 text-yellow-800 rounded-full text-xs px-1">Min Required</span>'
                : ""
            }
          </div>
        </div>
        <div class="text-center">
          <div class="text-sm font-medium">Short-term</div>
          <div class="text-xs ${getScoreColorClass(
            consistency.shortterm.match
          )}">
            ${Math.round(consistency.shortterm.match)}% match
          </div>
        </div>
        <div class="text-center">
          <div class="text-sm font-medium">Discretionary</div>
          <div class="text-xs ${getScoreColorClass(
            consistency.discretionary.match
          )}">
            ${Math.round(consistency.discretionary.match)}% match
          </div>
        </div>
      </div>
      
      <div class="text-sm text-gray-600 mb-3">
        <p>${getConsistencyMessage(
          consistency.score,
          userData.financialPriority
        )}</p>
      </div>
      
      <div class="text-xs p-2 rounded ${
        isConstrained
          ? "bg-yellow-50 border border-yellow-200"
          : "bg-blue-50 border border-blue-200"
      }">
        <p class="font-medium">${
          isConstrained ? "System Constraint Note:" : "Budget Note:"
        }</p>
        <p>${constraintExplanation}</p>
      </div>
    </div>
  `;
}

// Helper for score colors - enhanced with more granular ratings
function getScoreColorClass(score) {
  if (score >= 85) return "text-green-600 bg-green-500";
  if (score >= 70) return "text-green-600 bg-green-400";
  if (score >= 55) return "text-yellow-600 bg-yellow-500";
  if (score >= 40) return "text-yellow-600 bg-yellow-400";
  return "text-red-600 bg-red-500";
}

// Enhanced helper for consistency message with more human guidance
function getConsistencyMessage(score, priority) {
  if (score >= 85) {
    return `Your budget strongly reflects your ${priority.replace(
      "_",
      "-"
    )} priority. Your allocations closely match our recommendations for this approach.`;
  } else if (score >= 70) {
    return `Your budget generally aligns with your ${priority.replace(
      "_",
      "-"
    )} priority. A few minor adjustments would bring it into even better alignment.`;
  } else if (score >= 55) {
    return `Your budget somewhat aligns with your ${priority.replace(
      "_",
      "-"
    )} priority, but there's room for improvement to better reflect your stated preferences.`;
  } else if (score >= 40) {
    return `Your budget is only partially aligned with your ${priority.replace(
      "_",
      "-"
    )} priority. Consider the suggested adjustments to better match your stated preferences.`;
  } else {
    return `Your current allocations don't clearly reflect your stated ${priority.replace(
      "_",
      "-"
    )} priority. This may be due to system constraints or could be improved with budget adjustments.`;
  }
}
/**
 * Calculates the future value of a monthly savings amount
 *
 * @param {number} monthlySavings Monthly savings amount
 * @param {number} annualRate Annual interest rate as decimal (e.g., 0.08 for 8%)
 * @param {number} years Number of years
 * @returns {number} Future value
 */
function calculateFutureSavedAmount(monthlySavings, annualRate, years) {
  const monthlyRate = annualRate / 12;
  const months = years * 12;

  // Formula for future value of recurring deposits
  return (
    monthlySavings *
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
    (1 + monthlyRate)
  );
}

/**
 * Updates the summary metrics at the top of the dashboard
 *
 * @param {Object} userData User profile and financial information
 * @param {Object} budgetResults Budget allocation results
 * @param {Object} retirementResults Retirement planning results
 */
// In updateSummaryMetrics function in ui.js
function updateSummaryMetrics(userData, budgetResults, retirementResults) {
  // Update monthly income value (renamed from "budget")
  document.getElementById("monthly-budget-value").textContent = formatCurrency(
    userData.monthlyIncome
  );

  // New label for the first card to clarify it's income
  const budgetLabel = document.querySelector(
    ".dashboard-summary .metric-card:nth-child(1) h3"
  );
  if (budgetLabel) budgetLabel.textContent = "Monthly Income";

  // Update retirement corpus value
  document.getElementById("retirement-corpus-value").innerHTML = `
    <div>${formatCurrency(retirementResults.total_corpus_required)}</div>
    <div class="text-sm font-normal ${
      retirementResults.additional_corpus_needed > 0
        ? "text-yellow-600"
        : "text-green-600"
    }">
      Projected: ${formatCurrency(
        retirementResults.future_value_of_current_savings +
          calculateFutureSavedAmount(
            retirementResults.recommended_monthly_savings,
            retirementResults.pre_retirement_return,
            userData.retirementAge - userData.age
          )
      )}
    </div>
  `;

  // Update retirement age display
  document.getElementById("retirement-age-display").textContent =
    userData.retirementAge;

  // Update monthly savings card with clearer information
  document.getElementById("monthly-savings-value").innerHTML = `
    <div>${formatCurrency(retirementResults.recommended_monthly_savings)}</div>
  `;

  // Update savings percentage explanation
  const savingsPercent = (
    (retirementResults.recommended_monthly_savings / userData.monthlyIncome) *
    100
  ).toFixed(1);

  document.getElementById("savings-percent").innerHTML = `
    <div>${savingsPercent}% of income</div>
  `;

  // Add special indicator for shortfall or surplus
  if (
    retirementResults.required_monthly_savings >
    retirementResults.recommended_monthly_savings
  ) {
    // There's a shortfall
    const shortfall =
      retirementResults.required_monthly_savings -
      retirementResults.recommended_monthly_savings;
    const shortfallPercent = (
      (shortfall / userData.monthlyIncome) *
      100
    ).toFixed(1);

    document.getElementById("savings-percent").innerHTML += `
      <div class="text-xs text-yellow-600">
        Need additional ${shortfallPercent}% for full retirement goal
      </div>
    `;
  } else if (
    retirementResults.required_monthly_savings <
    retirementResults.recommended_monthly_savings
  ) {
    // There's extra capacity
    document.getElementById("savings-percent").innerHTML += `
      <div class="text-xs text-green-600">
        Mathematically required: ${(
          (retirementResults.required_monthly_savings /
            userData.monthlyIncome) *
          100
        ).toFixed(1)}%
      </div>
    `;
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

// Add this function to ui.js
function addRetirementExplanationSection() {
  const retirementTab = document.getElementById("retirement-tab");
  if (!retirementTab) return;

  // Create explanation section if it doesn't exist
  let explanationSection = document.getElementById("retirement-explanation");
  if (!explanationSection) {
    explanationSection = document.createElement("div");
    explanationSection.id = "retirement-explanation";
    explanationSection.className = "panel mt-6";

    explanationSection.innerHTML = `
      <h3 class="panel-title">Understanding Your Retirement Plan</h3>
      <div class="p-4 bg-blue-50 rounded-lg mb-4">
        <p class="font-medium mb-2">Key Terms Explained:</p>
        <ul class="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Retirement Corpus:</strong> The total savings you need for retirement. Calculated using your future expenses and safe withdrawal rate.</li>
          <li><strong>Safe Withdrawal Rate:</strong> The percentage you can withdraw annually from your retirement corpus to make it last through retirement (typically 3-4%).</li>
          <li><strong>Capped Monthly Savings:</strong> The maximum practical amount you can save monthly, limited to 50% of your income.</li>
          <li><strong>Projected Corpus:</strong> What your retirement savings will grow to based on your current savings and recommended monthly contributions.</li>
          <li><strong>Corpus Shortfall:</strong> The gap between your target corpus and projected corpus.</li>
        </ul>
      </div>
      <p class="text-sm mb-3">Your retirement plan is calculated using industry-standard methods based on your income, expenses, age, and retirement goals.</p>
      <p class="text-sm">Regular monitoring and adjustments are key to staying on track. Consider reviewing your plan annually or when significant life changes occur.</p>
    `;

    // Insert after retirement details table
    const detailsTable = retirementTab.querySelector(".retirement-details");
    if (detailsTable) {
      detailsTable.parentNode.insertAdjacentElement(
        "afterend",
        explanationSection
      );
    } else {
      retirementTab.appendChild(explanationSection);
    }
  }
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
          <strong>Affordability Alert:</strong> Your ideal retirement savings rate exceeds 
          your available income after essential expenses. We've adjusted your retirement 
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
  <div class="font-bold mb-1">${formatCurrency(lifeGoalsAllocation)}/month</div>
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

  // Add visual retirement comparison
  addRetirementComparisonVisual(userData, retirementResults);

  // NEW: Add scenario explorer
  addRetirementScenarioExplorer(
    userData,
    retirementResults,
    window.calculationResults.budgetResults
  );

  // Add retirement readiness metrics
  updateRetirementReadiness(retirementResults);
  addRetirementExplanationSection();

  // Add guidance panel
  addRetirementGuidancePanel(userData, retirementResults);
}

/**
 * Adds an interactive scenario exploration panel to the retirement tab
 *
 * @param {Object} userData User profile information
 * @param {Object} retirementResults Retirement planning results
 * @param {Object} budgetResults Budget allocation results
 */
function addRetirementScenarioExplorer(
  userData,
  retirementResults,
  budgetResults
) {
  // Only add if there's a retirement shortfall
  const hasShortfall =
    retirementResults.required_monthly_savings >
    retirementResults.recommended_monthly_savings;
  if (!hasShortfall && retirementResults.recommended_monthly_savings === 0)
    return;

  // Create panel if it doesn't exist
  let scenarioPanel = document.getElementById("retirement-scenario-explorer");
  if (!scenarioPanel) {
    scenarioPanel = document.createElement("div");
    scenarioPanel.id = "retirement-scenario-explorer";
    scenarioPanel.className = "panel mt-6";

    // Find the retirement tab and append
    const retirementTab = document.getElementById("retirement-tab");
    retirementTab.appendChild(scenarioPanel);
  }

  // Calculate key values
  const shortfall = Math.max(
    0,
    retirementResults.required_monthly_savings -
      retirementResults.recommended_monthly_savings
  );
  const currentRetirementSavings =
    retirementResults.recommended_monthly_savings;
  const currentDiscretionary = budgetResults.discretionary;
  const retirementPercentage = (
    (currentRetirementSavings / retirementResults.required_monthly_savings) *
    100
  ).toFixed(0);

  // Calculate the minimum discretionary reduction needed to fully fund retirement
  const minReductionNeeded = Math.min(shortfall, currentDiscretionary);
  const minReductionPercent = (
    (minReductionNeeded / currentDiscretionary) *
    100
  ).toFixed(0);

  // Calculate future impact
  const yearsToRetirement = userData.retirementAge - userData.age;
  const monthlyShortfall =
    retirementResults.required_monthly_savings -
    retirementResults.recommended_monthly_savings;
  const annualShortfall = monthlyShortfall * 12;

  // Calculate corpus impact
  const shortfallImpact = calculateFutureSavedAmount(
    monthlyShortfall,
    retirementResults.pre_retirement_return,
    yearsToRetirement
  );

  // Current slider value
  let currentSliderValue = 0;

  // Build HTML content
  scenarioPanel.innerHTML = `
    <h3 class="panel-title">Explore Budget Scenarios</h3>
    
    <div class="bg-blue-50 p-4 rounded-lg mb-4">
      <p class="mb-2">Your current budget funds <strong>${retirementPercentage}%</strong> of your ideal retirement goal. 
      Explore how small adjustments to your discretionary spending could impact your retirement readiness.</p>
      
      ${
        hasShortfall
          ? `
      <p class="text-sm text-indigo-800">
        <strong>Key insight:</strong> Shifting just ${minReductionPercent}% of your current discretionary budget 
        (${formatCurrency(
          minReductionNeeded
        )}/month) to retirement would fully fund your retirement goal.
      </p>
      `
          : ""
      }
    </div>
    
    <div class="mb-6">
      <h4 class="font-medium mb-3">Adjust Your Discretionary vs. Retirement Balance</h4>
      
      <div class="mb-4">
        <label for="scenario-slider" class="block text-sm font-medium text-gray-700 mb-1">
          Shift from Discretionary to Retirement:
          <span id="slider-value">0%</span>
        </label>
        <input type="range" id="scenario-slider" min="0" max="${Math.min(
          100,
          Math.floor(
            (currentDiscretionary /
              retirementResults.required_monthly_savings) *
              100
          )
        )}" 
               value="0" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <div class="text-sm text-gray-600 mb-1">Current Monthly Allocation</div>
          <div class="flex items-center mb-2">
            <div class="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
            <div class="text-sm">Discretionary: <span class="font-medium" id="current-discretionary">${formatCurrency(
              currentDiscretionary
            )}</span></div>
          </div>
          <div class="flex items-center">
            <div class="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <div class="text-sm">Retirement: <span class="font-medium" id="current-retirement">${formatCurrency(
              currentRetirementSavings
            )}</span></div>
          </div>
        </div>
        
        <div>
          <div class="text-sm text-gray-600 mb-1">Adjusted Monthly Allocation</div>
          <div class="flex items-center mb-2">
            <div class="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
            <div class="text-sm">Discretionary: <span class="font-medium" id="adjusted-discretionary">${formatCurrency(
              currentDiscretionary
            )}</span></div>
          </div>
          <div class="flex items-center">
            <div class="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <div class="text-sm">Retirement: <span class="font-medium" id="adjusted-retirement">${formatCurrency(
              currentRetirementSavings
            )}</span></div>
          </div>
        </div>
      </div>
      
      <div class="p-3 rounded-lg border border-gray-200 bg-gray-50 mb-4">
        <div class="text-sm font-medium mb-2">Long-term Impact of This Adjustment:</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div class="text-sm text-gray-600">Retirement Funding</div>
            <div class="text-lg font-bold" id="retirement-funding">${retirementPercentage}%</div>
            <div class="h-2 w-full bg-gray-200 rounded mt-1">
              <div class="bg-blue-600 h-2 rounded" id="funding-progress" style="width: ${retirementPercentage}%"></div>
            </div>
          </div>
          <div>
            <div class="text-sm text-gray-600">Additional Retirement Savings</div>
            <div class="text-lg font-bold text-green-700" id="additional-savings">+${formatCurrency(
              0
            )}</div>
            <div class="text-xs text-gray-500" id="corpus-impact">After ${yearsToRetirement} years: +${formatCurrency(
    0
  )}</div>
          </div>
        </div>
      </div>
      
      <div class="flex justify-center">
        <button id="optimize-retirement-btn" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
          Optimize for Full Retirement
        </button>
      </div>
    </div>
  `;

  // Add event listeners
  setTimeout(() => {
    const slider = document.getElementById("scenario-slider");
    const sliderValue = document.getElementById("slider-value");
    const currentDiscretionaryElem = document.getElementById(
      "current-discretionary"
    );
    const currentRetirementElem = document.getElementById("current-retirement");
    const adjustedDiscretionaryElem = document.getElementById(
      "adjusted-discretionary"
    );
    const adjustedRetirementElem = document.getElementById(
      "adjusted-retirement"
    );
    const retirementFundingElem = document.getElementById("retirement-funding");
    const fundingProgressElem = document.getElementById("funding-progress");
    const additionalSavingsElem = document.getElementById("additional-savings");
    const corpusImpactElem = document.getElementById("corpus-impact");
    const optimizeBtn = document.getElementById("optimize-retirement-btn");

    if (slider) {
      slider.addEventListener("input", function (e) {
        currentSliderValue = parseInt(e.target.value);
        updateScenarioUI();
      });
    }

    if (optimizeBtn) {
      optimizeBtn.addEventListener("click", function () {
        // Set slider to minimum needed for full funding
        if (slider) {
          slider.value = minReductionPercent;
          currentSliderValue = parseInt(minReductionPercent);
          updateScenarioUI();
        }
      });
    }

    function updateScenarioUI() {
      // Update slider value display
      if (sliderValue) sliderValue.textContent = `${currentSliderValue}%`;

      // Calculate new allocations
      const reductionAmount = (currentDiscretionary * currentSliderValue) / 100;
      const newDiscretionary = currentDiscretionary - reductionAmount;
      const newRetirement = currentRetirementSavings + reductionAmount;

      // Calculate new retirement funding percentage
      const newFundingPercent = Math.min(
        100,
        Math.round(
          (newRetirement / retirementResults.required_monthly_savings) * 100
        )
      );

      // Update UI elements
      if (adjustedDiscretionaryElem)
        adjustedDiscretionaryElem.textContent =
          formatCurrency(newDiscretionary);
      if (adjustedRetirementElem)
        adjustedRetirementElem.textContent = formatCurrency(newRetirement);
      if (retirementFundingElem)
        retirementFundingElem.textContent = `${newFundingPercent}%`;
      if (fundingProgressElem)
        fundingProgressElem.style.width = `${newFundingPercent}%`;

      // Calculate impact on savings
      const monthlySavingsIncrease = reductionAmount;
      const annualSavingsIncrease = monthlySavingsIncrease * 12;

      // Calculate corpus impact
      const corpusIncrease = calculateFutureSavedAmount(
        monthlySavingsIncrease,
        retirementResults.pre_retirement_return,
        yearsToRetirement
      );

      if (additionalSavingsElem)
        additionalSavingsElem.textContent = `+${formatCurrency(
          monthlySavingsIncrease
        )}`;
      if (corpusImpactElem)
        corpusImpactElem.textContent = `After ${yearsToRetirement} years: +${formatCurrency(
          corpusIncrease
        )}`;
    }
  }, 100);
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

  // Add details rows with improved labels and explanations
  const details = [
    {
      label: "Current Monthly Expenses",
      value: formatCurrency(retirementResults.current_monthly_expenses),
    },
    {
      label: "Future Monthly Expenses at Retirement",
      value: formatCurrency(retirementResults.future_monthly_expenses),
      tooltip:
        "Your current expenses adjusted for inflation over the years until retirement",
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
      tooltip:
        "The percentage of your retirement corpus you can withdraw annually to ensure it lasts through retirement",
    },
    {
      label: "Current Savings & Investments",
      value: formatCurrency(retirementResults.current_savings),
    },
    {
      label: "Future Value of Current Savings",
      value: formatCurrency(retirementResults.future_value_of_current_savings),
      tooltip:
        "How much your current savings will grow to by retirement, assuming consistent returns",
    },
    {
      label: "Mathematically Required Monthly Savings",
      value: formatCurrency(retirementResults.required_monthly_savings),
      tooltip:
        "The exact amount needed each month to reach your retirement goal, if mathematically possible",
      class: "font-semibold",
    },
    {
      label: "Available in Budget for Retirement",
      value: formatCurrency(retirementResults.recommended_monthly_savings),
      tooltip:
        "The amount your current budget can allocate to retirement savings",
      class: "font-semibold",
    },
  ];

  // Add new row for enhanced retirement options
  if (
    retirementResults.required_monthly_savings <
    retirementResults.recommended_monthly_savings
  ) {
    details.push({
      label: "Additional Saving Opportunity",
      value: formatCurrency(
        retirementResults.recommended_monthly_savings -
          retirementResults.required_monthly_savings
      ),
      tooltip:
        "You can save more than the required minimum. This extra amount could be used for enhanced retirement, early retirement, or other financial goals.",
      class: "text-green-600 font-semibold",
    });
  }

  // Add shortfall information if necessary
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

    details.push({
      label: "Monthly Savings Shortfall",
      value: formatCurrency(shortfall),
      class: "text-red-600",
      tooltip:
        "The gap between what you need to save and what's currently possible in your budget",
    });

    details.push({
      label: "Projected Corpus Shortfall",
      value: formatCurrency(corpusShortfall),
      class: "text-red-600",
      tooltip:
        "The amount your retirement corpus will be short if you save at your current budget amount",
    });
  }

  // Render all rows
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
  // Initialize the comparison section if it doesn't exist yet
  initializeComparisonSection();
}
// 2. Add a function to initialize the comparison section

function initializeComparisonSection() {
  // Check if comparison section exists
  let comparisonSection = document.getElementById(
    "scenario-comparison-section"
  );

  if (!comparisonSection) {
    const retirementTab = document.getElementById("retirement-tab");

    // Create comparison section
    comparisonSection = document.createElement("div");
    comparisonSection.id = "scenario-comparison-section";
    comparisonSection.className = "panel mt-6 hidden"; // Hidden initially

    comparisonSection.innerHTML = `
      <div class="flex justify-between items-center mb-4">
        <h3 class="panel-title mb-0">Scenario Comparison</h3>
        <button id="clear-comparison-btn" class="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded">
          Clear All
        </button>
      </div>
      
      <div id="comparison-table" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-100">
              <th class="text-left py-2 px-3">Scenario</th>
              <th class="text-right py-2 px-3">Retirement Age</th>
              <th class="text-right py-2 px-3">Required Corpus</th>
              <th class="text-right py-2 px-3">Monthly Savings</th>
              <th class="text-right py-2 px-3">Feasibility</th>
              <th class="text-center py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody id="comparison-tbody">
            <!-- Scenarios will be added here -->
          </tbody>
        </table>
      </div>
      
      <div class="mt-4">
        <canvas id="comparison-chart" height="250"></canvas>
      </div>
    `;

    retirementTab.appendChild(comparisonSection);

    // Add event listener to clear button
    document
      .getElementById("clear-comparison-btn")
      .addEventListener("click", clearScenarioComparison);
  }
}
// 3. Add function to add a scenario to comparison

function addScenarioToComparison(scenarioId) {
  // Get scenario data
  const retirementResults = window.calculationResults.retirementResults;
  const scenario = retirementResults.scenarios[scenarioId];

  if (!scenario) return;

  // Show comparison section
  const comparisonSection = document.getElementById(
    "scenario-comparison-section"
  );
  comparisonSection.classList.remove("hidden");

  // Check if scenario is already in comparison
  const existingRow = document.querySelector(
    `tr[data-scenario="${scenarioId}"]`
  );
  if (existingRow) {
    // Highlight existing row temporarily
    existingRow.classList.add("bg-yellow-100");
    setTimeout(() => {
      existingRow.classList.remove("bg-yellow-100");
    }, 1500);
    return;
  }

  // Add to comparison table
  const tbody = document.getElementById("comparison-tbody");
  const row = document.createElement("tr");
  row.setAttribute("data-scenario", scenarioId);
  row.className = "border-b";

  // Determine feasibility color
  let feasibilityColor = "text-red-600";
  if (scenario.feasibility >= 8) feasibilityColor = "text-green-600";
  else if (scenario.feasibility >= 5) feasibilityColor = "text-yellow-600";
  else if (scenario.feasibility >= 3) feasibilityColor = "text-orange-600";

  row.innerHTML = `
    <td class="py-2 px-3">${scenario.name}</td>
    <td class="py-2 px-3 text-right">${scenario.retirement_age}</td>
    <td class="py-2 px-3 text-right">${formatCurrency(scenario.corpus)}</td>
    <td class="py-2 px-3 text-right">${formatCurrency(
      scenario.monthly_savings
    )}</td>
    <td class="py-2 px-3 text-right ${feasibilityColor}">${
    scenario.feasibility
  }/10</td>
    <td class="py-2 px-3 text-center">
      <button class="remove-from-comparison text-xs px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200">
        Remove
      </button>
    </td>
  `;

  // Add event listener to remove button
  row
    .querySelector(".remove-from-comparison")
    .addEventListener("click", function () {
      row.remove();
      updateComparisonChart();

      // Hide comparison section if empty
      if (tbody.children.length === 0) {
        comparisonSection.classList.add("hidden");
      }
    });

  tbody.appendChild(row);

  // Update comparison chart
  updateComparisonChart();
}

// 4. Add function to clear comparison

function clearScenarioComparison() {
  // Clear table
  document.getElementById("comparison-tbody").innerHTML = "";

  // Hide section
  document
    .getElementById("scenario-comparison-section")
    .classList.add("hidden");

  // Clear chart
  if (window.comparisonChart) {
    window.comparisonChart.destroy();
    window.comparisonChart = null;
  }
}

// 5. Add function to update comparison chart

function updateComparisonChart() {
  const tbody = document.getElementById("comparison-tbody");
  const rows = tbody.querySelectorAll("tr");

  if (rows.length === 0) return;

  // Prepare data for chart
  const labels = [];
  const corpusData = [];
  const savingsData = [];

  rows.forEach((row) => {
    const scenarioId = row.getAttribute("data-scenario");
    const scenario =
      window.calculationResults.retirementResults.scenarios[scenarioId];

    if (scenario) {
      labels.push(scenario.name);
      corpusData.push(scenario.corpus);
      savingsData.push(scenario.monthly_savings * 200); // Scale for visibility
    }
  });

  // Create chart
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
          label: "Required Corpus",
          data: corpusData,
          backgroundColor: "rgba(79, 70, 229, 0.7)",
          borderColor: "rgba(79, 70, 229, 1)",
          borderWidth: 1,
          yAxisID: "y",
        },
        {
          label: "Monthly Savings (×200)",
          data: savingsData,
          backgroundColor: "rgba(16, 185, 129, 0.7)",
          borderColor: "rgba(16, 185, 129, 1)",
          borderWidth: 1,
          yAxisID: "y",
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Amount (₹)",
          },
          ticks: {
            callback: function (value) {
              return formatCurrency(value);
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

              if (label === "Monthly Savings (×200)") {
                return "Monthly Savings: " + formatCurrency(value / 200);
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

  // Calculate more accurate readiness metrics based on recommended savings
  const expenseCoverageRatio = Math.min(
    1,
    retirementResults.recommended_monthly_savings /
      retirementResults.required_monthly_savings
  );

  // Calculate readiness score based primarily on expense coverage
  let readinessScore;
  if (expenseCoverageRatio >= 0.98) {
    readinessScore = 95 + (expenseCoverageRatio - 0.98) * 250; // Max 100
    readinessScore = Math.min(100, readinessScore);
  } else if (expenseCoverageRatio >= 0.9) {
    readinessScore = 80 + (expenseCoverageRatio - 0.9) * 187.5;
  } else if (expenseCoverageRatio >= 0.75) {
    readinessScore = 60 + (expenseCoverageRatio - 0.75) * 133.3;
  } else if (expenseCoverageRatio >= 0.5) {
    readinessScore = 40 + (expenseCoverageRatio - 0.5) * 80;
  } else {
    readinessScore = expenseCoverageRatio * 80;
  }

  // Round to nearest integer
  readinessScore = Math.round(readinessScore);

  // Determine status based on score
  let status;
  if (readinessScore >= 90) {
    status = "Excellent";
  } else if (readinessScore >= 75) {
    status = "Good";
  } else if (readinessScore >= 50) {
    status = "Fair";
  } else if (readinessScore >= 25) {
    status = "Needs Attention";
  } else {
    status = "Critical";
  }

  // Determine color based on score
  let scoreColor, bgColor;
  if (readinessScore >= 90) {
    scoreColor = "text-green-700";
    bgColor = "bg-green-100";
  } else if (readinessScore >= 75) {
    scoreColor = "text-green-600";
    bgColor = "bg-green-50";
  } else if (readinessScore >= 50) {
    scoreColor = "text-yellow-700";
    bgColor = "bg-yellow-50";
  } else if (readinessScore >= 25) {
    scoreColor = "text-orange-700";
    bgColor = "bg-orange-50";
  } else {
    scoreColor = "text-red-700";
    bgColor = "bg-red-50";
  }

  // Generate personalized next steps
  let nextSteps = [];
  if (readinessScore < 50) {
    // Significant shortfall
    nextSteps = [
      "Increase your monthly retirement savings if possible",
      "Consider delaying retirement by a few years",
      "Review expenses to find additional savings opportunities",
      "Explore options for increasing your income",
      "Consult with a financial advisor for personalized strategies",
    ];
  } else if (readinessScore < 75) {
    // Moderate shortfall
    nextSteps = [
      "Gradually increase your retirement savings rate",
      "Optimize your investment strategy for better returns",
      "Ensure you're maximizing any employer retirement benefits",
      "Review and reduce unnecessary expenses",
    ];
  } else if (readinessScore < 90) {
    // On track but room for improvement
    nextSteps = [
      "Maintain your current savings habit",
      "Review your investment mix annually",
      "Consider increasing savings when you receive raises",
      "Stay informed about retirement planning strategies",
    ];
  } else {
    // Excellent position
    nextSteps = [
      "Continue your excellent saving habits",
      "Consider options for early retirement",
      "Explore wealth transfer and legacy planning",
      "Review investment risk as you approach retirement",
    ];
  }

  // Create content
  readinessSection.innerHTML = `
  <h3 class="panel-title">Retirement Readiness Assessment</h3>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="col-span-1">
      <div class="flex flex-col items-center ${bgColor} p-4 rounded-lg">
        <h4 class="font-medium mb-2">Readiness Score</h4>
        <div class="text-4xl font-bold ${scoreColor} mb-2">${readinessScore}/100</div>
        <div class="font-medium ${scoreColor} mb-2">${status}</div>
        <div class="w-full bg-gray-200 rounded-full h-2.5 mb-1">
          <div class="h-2.5 rounded-full" 
              style="width: ${readinessScore}%; background-color: var(--${scoreColor.replace(
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
          <p>Based on your ability to cover ${(
            expenseCoverageRatio * 100
          ).toFixed(0)}% of retirement expenses</p>
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
                  style="width: ${Math.min(
                    100,
                    expenseCoverageRatio * 100
                  )}%"></div>
              <div class="relative z-10 text-xs text-white text-center py-0.5">
                ${(expenseCoverageRatio * 100).toFixed(0)}% of needed
              </div>
            </div>
          </div>
        </div>
        <div>
          <div class="text-sm text-gray-500">Retirement Lifestyle</div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <div class="text-xs text-gray-500">Expected</div>
              <div class="font-medium">${(expenseCoverageRatio * 100).toFixed(
                0
              )}%</div>
            </div>
            <div>
              <div class="text-xs text-gray-500">Target</div>
              <div class="font-medium">100%</div>
            </div>
          </div>
          <div class="mt-1 mb-1 text-xs text-gray-600">
            ${
              expenseCoverageRatio < 1
                ? `You may need to adjust your retirement lifestyle or increase savings`
                : `You're on track for your target retirement lifestyle`
            }
          </div>
        </div>
      </div>
      
      <h4 class="font-medium mb-2">Next Steps</h4>
      <ul class="list-disc pl-5 space-y-1 text-sm">
        ${nextSteps.map((step) => `<li>${step}</li>`).join("")}
      </ul>
    </div>
  </div>
`;
}
/**
 * Adds an actionable guidance panel based on the user's retirement situation
 *
 * @param {Object} userData User profile information
 * @param {Object} retirementResults Retirement calculation results
 */
function addRetirementGuidancePanel(userData, retirementResults) {
  // Check if panel already exists and remove it
  const existingPanel = document.getElementById("retirement-guidance-panel");
  if (existingPanel) {
    existingPanel.remove();
  }

  // Create guidance panel
  const guidancePanel = document.createElement("div");
  guidancePanel.id = "retirement-guidance-panel";
  guidancePanel.className = "panel mt-6";

  // Determine guidance type based on retirement situation
  let guidanceTitle = "";
  let guidanceContent = "";
  let guidanceClass = "";

  if (
    retirementResults.required_monthly_savings >
    retirementResults.recommended_monthly_savings
  ) {
    // SHORTFALL SITUATION
    const shortfall =
      retirementResults.required_monthly_savings -
      retirementResults.recommended_monthly_savings;
    const shortfallPercent = (
      (shortfall / userData.monthlyIncome) *
      100
    ).toFixed(1);

    guidanceTitle = "Addressing Your Retirement Savings Gap";
    guidanceClass = "bg-yellow-50 border-l-4 border-yellow-400";

    // Different guidance based on shortfall severity
    if (shortfallPercent > 20) {
      // Major shortfall
      guidanceContent = `
        <p class="mb-3">You have a significant retirement savings gap of ${formatCurrency(
          shortfall
        )} monthly (${shortfallPercent}% of income).</p>
        <p class="mb-3">With your current savings rate, you're projected to fund approximately ${Math.round(
          (retirementResults.recommended_monthly_savings /
            retirementResults.required_monthly_savings) *
            100
        )}% of your target retirement lifestyle.</p>
        
        <h4 class="font-medium mb-2">Consider these options:</h4>
        <ul class="list-disc pl-5 space-y-1">
          <li>Find ways to increase your income through career advancement or side opportunities</li>
          <li>Review and reduce current expenses to free up more for retirement savings</li>
          <li>Adjust retirement expectations (later retirement date or more modest lifestyle)</li>
          <li>Explore higher-return investment options if aligned with your risk tolerance</li>
          <li>Seek professional financial advice for personalized retirement strategies</li>
        </ul>
      `;
    } else {
      // Moderate shortfall
      guidanceContent = `
        <p class="mb-3">You have a moderate retirement savings gap of ${formatCurrency(
          shortfall
        )} monthly (${shortfallPercent}% of income).</p>
        <p class="mb-3">With your current savings rate, you're projected to fund approximately ${Math.round(
          (retirementResults.recommended_monthly_savings /
            retirementResults.required_monthly_savings) *
            100
        )}% of your target retirement lifestyle.</p>
        
        <h4 class="font-medium mb-2">Steps to consider:</h4>
        <ul class="list-disc pl-5 space-y-1">
          <li>Look for small expenses you can reduce to increase retirement savings</li>
          <li>Increase your savings rate gradually (1% every 6 months)</li>
          <li>Optimize tax-advantaged retirement accounts</li>
          <li>Review your investment strategy for potential improvements</li>
        </ul>
      `;
    }
  } else if (
    retirementResults.required_monthly_savings <
    retirementResults.recommended_monthly_savings
  ) {
    // SURPLUS SITUATION
    const surplus =
      retirementResults.recommended_monthly_savings -
      retirementResults.required_monthly_savings;
    const surplusPercent = ((surplus / userData.monthlyIncome) * 100).toFixed(
      1
    );

    guidanceTitle = "Optimizing Your Retirement Surplus";
    guidanceClass = "bg-green-50 border-l-4 border-green-400";

    guidanceContent = `
      <p class="mb-3">You're in an excellent position! Your budget allows for ${formatCurrency(
        surplus
      )} more in monthly retirement savings than mathematically required.</p>
      
      <h4 class="font-medium mb-2">Ways to leverage this advantage:</h4>
      <ul class="list-disc pl-5 space-y-1">
        <li><strong>Enhanced Retirement:</strong> Continue saving the full amount for a more luxurious retirement</li>
        <li><strong>Early Retirement:</strong> Use the surplus to potentially retire ${calculateEarlyRetirementYears(
          surplus,
          retirementResults
        )} years earlier</li>
        <li><strong>Legacy Planning:</strong> Build wealth to pass on to future generations</li>
        <li><strong>Balance Goals:</strong> Redirect some surplus to other financial priorities (education, travel, etc.)</li>
        <li><strong>Flexible Future:</strong> Maintain higher savings to give yourself more options later</li>
      </ul>
    `;
  } else {
    // BALANCED SITUATION
    guidanceTitle = "Your Retirement Plan Is On Track";
    guidanceClass = "bg-blue-50 border-l-4 border-blue-400";

    guidanceContent = `
      <p class="mb-3">Your current budget allocates exactly the amount needed for your retirement goals.</p>
      
      <h4 class="font-medium mb-2">Maintaining your retirement health:</h4>
      <ul class="list-disc pl-5 space-y-1">
        <li>Stay consistent with your current savings rate</li>
        <li>Review your retirement plan annually</li>
        <li>Adjust for major life changes (income increases, family changes)</li>
        <li>Consider increasing savings rate when expenses decrease</li>
        <li>Optimize investment strategy as you approach retirement</li>
      </ul>
    `;
  }

  // Build the panel HTML
  guidancePanel.innerHTML = `
    <h3 class="panel-title">${guidanceTitle}</h3>
    <div class="p-4 rounded-lg ${guidanceClass}">
      ${guidanceContent}
    </div>
  `;

  // Add to retirement tab before retirement readiness section
  const retirementReadinessSection = document.getElementById(
    "retirement-readiness-section"
  );
  if (retirementReadinessSection) {
    retirementReadinessSection.parentNode.insertBefore(
      guidancePanel,
      retirementReadinessSection
    );
  } else {
    // If readiness section doesn't exist, append to tab
    document.getElementById("retirement-tab").appendChild(guidancePanel);
  }
}
/**
 * Adds a visual representation comparing target vs actual retirement
 *
 * @param {Object} userData User profile information
 * @param {Object} retirementResults Retirement calculation results
 */
function addRetirementComparisonVisual(userData, retirementResults) {
  // Check if visual already exists
  const existingVisual = document.getElementById(
    "retirement-comparison-visual"
  );
  if (existingVisual) {
    existingVisual.remove();
  }

  // Calculate retirement funding percentage
  const fundingPercentage = Math.min(
    100,
    Math.round(
      (retirementResults.recommended_monthly_savings /
        retirementResults.required_monthly_savings) *
        100
    )
  );

  // Create the visual container
  const visualContainer = document.createElement("div");
  visualContainer.id = "retirement-comparison-visual";
  visualContainer.className = "panel mt-6";

  // Calculate expected monthly retirement income based on current savings rate
  const expectedCorpus =
    retirementResults.future_value_of_current_savings +
    calculateFutureSavedAmount(
      retirementResults.recommended_monthly_savings,
      retirementResults.pre_retirement_return,
      userData.retirementAge - userData.age
    );

  const monthlyRetirementIncome =
    (expectedCorpus * retirementResults.safe_withdrawal_rate) / 12;

  // Calculate target monthly income
  const targetMonthlyIncome =
    (retirementResults.total_corpus_required *
      retirementResults.safe_withdrawal_rate) /
    12;

  // Determine retirement quality descriptors
  let retirementQuality = "";
  let qualityColor = "";

  if (fundingPercentage >= 100) {
    retirementQuality = "Your Target Lifestyle";
    qualityColor = "text-green-600";
  } else if (fundingPercentage >= 80) {
    retirementQuality = "Comfortable but Adjusted";
    qualityColor = "text-blue-600";
  } else if (fundingPercentage >= 60) {
    retirementQuality = "Modest Lifestyle";
    qualityColor = "text-yellow-600";
  } else if (fundingPercentage >= 40) {
    retirementQuality = "Basic Necessities";
    qualityColor = "text-orange-600";
  } else {
    retirementQuality = "Financial Challenges";
    qualityColor = "text-red-600";
  }

  // Build the visual HTML
  visualContainer.innerHTML = `
    <h3 class="panel-title">Your Retirement Picture</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
      <!-- Target Retirement -->
      <div class="text-center">
        <h4 class="font-medium mb-3">Target Retirement</h4>
        <div class="p-4 bg-green-50 rounded-lg mb-3">
          <div class="inline-block p-3 rounded-full bg-green-100 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="text-2xl font-bold text-green-700 mb-1">
            ${formatCurrency(targetMonthlyIncome)}
          </div>
          <div class="text-sm text-green-800">Monthly Income</div>
        </div>
        <div class="text-sm text-gray-600">
          This is the retirement lifestyle you've targeted based on your current expenses and inflation projections.
        </div>
      </div>
      
      <!-- Projected Retirement -->
      <div class="text-center">
        <h4 class="font-medium mb-3">Your Projected Retirement</h4>
        <div class="p-4 ${
          fundingPercentage >= 100 ? "bg-green-50" : "bg-yellow-50"
        } rounded-lg mb-3">
          <div class="inline-block p-3 rounded-full ${
            fundingPercentage >= 100 ? "bg-green-100" : "bg-yellow-100"
          } mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 ${
              fundingPercentage >= 100 ? "text-green-600" : "text-yellow-600"
            }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                ${
                  fundingPercentage >= 100
                    ? 'd="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"'
                    : 'd="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"'
                } />
            </svg>
          </div>
          <div class="text-2xl font-bold ${
            fundingPercentage >= 100 ? "text-green-700" : "text-yellow-700"
          } mb-1">
            ${formatCurrency(monthlyRetirementIncome)}
          </div>
          <div class="text-sm ${qualityColor} font-medium">${retirementQuality}</div>
        </div>
        <div class="text-sm text-gray-600">
          Based on your current savings rate, you're on track to fund <strong>${fundingPercentage}%</strong> of your target retirement lifestyle.
        </div>
      </div>
    </div>
    
    <!-- Progress bar -->
    <div class="mt-4 px-4 pb-4">
      <div class="flex justify-between mb-1">
        <span class="text-sm font-medium">Funding Progress: ${fundingPercentage}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-4">
        <div class="h-4 rounded-full ${getFundingProgressColor(
          fundingPercentage
        )}" 
          style="width: ${fundingPercentage}%"></div>
      </div>
      <div class="flex justify-between mt-2 text-xs text-gray-500">
        <span>0%</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span>100%</span>
      </div>
      
      <div class="mt-4 text-sm text-center">
        ${getRetirementAdvice(fundingPercentage)}
      </div>
    </div>
  `;

  // Add helper functions within scope
  function getFundingProgressColor(percentage) {
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 75) return "bg-green-400";
    if (percentage >= 50) return "bg-yellow-400";
    if (percentage >= 25) return "bg-orange-400";
    return "bg-red-400";
  }

  function getRetirementAdvice(percentage) {
    if (percentage >= 100) {
      return "You're fully on track for your retirement goals. Consider if you'd like to enhance your retirement lifestyle or retire earlier.";
    } else if (percentage >= 75) {
      return "You're making excellent progress. A small increase in savings or minor lifestyle adjustments in retirement can close the gap.";
    } else if (percentage >= 50) {
      return "You're halfway to your goal. Consider increasing your savings rate or exploring ways to enhance your investment returns.";
    } else if (percentage >= 25) {
      return "You have a foundation to build on. Look for opportunities to increase your retirement savings or adjust your retirement expectations.";
    } else {
      return "You're at the beginning of your retirement journey. Focus on building your savings rate while exploring ways to increase income.";
    }
  }

  // Add to retirement tab
  const retirementTab = document.getElementById("retirement-tab");
  const readinessSection = document.getElementById(
    "retirement-readiness-section"
  );

  if (readinessSection) {
    retirementTab.insertBefore(visualContainer, readinessSection);
  } else {
    retirementTab.appendChild(visualContainer);
  }
}
/**
 * Estimates potential early retirement years based on surplus savings
 *
 * @param {number} surplusSavings Monthly surplus savings amount
 * @param {Object} retirementResults Retirement calculation results
 * @returns {number} Potential years of earlier retirement
 */
function calculateEarlyRetirementYears(surplusSavings, retirementResults) {
  // Simple estimation: Extra savings as percentage of required could roughly
  // translate to percentage of time reduced from retirement timeline
  const savingsRatio =
    surplusSavings / retirementResults.required_monthly_savings;
  // Cap at 10 years for realism
  return Math.min(Math.round(savingsRatio * 10), 10);
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
  // Add new explanation section
  const explanationSection = document.createElement("div");
  explanationSection.className = "bg-blue-50 p-4 rounded-lg mb-6";
  explanationSection.innerHTML = `
  <h4 class="font-medium mb-2">Understanding Your Budget Opportunities</h4>
  <p class="text-sm mb-2">
    Your current budget balances present needs with future goals. This section shows areas where 
    you could reallocate funds if you wanted to increase your retirement savings.
  </p>
  <p class="text-sm">
    These are opportunities, not requirements. Finding the right balance between enjoying today 
    and saving for tomorrow is a personal choice.
  </p>
`;
  container.appendChild(explanationSection);
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
    <div class="opportunity-amount text-blue-600 font-semibold">
      Opportunity: ${formatCurrency(opportunity.potential_savings.moderate)}
    </div>
  </div>
`;

    // Card details
    const details = document.createElement("div");
    details.className = "p-4 border-b";
    details.innerHTML = `
  <div class="grid grid-cols-1 gap-4">
    <div>
      <div class="flex justify-between items-center mb-2">
        <div class="text-sm text-gray-600">Current Recommended Allocation</div>
        <div class="font-medium">${formatCurrency(
          opportunity.current_spending
        )}</div>
      </div>
      <div class="flex justify-between items-center mb-2">
        <div class="text-sm text-gray-600">Typical for Your Income Level</div>
        <div class="font-medium">${formatCurrency(opportunity.benchmark)}</div>
      </div>
      <div class="bg-blue-50 p-3 rounded-lg mt-2 text-sm">
        <p>Your budget provides a higher ${categoryName.toLowerCase()} allocation than typical. 
        This reflects your financial capacity, but you could redirect some of these funds to 
        retirement if you prefer.</p>
        <p class="mt-2">Redirecting about ${formatCurrency(
          opportunity.potential_savings.moderate
        )} 
        would still leave you with an above-average lifestyle while boosting your retirement by 
        ${formatCurrency(
          opportunity.potential_savings.moderate * 12
        )} per year.</p>
      </div>
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

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
  // Show survival mode guidance if applicable
  if (budgetResults.survival_mode) {
    showSurvivalModeGuidance(budgetResults, userData);
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
  // Check if we have dual income
  const hasDualIncome = budgetResults.household_income.has_dual_income;
  const totalIncome = budgetResults.household_income.total;

  // Update monthly income value
  document.getElementById("monthly-budget-value").innerHTML = `
        <div>${formatCurrency(totalIncome)}</div>
        ${
          hasDualIncome
            ? `
            <div class="text-sm font-normal text-gray-600">
                Primary: ${formatCurrency(userData.monthlyIncome)} 
                <span class="mx-1">•</span> 
                Secondary: ${formatCurrency(userData.secondaryIncome)}
            </div>
        `
            : ""
        }
    `;

  // New label for the first card to clarify it's household income
  const budgetLabel = document.querySelector(
    ".dashboard-summary .metric-card:nth-child(1) h3"
  );
  if (budgetLabel)
    budgetLabel.textContent = hasDualIncome
      ? "Household Income"
      : "Monthly Income";

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
      <div>${formatCurrency(
        retirementResults.recommended_monthly_savings
      )}</div>
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

/**
 * Shows survival mode guidance for users with severe income constraints
 * @param {Object} budgetResults Budget allocation results
 * @param {Object} userData User profile information
 */
function showSurvivalModeGuidance(budgetResults, userData) {
  // Create guidance element with compassionate, practical advice
  const guidance = document.createElement("div");
  guidance.className =
    "bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6";

  let guidanceContent = `
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-bold mb-2">
            Your current income of ${formatCurrency(
              userData.monthlyIncome
            )} is insufficient to cover basic necessities 
            (calculated at ${formatCurrency(
              budgetResults.original_essentials
            )}).
          </p>
          <p class="text-sm mb-3">
            We've created a prioritized survival budget focusing on the most essential needs, 
            but additional support resources will likely be necessary.
          </p>
    `;

  if (budgetResults.guidance_notes && budgetResults.guidance_notes.length > 0) {
    guidanceContent +=
      '<p class="text-sm font-medium mb-1">Recommended actions:</p><ul class="list-disc pl-5 text-sm">';
    budgetResults.guidance_notes.forEach((note) => {
      guidanceContent += `<li>${note}</li>`;
    });
    guidanceContent += "</ul>";
  }

  // Add location-specific guidance
  const locationSpecificGuidance = getLocationSpecificResources(
    userData.location,
    userData.locationTier
  );
  if (locationSpecificGuidance) {
    guidanceContent += `
        <p class="text-sm font-medium mt-2 mb-1">Available support resources:</p>
        <ul class="list-disc pl-5 text-sm">
          ${locationSpecificGuidance}
        </ul>
      `;
  }

  guidanceContent += `
          <p class="text-sm mt-3">
            <strong>Income improvement is critical.</strong> Focus on increasing earnings 
            through additional work, skills development, or government assistance programs.
          </p>
        </div>
      </div>
    `;

  guidance.innerHTML = guidanceContent;

  // Insert at top of dashboard
  const dashboardSummary = document.querySelector(".dashboard-summary");
  dashboardSummary.parentNode.insertBefore(guidance, dashboardSummary);
}

/**
 * Get location-specific resources based on user's location
 * @param {string} location User's location
 * @param {string} locationTier Location tier
 * @returns {string} HTML with location-specific resource information
 */
function getLocationSpecificResources(location, locationTier) {
  // Base resources common across India
  let resources = `<li>Contact local Panchayat/Municipal office for available assistance programs</li>
                     <li>Visit nearby Public Distribution System (PDS) shop for subsidized essentials</li>`;

  // Add location-specific resources
  if (location === "delhi" || locationTier === "METRO") {
    resources += `<li>Delhi Shelter Board helpline: 011-2334-5754</li>
                   <li>Free medical at Mohalla clinics</li>`;
  } else if (location === "mumbai" || location === "pune") {
    resources += `<li>BMC helpline for assistance: 1916</li>`;
  }

  // Add more location-specific resources as needed

  return resources;
}

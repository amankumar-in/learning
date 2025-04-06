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

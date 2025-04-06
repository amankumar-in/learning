/**
 * Enhanced Tradeoff Visualizer for the Indian Retirement Calculator
 * This file contains functions for creating and updating visual representations
 * of tradeoffs between current lifestyle and future retirement security.
 *
 * This updated version aligns calculations with the budget allocation engine.
 */

// === INITIALIZATION AND SETUP ===

/**
 * Initialize the tradeoff visualizer
 * Creates the HTML structure and adds event listeners
 */
function initializeTradeoffVisualizer() {
  // Create visualizer containers in both tabs if they don't exist
  createTradeoffVisualizer("budget-tab");
  createTradeoffVisualizer("retirement-tab");

  // Add event listeners for interactive elements
  setupTradeoffVisualizerEvents();
}

/**
 * Creates the tradeoff visualizer HTML structure in the specified tab
 *
 * @param {string} tabId ID of the tab where the visualizer should be added
 */
function createTradeoffVisualizer(tabId) {
  // Check if the tab exists
  const tab = document.getElementById(tabId);
  if (!tab) return;

  // Check if visualizer already exists in this tab
  if (document.getElementById(`tradeoff-visualizer-${tabId}`)) return;

  // Create tradeoff visualizer container
  const visualizerContainer = document.createElement("div");
  visualizerContainer.id = `tradeoff-visualizer-${tabId}`;
  visualizerContainer.className = "panel mt-6";

  // Create HTML content
  visualizerContainer.innerHTML = `
    <h3 class="panel-title">Lifestyle vs. Retirement Tradeoff Analysis</h3>
    <div class="p-4 bg-blue-50 rounded-lg mb-4 text-sm">
      <p>This visualization helps you understand the balance between your current lifestyle and future retirement security. 
      Adjusting your budget allocation can significantly impact both your present quality of life and future financial security.</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <!-- Dual Satisfaction Meters -->
      <div>
        <h4 class="font-medium mb-3">Satisfaction Balance</h4>
        <div class="bg-white p-4 rounded-lg border border-gray-200">
          <!-- Current Lifestyle Meter -->
          <div class="mb-4">
            <div class="flex justify-between mb-1">
              <div class="text-sm font-medium">Current Lifestyle Quality</div>
              <div class="text-sm font-medium" id="current-lifestyle-value-${tabId}">0%</div>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5 mb-1">
              <div class="h-2.5 rounded-full bg-amber-500" id="current-lifestyle-meter-${tabId}" style="width: 0%"></div>
            </div>
            <div class="text-xs text-gray-500" id="current-lifestyle-desc-${tabId}">Based on discretionary spending</div>
          </div>
          
          <!-- Future Security Meter -->
          <div>
            <div class="flex justify-between mb-1">
              <div class="text-sm font-medium">Future Retirement Security</div>
              <div class="text-sm font-medium" id="future-security-value-${tabId}">0%</div>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5 mb-1">
              <div class="h-2.5 rounded-full bg-blue-500" id="future-security-meter-${tabId}" style="width: 0%"></div>
            </div>
            <div class="text-xs text-gray-500" id="future-security-desc-${tabId}">Based on retirement funding</div>
          </div>
          
          <!-- Tradeoff Indicator -->
          <div class="mt-4 pt-4 border-t border-gray-200">
            <div class="text-sm font-medium mb-2">Current Balance:</div>
            <div class="text-sm p-2 rounded-lg" id="tradeoff-indicator-${tabId}">Loading balance information...</div>
          </div>
        </div>
      </div>
      
      <!-- Retirement Lifestyle Coverage -->
      <div>
        <h4 class="font-medium mb-3">Retirement Lifestyle Coverage</h4>
        <div class="bg-white p-4 rounded-lg border border-gray-200">
          <div class="mb-4 text-center">
            <div class="text-sm text-gray-600 mb-1">With Current Savings Rate</div>
            <div class="text-3xl font-bold" id="retirement-coverage-value-${tabId}">0%</div>
            <div class="text-sm text-gray-600" id="retirement-coverage-desc-${tabId}">of desired retirement lifestyle funded</div>
          </div>
          
          <div class="mb-4">
            <div class="w-full bg-gray-200 rounded-full h-4">
              <div class="h-4 rounded-full" id="retirement-coverage-meter-${tabId}" style="width: 0%; background-color: #f59e0b;"></div>
            </div>
            <div class="flex justify-between text-xs mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
          
          <div class="text-sm p-2 rounded-lg bg-gray-50" id="retirement-coverage-impact-${tabId}">
            Loading impact information...
          </div>
        </div>
      </div>
    </div>
    
    <!-- Timeline Visualization -->
    <div>
      <h4 class="font-medium mb-3">Long-term Impact Timeline</h4>
      <div class="bg-white p-4 rounded-lg border border-gray-200">
        <div style="height: 250px;">
          <canvas id="timeline-chart-${tabId}"></canvas>
        </div>
        <div class="mt-4 text-sm text-gray-600" id="timeline-insight-${tabId}">
          Loading timeline insights...
        </div>
      </div>
    </div>
    
    <!-- Interactive Tradeoff Simulator -->
    <div class="mt-6">
      <h4 class="font-medium mb-3">Interactive Tradeoff Simulator</h4>
      <div class="bg-white p-4 rounded-lg border border-gray-200">
        <p class="text-sm mb-4">
          Use the slider below to explore how shifting money between discretionary spending and retirement savings would affect your current lifestyle and future security.
        </p>
        
        <div class="mb-4">
          <label for="tradeoff-slider-${tabId}" class="block text-sm font-medium text-gray-700 mb-1">
            Shift from Discretionary to Retirement: 
            <span id="slider-value-${tabId}">0%</span>
          </label>
          <input type="range" id="tradeoff-slider-${tabId}" 
                 min="0" max="100" value="0" 
                 class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <div class="text-sm text-gray-600 mb-1">Current Allocation</div>
            <div class="flex items-center mb-2">
              <div class="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
              <div class="text-sm">Discretionary: <span class="font-medium" id="current-discretionary-${tabId}">₹0</span></div>
            </div>
            <div class="flex items-center">
              <div class="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <div class="text-sm">Retirement: <span class="font-medium" id="current-retirement-${tabId}">₹0</span></div>
            </div>
          </div>
          
          <div>
            <div class="text-sm text-gray-600 mb-1">Simulated Allocation</div>
            <div class="flex items-center mb-2">
              <div class="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
              <div class="text-sm">Discretionary: <span class="font-medium" id="simulated-discretionary-${tabId}">₹0</span></div>
            </div>
            <div class="flex items-center">
              <div class="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <div class="text-sm">Retirement: <span class="font-medium" id="simulated-retirement-${tabId}">₹0</span></div>
            </div>
          </div>
        </div>
        
        <div class="p-3 rounded-lg border border-gray-200 bg-gray-50 mb-4">
          <div class="text-sm font-medium mb-2">Impact of This Adjustment:</div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-gray-600">Current Lifestyle Quality</div>
              <div class="flex items-center">
                <div class="text-lg font-bold" id="simulated-lifestyle-${tabId}">0%</div>
                <div class="text-sm ml-2" id="lifestyle-change-${tabId}">0%</div>
              </div>
            </div>
            <div>
              <div class="text-sm text-gray-600">Retirement Funding</div>
              <div class="flex items-center">
                <div class="text-lg font-bold" id="simulated-funding-${tabId}">0%</div>
                <div class="text-sm ml-2" id="funding-change-${tabId}">0%</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-center">
          <button id="apply-tradeoff-btn-${tabId}" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
            Apply This Balance
          </button>
        </div>
      </div>
    </div>
  `;

  // Add the visualizer to the tab
  // For budget tab, insert after budget guidance
  if (tabId === "budget-tab") {
    const budgetGuidance = document.getElementById("budget-guidance");
    if (budgetGuidance) {
      budgetGuidance.parentNode.insertBefore(
        visualizerContainer,
        budgetGuidance.nextSibling
      );
    } else {
      tab.appendChild(visualizerContainer);
    }
  }
  // For retirement tab, insert after retirement readiness section
  else if (tabId === "retirement-tab") {
    const retirementReadiness = document.getElementById(
      "retirement-readiness-section"
    );
    if (retirementReadiness) {
      retirementReadiness.parentNode.insertBefore(
        visualizerContainer,
        retirementReadiness.nextSibling
      );
    } else {
      tab.appendChild(visualizerContainer);
    }
  }
}

/**
 * Sets up event listeners for tradeoff visualizer interactive elements
 */
function setupTradeoffVisualizerEvents() {
  // Add event listeners to sliders in both tabs
  setupSliderEvents("budget-tab");
  setupSliderEvents("retirement-tab");

  // Add event listeners to apply buttons in both tabs
  setupApplyButtonEvents("budget-tab");
  setupApplyButtonEvents("retirement-tab");
}

/**
 * Sets up slider event listeners for a tab
 *
 * @param {string} tabId ID of the tab
 */
function setupSliderEvents(tabId) {
  const slider = document.getElementById(`tradeoff-slider-${tabId}`);
  if (!slider) return;

  slider.addEventListener("input", function () {
    updateTradeoffSimulation(tabId, parseInt(this.value));
  });
}

/**
 * Sets up apply button event listeners for a tab
 *
 * @param {string} tabId ID of the tab
 */
function setupApplyButtonEvents(tabId) {
  const applyButton = document.getElementById(`apply-tradeoff-btn-${tabId}`);
  if (!applyButton) return;

  applyButton.addEventListener("click", function () {
    applyTradeoffSimulation(tabId);
  });
}

// === VISUALIZATION UPDATE FUNCTIONS ===

/**
 * Updates all tradeoff visualizations with the latest calculation results
 * This function aligns with the budget allocation engine's sophisticated calculations
 *
 * @param {Object} userData User profile and financial information
 * @param {Object} budgetResults Budget allocation results
 * @param {Object} retirementResults Retirement planning results
 */
function updateTradeoffVisualizer(userData, budgetResults, retirementResults) {
  // Update visualizations in both tabs
  updateDualSatisfactionMeters(
    "budget-tab",
    userData,
    budgetResults,
    retirementResults
  );
  updateDualSatisfactionMeters(
    "retirement-tab",
    userData,
    budgetResults,
    retirementResults
  );

  updateRetirementCoverage(
    "budget-tab",
    userData,
    budgetResults,
    retirementResults
  );
  updateRetirementCoverage(
    "retirement-tab",
    userData,
    budgetResults,
    retirementResults
  );

  createTimelineChart("budget-tab", userData, budgetResults, retirementResults);
  createTimelineChart(
    "retirement-tab",
    userData,
    budgetResults,
    retirementResults
  );

  initializeTradeoffSimulator(
    "budget-tab",
    userData,
    budgetResults,
    retirementResults
  );
  initializeTradeoffSimulator(
    "retirement-tab",
    userData,
    budgetResults,
    retirementResults
  );
}

/**
 * Updates the dual satisfaction meters showing current lifestyle quality and future security
 * Aligned with budget allocation engine calculations
 *
 * @param {string} tabId ID of the tab
 * @param {Object} userData User profile information
 * @param {Object} budgetResults Budget allocation results
 * @param {Object} retirementResults Retirement planning results
 */
function updateDualSatisfactionMeters(
  tabId,
  userData,
  budgetResults,
  retirementResults
) {
  // Calculate current lifestyle quality based on a more sophisticated approach
  // that considers financial priority, income tier, and actual budget allocations
  let lifestyleQuality = calculateLifestyleQuality(userData, budgetResults);

  // Calculate future security based on retirement funding percentage
  // with adjustments based on financial priority
  const fundingPercentage = calculateRetirementFundingPercentage(
    userData,
    retirementResults
  );

  // Update lifestyle meter
  const lifestyleMeter = document.getElementById(
    `current-lifestyle-meter-${tabId}`
  );
  const lifestyleValue = document.getElementById(
    `current-lifestyle-value-${tabId}`
  );
  const lifestyleDesc = document.getElementById(
    `current-lifestyle-desc-${tabId}`
  );

  if (lifestyleMeter && lifestyleValue && lifestyleDesc) {
    lifestyleMeter.style.width = `${lifestyleQuality}%`;
    lifestyleValue.textContent = `${Math.round(lifestyleQuality)}%`;

    // Add descriptive text based on lifestyle quality
    if (lifestyleQuality >= 80) {
      lifestyleDesc.textContent =
        "Premium lifestyle with high discretionary spending";
      lifestyleMeter.classList.remove("bg-red-500", "bg-yellow-500");
      lifestyleMeter.classList.add("bg-green-500");
    } else if (lifestyleQuality >= 60) {
      lifestyleDesc.textContent =
        "Comfortable lifestyle with moderate discretionary spending";
      lifestyleMeter.classList.remove("bg-red-500", "bg-green-500");
      lifestyleMeter.classList.add("bg-yellow-500");
    } else if (lifestyleQuality >= 40) {
      lifestyleDesc.textContent =
        "Modest lifestyle with limited discretionary spending";
      lifestyleMeter.classList.remove("bg-red-500", "bg-green-500");
      lifestyleMeter.classList.add("bg-amber-500");
    } else {
      lifestyleDesc.textContent =
        "Basic lifestyle with minimal discretionary spending";
      lifestyleMeter.classList.remove("bg-green-500", "bg-yellow-500");
      lifestyleMeter.classList.add("bg-red-500");
    }
  }

  // Update security meter
  const securityMeter = document.getElementById(
    `future-security-meter-${tabId}`
  );
  const securityValue = document.getElementById(
    `future-security-value-${tabId}`
  );
  const securityDesc = document.getElementById(`future-security-desc-${tabId}`);

  if (securityMeter && securityValue && securityDesc) {
    securityMeter.style.width = `${fundingPercentage}%`;
    securityValue.textContent = `${Math.round(fundingPercentage)}%`;

    // Add descriptive text based on funding percentage
    if (fundingPercentage >= 90) {
      securityDesc.textContent = "Fully funded retirement plan";
      securityMeter.classList.remove("bg-red-500", "bg-yellow-500");
      securityMeter.classList.add("bg-green-500");
    } else if (fundingPercentage >= 70) {
      securityDesc.textContent =
        "Well-funded retirement with minor adjustments needed";
      securityMeter.classList.remove("bg-red-500", "bg-green-500");
      securityMeter.classList.add("bg-yellow-500");
    } else if (fundingPercentage >= 50) {
      securityDesc.textContent =
        "Moderately funded retirement requiring attention";
      securityMeter.classList.remove("bg-red-500", "bg-green-500");
      securityMeter.classList.add("bg-amber-500");
    } else {
      securityDesc.textContent =
        "Underfunded retirement requiring significant attention";
      securityMeter.classList.remove("bg-green-500", "bg-yellow-500");
      securityMeter.classList.add("bg-red-500");
    }
  }

  // Update tradeoff indicator
  const tradeoffIndicator = document.getElementById(
    `tradeoff-indicator-${tabId}`
  );

  if (tradeoffIndicator) {
    let tradeoffText, tradeoffClass;

    // Evaluate tradeoff balance
    if (lifestyleQuality >= 70 && fundingPercentage >= 80) {
      tradeoffText =
        "Excellent balance between current lifestyle and future security.";
      tradeoffClass = "bg-green-100 text-green-800";
    } else if (lifestyleQuality >= 60 && fundingPercentage >= 60) {
      tradeoffText =
        "Good balance between current lifestyle and future security.";
      tradeoffClass = "bg-green-50 text-green-700";
    } else if (lifestyleQuality > 70 && fundingPercentage < 60) {
      tradeoffText =
        "Current lifestyle prioritized over future security. Consider rebalancing.";
      tradeoffClass = "bg-yellow-100 text-yellow-800";
    } else if (lifestyleQuality < 50 && fundingPercentage > 80) {
      tradeoffText =
        "Future security prioritized over current lifestyle. Consider rebalancing if desired.";
      tradeoffClass = "bg-blue-100 text-blue-800";
    } else if (lifestyleQuality < 50 && fundingPercentage < 60) {
      tradeoffText =
        "Both current lifestyle and future security need attention. Consider increasing income.";
      tradeoffClass = "bg-red-100 text-red-800";
    } else {
      tradeoffText =
        "Moderate balance between current lifestyle and future security.";
      tradeoffClass = "bg-blue-50 text-blue-700";
    }

    tradeoffIndicator.textContent = tradeoffText;
    tradeoffIndicator.className = `text-sm p-2 rounded-lg ${tradeoffClass}`;
  }
}

/**
 * Calculates lifestyle quality based on discretionary spending, financial priority, and income tier
 * This aligns with the budget allocation engine's approach
 *
 * @param {Object} userData User profile information
 * @param {Object} budgetResults Budget allocation results
 * @returns {number} Lifestyle quality score (0-100)
 */
function calculateLifestyleQuality(userData, budgetResults) {
  // Calculate discretionary spending as a percentage of income
  const discretionaryPercentage =
    (budgetResults.discretionary / userData.monthlyIncome) * 100;

  // Get financial priority adjustment factor
  let priorityFactor = 1.0;
  switch (userData.financialPriority) {
    case "future_focused":
      priorityFactor = 0.8; // Lower satisfaction with same discretionary spending
      break;
    case "balanced":
      priorityFactor = 1.0; // Baseline
      break;
    case "current_focused":
      priorityFactor = 1.2; // Higher satisfaction with same discretionary spending
      break;
  }

  // Get income tier adjustment factor
  // Higher income tiers need higher discretionary percentages for same satisfaction
  let incomeTierFactor = 1.0;
  switch (userData.incomeTier) {
    case "VERY_LOW":
    case "LOW":
      incomeTierFactor = 1.4; // Higher satisfaction with less discretionary spending
      break;
    case "LOWER_MIDDLE":
    case "MIDDLE":
      incomeTierFactor = 1.0; // Baseline
      break;
    case "HIGH":
    case "ULTRA_HIGH":
      incomeTierFactor = 0.7; // Requires more discretionary spending for same satisfaction
      break;
  }

  // Essential needs coverage impact
  // If essential needs aren't covered well, overall lifestyle quality suffers
  let essentialCoverageFactor = 1.0;
  const essentialPercentage =
    (budgetResults.total_essentials / budgetResults.total_budget) * 100;
  if (essentialPercentage < 50) {
    essentialCoverageFactor = 0.8; // Penalize if essentials are underfunded
  }

  // Apply discretionary spending curve with adjustments
  // Baseline: Linear relationship from 0-40% discretionary spending
  const baselineMax = 40; // At this percentage, we reach 100% satisfaction

  // Apply adjustments for financial priority and income tier
  const adjustedMax = baselineMax / (priorityFactor * incomeTierFactor);

  // Calculate lifestyle quality based on adjusted curve
  let lifestyleQuality;
  if (discretionaryPercentage >= adjustedMax) {
    lifestyleQuality = 100;
  } else {
    lifestyleQuality = (discretionaryPercentage / adjustedMax) * 100;
  }

  // Apply essential coverage factor
  lifestyleQuality *= essentialCoverageFactor;

  // Cap at 100
  return Math.min(100, lifestyleQuality);
}

/**
 * Calculates retirement funding percentage with adjustments based on financial priority
 *
 * @param {Object} userData User profile information
 * @param {Object} retirementResults Retirement planning results
 * @returns {number} Funding percentage (0-100)
 */
function calculateRetirementFundingPercentage(userData, retirementResults) {
  // Base funding percentage
  const baseFundingPercentage = Math.min(
    100,
    (retirementResults.recommended_monthly_savings /
      retirementResults.required_monthly_savings) *
      100
  );

  // Apply adjustment based on financial priority
  let priorityAdjustment = 0;
  switch (userData.financialPriority) {
    case "future_focused":
      priorityAdjustment = 5; // More generous evaluation of retirement funding
      break;
    case "balanced":
      priorityAdjustment = 0; // No adjustment
      break;
    case "current_focused":
      priorityAdjustment = -5; // More strict evaluation of retirement funding
      break;
  }

  // Calculate adjusted funding percentage
  const adjustedFundingPercentage = Math.min(
    100,
    Math.max(0, baseFundingPercentage + priorityAdjustment)
  );

  return adjustedFundingPercentage;
}

/**
 * Updates the retirement lifestyle coverage visualization
 *
 * @param {string} tabId ID of the tab
 * @param {Object} userData User profile information
 * @param {Object} budgetResults Budget allocation results
 * @param {Object} retirementResults Retirement planning results
 */
function updateRetirementCoverage(
  tabId,
  userData,
  budgetResults,
  retirementResults
) {
  // Calculate what percentage of desired retirement is funded
  const fundingPercentage = Math.min(
    100,
    (retirementResults.recommended_monthly_savings /
      retirementResults.required_monthly_savings) *
      100
  );

  // Update coverage meter
  const coverageMeter = document.getElementById(
    `retirement-coverage-meter-${tabId}`
  );
  const coverageValue = document.getElementById(
    `retirement-coverage-value-${tabId}`
  );
  const coverageDesc = document.getElementById(
    `retirement-coverage-desc-${tabId}`
  );
  const coverageImpact = document.getElementById(
    `retirement-coverage-impact-${tabId}`
  );

  if (!coverageMeter || !coverageValue || !coverageDesc || !coverageImpact)
    return;

  // Update values
  coverageMeter.style.width = `${fundingPercentage}%`;
  coverageValue.textContent = `${Math.round(fundingPercentage)}%`;

  // Set appropriate color based on coverage percentage
  if (fundingPercentage >= 90) {
    coverageMeter.style.backgroundColor = "#10B981"; // Green
    coverageValue.className = "text-3xl font-bold text-green-600";
  } else if (fundingPercentage >= 70) {
    coverageMeter.style.backgroundColor = "#F59E0B"; // Amber
    coverageValue.className = "text-3xl font-bold text-amber-600";
  } else if (fundingPercentage >= 50) {
    coverageMeter.style.backgroundColor = "#F97316"; // Orange
    coverageValue.className = "text-3xl font-bold text-orange-600";
  } else {
    coverageMeter.style.backgroundColor = "#EF4444"; // Red
    coverageValue.className = "text-3xl font-bold text-red-600";
  }

  // Calculate monthly retirement income based on projected corpus
  const retirementCorpus =
    retirementResults.future_value_of_current_savings +
    calculateFutureSavedAmount(
      retirementResults.recommended_monthly_savings,
      retirementResults.pre_retirement_return,
      userData.retirementAge - userData.age
    );

  const monthlyRetirementIncome =
    (retirementCorpus * retirementResults.safe_withdrawal_rate) / 12;

  // Calculate monthly shortfall/surplus
  const monthlyShortfall =
    retirementResults.future_monthly_expenses - monthlyRetirementIncome;

  // Update coverage description and impact
  if (fundingPercentage >= 100) {
    // Surplus case
    const surplus = Math.abs(monthlyShortfall);
    coverageDesc.textContent = `of desired retirement lifestyle funded (surplus)`;
    coverageImpact.innerHTML = `
      <span class="font-medium text-green-700">Monthly surplus: ${formatCurrency(
        surplus
      )}</span>
      <p class="mt-1">Your current savings rate will provide more than your target retirement lifestyle. 
      You could consider retiring earlier, enhancing your retirement lifestyle, or reallocating some savings to enjoy more now.</p>
    `;
    coverageImpact.className = "text-sm p-2 rounded-lg bg-green-50";
  } else {
    // Shortfall case
    coverageDesc.textContent = `of desired retirement lifestyle funded`;
    coverageImpact.innerHTML = `
      <span class="font-medium text-${
        fundingPercentage < 70 ? "red" : "yellow"
      }-700">
        Monthly shortfall: ${formatCurrency(monthlyShortfall)}
      </span>
      <p class="mt-1">At your current savings rate, you'll need to reduce your retirement expenses 
      by ${(100 - fundingPercentage).toFixed(
        0
      )}% or increase your monthly retirement savings by 
      ${formatCurrency(
        retirementResults.required_monthly_savings -
          retirementResults.recommended_monthly_savings
      )}.</p>
    `;
    coverageImpact.className = `text-sm p-2 rounded-lg bg-${
      fundingPercentage < 70 ? "red" : "yellow"
    }-50`;
  }
}

/**
 * Creates a timeline chart showing the long-term impact of current decisions
 *
 * @param {string} tabId ID of the tab
 * @param {Object} userData User profile information
 * @param {Object} budgetResults Budget allocation results
 * @param {Object} retirementResults Retirement planning results
 */
function createTimelineChart(
  tabId,
  userData,
  budgetResults,
  retirementResults
) {
  const ctx = document.getElementById(`timeline-chart-${tabId}`);
  if (!ctx) return;

  // Destroy existing chart if it exists
  if (window[`timelineChart_${tabId}`]) {
    window[`timelineChart_${tabId}`].destroy();
  }

  // Get retirement growth projection data
  const projection = retirementResults.growth_projection;

  // Prepare data for chart
  const labels = [];
  const accumulation = [];
  const retirement = [];
  const idealAccumulation = [];

  // Calculate what an ideal savings rate would accumulate to
  const idealMonthlySavings = retirementResults.required_monthly_savings;
  const actualMonthlySavings = retirementResults.recommended_monthly_savings;
  const yearsToRetirement = userData.retirementAge - userData.age;

  // Process projection data
  projection.forEach((point) => {
    labels.push(`Age ${point.age}`);

    if (point.phase === "accumulation") {
      accumulation.push(point.amount);
      retirement.push(null);

      // Calculate ideal accumulation for this age
      const yearsAccumulated = point.age - userData.age;
      const idealAmount =
        retirementResults.current_savings *
          Math.pow(
            1 + retirementResults.pre_retirement_return,
            yearsAccumulated
          ) +
        calculateFutureSavedAmount(
          idealMonthlySavings,
          retirementResults.pre_retirement_return,
          yearsAccumulated
        );
      idealAccumulation.push(idealAmount);
    } else {
      accumulation.push(null);
      retirement.push(point.amount);
      idealAccumulation.push(null);
    }
  });

  // Create chart
  window[`timelineChart_${tabId}`] = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Projected Accumulation",
          data: accumulation,
          borderColor: "rgba(59, 130, 246, 1)", // Blue
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: true,
          tension: 0.1,
        },
        {
          label: "Projected Retirement",
          data: retirement,
          borderColor: "rgba(16, 185, 129, 1)", // Green
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          fill: true,
          tension: 0.1,
        },
        {
          label: "Ideal Accumulation",
          data: idealAccumulation,
          borderColor: "rgba(251, 191, 36, 1)", // Amber
          backgroundColor: "transparent",
          borderDashed: [5, 5],
          fill: false,
          tension: 0.1,
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
              return "₹" + value.toLocaleString();
            },
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              const value = context.raw;
              return context.dataset.label + ": " + formatCurrency(value);
            },
          },
        },
      },
    },
  });

  // Update timeline insights
  const timelineInsight = document.getElementById(`timeline-insight-${tabId}`);
  if (timelineInsight) {
    // Calculate corpus gap at retirement
    const idealCorpus = retirementResults.total_corpus_required;
    const projectedCorpus =
      retirementResults.future_value_of_current_savings +
      calculateFutureSavedAmount(
        actualMonthlySavings,
        retirementResults.pre_retirement_return,
        yearsToRetirement
      );

    const corpusGap = idealCorpus - projectedCorpus;

    if (corpusGap <= 0) {
      // Surplus case
      timelineInsight.innerHTML = `
        <div class="font-medium text-green-700">Your projected retirement savings exceeds your target!</div>
        <p>At your current savings rate, you're on track to accumulate ${formatCurrency(
          projectedCorpus
        )} 
        by age ${userData.retirementAge}, which is ${formatCurrency(
        Math.abs(corpusGap)
      )} more than your target.</p>
      `;
    } else {
      // Gap case
      timelineInsight.innerHTML = `
        <div class="font-medium text-${
          corpusGap > idealCorpus * 0.3 ? "red" : "yellow"
        }-700">
          Mind the gap: ${formatCurrency(corpusGap)}
        </div>
        <p>At your current savings rate, you're projected to accumulate ${formatCurrency(
          projectedCorpus
        )} 
        by age ${userData.retirementAge}, which is ${formatCurrency(
        corpusGap
      )} less than your target of 
        ${formatCurrency(idealCorpus)}. The gap represents ${Math.round(
        (corpusGap / idealCorpus) * 100
      )}% 
        of your needed retirement corpus.</p>
      `;
    }
  }
}

/**
 * Initializes the interactive tradeoff simulator with current values
 *
 * @param {string} tabId ID of the tab
 * @param {Object} userData User profile information
 * @param {Object} budgetResults Budget allocation results
 * @param {Object} retirementResults Retirement planning results
 */
function initializeTradeoffSimulator(
  tabId,
  userData,
  budgetResults,
  retirementResults
) {
  // Get current values
  const currentDiscretionary = budgetResults.discretionary;
  const currentRetirement = retirementResults.recommended_monthly_savings;

  // Set max slider value based on discretionary amount and considering minimal lifestyle needs
  // This ensures we don't reduce discretionary below what's needed for basic quality of life
  const slider = document.getElementById(`tradeoff-slider-${tabId}`);
  if (slider) {
    // Calculate minimum discretionary needed for basic lifestyle (estimated at 30% of current)
    const minDiscretionary = currentDiscretionary * 0.3;

    // Maximum discretionary that can be reallocated
    const maxReallocation = currentDiscretionary - minDiscretionary;

    // Calculate percentage of discretionary that can be shifted
    const maxPercentage = Math.min(
      100,
      Math.floor((maxReallocation / currentDiscretionary) * 100)
    );

    slider.max = maxPercentage;
    slider.value = 0;
  }

  // Update current allocation display
  const currentDiscretionaryElem = document.getElementById(
    `current-discretionary-${tabId}`
  );
  const currentRetirementElem = document.getElementById(
    `current-retirement-${tabId}`
  );

  if (currentDiscretionaryElem) {
    currentDiscretionaryElem.textContent = formatCurrency(currentDiscretionary);
  }

  if (currentRetirementElem) {
    currentRetirementElem.textContent = formatCurrency(currentRetirement);
  }

  // Initialize simulated values to match current values
  const simulatedDiscretionaryElem = document.getElementById(
    `simulated-discretionary-${tabId}`
  );
  const simulatedRetirementElem = document.getElementById(
    `simulated-retirement-${tabId}`
  );

  if (simulatedDiscretionaryElem) {
    simulatedDiscretionaryElem.textContent =
      formatCurrency(currentDiscretionary);
  }

  if (simulatedRetirementElem) {
    simulatedRetirementElem.textContent = formatCurrency(currentRetirement);
  }

  // Calculate and display current lifestyle quality and retirement funding
  updateInitialSimulatedMetrics(
    tabId,
    userData,
    budgetResults,
    retirementResults
  );
}

/**
 * Updates the initial simulated metrics display
 *
 * @param {string} tabId ID of the tab
 * @param {Object} userData User profile information
 * @param {Object} budgetResults Budget allocation results
 * @param {Object} retirementResults Retirement planning results
 */
function updateInitialSimulatedMetrics(
  tabId,
  userData,
  budgetResults,
  retirementResults
) {
  // Calculate current lifestyle quality based on more sophisticated approach
  const lifestyleQuality = calculateLifestyleQuality(userData, budgetResults);

  // Calculate current retirement funding percentage
  const fundingPercentage = calculateRetirementFundingPercentage(
    userData,
    retirementResults
  );

  // Update simulated metrics display
  const simulatedLifestyleElem = document.getElementById(
    `simulated-lifestyle-${tabId}`
  );
  const lifestyleChangeElem = document.getElementById(
    `lifestyle-change-${tabId}`
  );
  const simulatedFundingElem = document.getElementById(
    `simulated-funding-${tabId}`
  );
  const fundingChangeElem = document.getElementById(`funding-change-${tabId}`);

  if (simulatedLifestyleElem) {
    simulatedLifestyleElem.textContent = `${Math.round(lifestyleQuality)}%`;
  }

  if (lifestyleChangeElem) {
    lifestyleChangeElem.textContent = `(+0%)`;
    lifestyleChangeElem.className = "text-sm ml-2 text-gray-500";
  }

  if (simulatedFundingElem) {
    simulatedFundingElem.textContent = `${Math.round(fundingPercentage)}%`;
  }

  if (fundingChangeElem) {
    fundingChangeElem.textContent = `(+0%)`;
    fundingChangeElem.className = "text-sm ml-2 text-gray-500";
  }
}

/**
 * Updates the tradeoff simulation based on slider value
 *
 * @param {string} tabId ID of the tab
 * @param {number} sliderValue Percentage value from slider
 */
function updateTradeoffSimulation(tabId, sliderValue) {
  // Get calculation results
  if (!window.calculationResults) return;

  const { userData, budgetResults, retirementResults } =
    window.calculationResults;

  // Update slider value display
  const sliderValueElem = document.getElementById(`slider-value-${tabId}`);
  if (sliderValueElem) {
    sliderValueElem.textContent = `${sliderValue}%`;
  }

  // Get current values
  const currentDiscretionary = budgetResults.discretionary;
  const currentRetirement = retirementResults.recommended_monthly_savings;
  const requiredRetirement = retirementResults.required_monthly_savings;

  // Calculate adjustment amount
  const adjustmentAmount = (sliderValue / 100) * currentDiscretionary;

  // Calculate new values
  const newDiscretionary = currentDiscretionary - adjustmentAmount;
  const newRetirement = currentRetirement + adjustmentAmount;

  // Update simulated allocation display
  const simulatedDiscretionaryElem = document.getElementById(
    `simulated-discretionary-${tabId}`
  );
  const simulatedRetirementElem = document.getElementById(
    `simulated-retirement-${tabId}`
  );

  if (simulatedDiscretionaryElem) {
    simulatedDiscretionaryElem.textContent = formatCurrency(newDiscretionary);
  }

  if (simulatedRetirementElem) {
    simulatedRetirementElem.textContent = formatCurrency(newRetirement);
  }

  // Create modified budget and retirement results for simulation
  const simulatedBudgetResults = {
    ...budgetResults,
    discretionary: newDiscretionary,
  };
  const simulatedRetirementResults = {
    ...retirementResults,
    recommended_monthly_savings: newRetirement,
  };

  // Calculate new lifestyle quality based on sophisticated approach
  const currentLifestyleQuality = calculateLifestyleQuality(
    userData,
    budgetResults
  );
  const newLifestyleQuality = calculateLifestyleQuality(
    userData,
    simulatedBudgetResults
  );

  // Calculate current and new retirement funding percentage
  const currentFundingPercentage = calculateRetirementFundingPercentage(
    userData,
    retirementResults
  );
  const newFundingPercentage = calculateRetirementFundingPercentage(
    userData,
    simulatedRetirementResults
  );

  // Calculate changes
  const lifestyleChange = newLifestyleQuality - currentLifestyleQuality;
  const fundingChange = newFundingPercentage - currentFundingPercentage;

  // Update simulated metrics display
  const simulatedLifestyleElem = document.getElementById(
    `simulated-lifestyle-${tabId}`
  );
  const lifestyleChangeElem = document.getElementById(
    `lifestyle-change-${tabId}`
  );
  const simulatedFundingElem = document.getElementById(
    `simulated-funding-${tabId}`
  );
  const fundingChangeElem = document.getElementById(`funding-change-${tabId}`);

  if (simulatedLifestyleElem) {
    simulatedLifestyleElem.textContent = `${Math.round(newLifestyleQuality)}%`;
  }

  if (lifestyleChangeElem) {
    lifestyleChangeElem.textContent = `(${
      lifestyleChange >= 0 ? "+" : ""
    }${Math.round(lifestyleChange)}%)`;

    if (lifestyleChange < 0) {
      lifestyleChangeElem.className = "text-sm ml-2 text-red-500";
    } else if (lifestyleChange > 0) {
      lifestyleChangeElem.className = "text-sm ml-2 text-green-500";
    } else {
      lifestyleChangeElem.className = "text-sm ml-2 text-gray-500";
    }
  }

  if (simulatedFundingElem) {
    simulatedFundingElem.textContent = `${Math.round(newFundingPercentage)}%`;
  }

  if (fundingChangeElem) {
    fundingChangeElem.textContent = `(${
      fundingChange >= 0 ? "+" : ""
    }${Math.round(fundingChange)}%)`;

    if (fundingChange < 0) {
      fundingChangeElem.className = "text-sm ml-2 text-red-500";
    } else if (fundingChange > 0) {
      fundingChangeElem.className = "text-sm ml-2 text-green-500";
    } else {
      fundingChangeElem.className = "text-sm ml-2 text-gray-500";
    }
  }

  // Apply button styling based on whether this improves overall balance
  const applyButton = document.getElementById(`apply-tradeoff-btn-${tabId}`);
  if (applyButton) {
    if (fundingChange > 0 && lifestyleChange >= -10) {
      // Positive change - improved balance
      applyButton.className =
        "px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700";
    } else if (fundingChange < 0 || lifestyleChange < -10) {
      // Negative change - worse balance
      applyButton.className =
        "px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700";
    } else {
      // Neutral change
      applyButton.className =
        "px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700";
    }
  }
}

/**
 * Applies the simulated tradeoff to the actual budget
 * This function would update the budget allocation and recalculate everything
 *
 * @param {string} tabId ID of the tab
 */
function applyTradeoffSimulation(tabId) {
  // Get slider value
  const slider = document.getElementById(`tradeoff-slider-${tabId}`);
  if (!slider) return;

  const sliderValue = parseInt(slider.value);

  // If slider value is 0, no changes needed
  if (sliderValue === 0) {
    alert("No changes to apply. Adjust the slider to make changes.");
    return;
  }

  // Get current calculation results
  if (!window.calculationResults) return;

  const { userData, budgetResults, retirementResults } =
    window.calculationResults;

  // Calculate adjustment amount
  const adjustmentAmount = (sliderValue / 100) * budgetResults.discretionary;

  // Adjust budget allocation (this would need to be integrated with the main application's functions)
  // For now, we'll simulate this by displaying a message
  alert(
    `This would adjust your budget to shift ${formatCurrency(
      adjustmentAmount
    )} from discretionary spending to retirement savings. In a full implementation, this would update your budget and recalculate all numbers.`
  );

  // Reset slider to 0
  slider.value = 0;
  updateTradeoffSimulation(tabId, 0);
}

// === HELPER FUNCTIONS ===

/**
 * Formats a currency amount for display
 *
 * @param {number} amount The amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
  if (isNaN(amount)) return "₹0";

  if (amount >= 10000000) {
    return "₹" + (amount / 10000000).toFixed(2) + " Cr";
  } else if (amount >= 100000) {
    return "₹" + (amount / 100000).toFixed(2) + " Lakh";
  } else if (amount >= 1000) {
    return "₹" + (amount / 1000).toFixed(1) + "K";
  } else {
    return "₹" + amount.toFixed(0);
  }
}

/**
 * Calculates the future value of a monthly investment amount
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

// === MAIN INITIALIZATION FUNCTION ===

/**
 * Main function to be called to initialize the tradeoff visualizer
 * Adds the visualizer to both budget and retirement tabs
 */
function addTradeoffVisualizer() {
  // Initialize the visualizer
  initializeTradeoffVisualizer();

  // If calculation results are already available, update visualizers
  if (window.calculationResults) {
    const { userData, budgetResults, retirementResults } =
      window.calculationResults;
    updateTradeoffVisualizer(userData, budgetResults, retirementResults);
  }
}

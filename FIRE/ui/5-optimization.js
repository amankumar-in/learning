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
          <div class="font-medium">${formatCurrency(
            opportunity.benchmark
          )}</div>
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
                ${
                  rec.effort.charAt(0).toUpperCase() + rec.effort.slice(1)
                } effort
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

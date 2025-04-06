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
                <p class="text-sm font-medium text-indigo-600">${
                  phase.focus
                }</p>
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

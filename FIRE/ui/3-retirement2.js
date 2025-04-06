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

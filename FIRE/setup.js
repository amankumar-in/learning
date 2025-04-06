// === INITIALIZATION AND SETUP ===

document.addEventListener("DOMContentLoaded", function () {
  // Initialize the application
  initApp();
});

function initApp() {
  // Set up form navigation
  setupFormNavigation();

  // Set up event listeners
  setupEventListeners();

  // Set up dynamic form elements
  setupDynamicFormElements();
}

// === FORM NAVIGATION AND UI INTERACTIONS ===

function setupFormNavigation() {
  // Next buttons
  const nextButtons = document.querySelectorAll(".btn-next");
  nextButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const currentStep = this.closest(".form-step");
      const currentStepNum = parseInt(currentStep.dataset.step);
      const nextStepNum = currentStepNum + 1;
      const nextStep = document.querySelector(
        `.form-step[data-step="${nextStepNum}"]`
      );

      // Validate current step before proceeding
      if (validateStep(currentStepNum)) {
        currentStep.classList.remove("active");
        nextStep.classList.add("active");

        // Update progress indicator
        document
          .querySelector(`.progress-step[data-step="${currentStepNum}"]`)
          .classList.add("completed");
        document
          .querySelector(`.progress-step[data-step="${nextStepNum}"]`)
          .classList.add("active");
      }
    });
  });

  // Previous buttons
  const prevButtons = document.querySelectorAll(".btn-prev");
  prevButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const currentStep = this.closest(".form-step");
      const currentStepNum = parseInt(currentStep.dataset.step);
      const prevStepNum = currentStepNum - 1;
      const prevStep = document.querySelector(
        `.form-step[data-step="${prevStepNum}"]`
      );

      currentStep.classList.remove("active");
      prevStep.classList.add("active");

      // Update progress indicator
      document
        .querySelector(`.progress-step[data-step="${currentStepNum}"]`)
        .classList.remove("active");
      document
        .querySelector(`.progress-step[data-step="${prevStepNum}"]`)
        .classList.add("active");
    });
  });

  // Calculate button
  const calculateBtn = document.getElementById("calculate-btn");
  calculateBtn.addEventListener("click", function () {
    const currentStep = this.closest(".form-step");
    const currentStepNum = parseInt(currentStep.dataset.step);
    const nextStepNum = currentStepNum + 1;
    const nextStep = document.querySelector(
      `.form-step[data-step="${nextStepNum}"]`
    );

    if (validateStep(currentStepNum)) {
      // Calculate everything
      calculateResults();

      // Show results
      currentStep.classList.remove("active");
      nextStep.classList.add("active");

      // Update progress indicator
      document
        .querySelector(`.progress-step[data-step="${currentStepNum}"]`)
        .classList.add("completed");
      document
        .querySelector(`.progress-step[data-step="${nextStepNum}"]`)
        .classList.add("active");
    }
  });

  // Tab navigation
  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const tabName = this.dataset.tab;

      // Update active tab button
      document.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.classList.remove("active");
      });
      this.classList.add("active");

      // Show selected tab content
      document.querySelectorAll(".tab-content").forEach((content) => {
        content.classList.remove("active");
      });
      document.getElementById(`${tabName}-tab`).classList.add("active");
    });
  });

  // Start over button
  const startOverBtn = document.getElementById("start-over");
  startOverBtn.addEventListener("click", function () {
    if (
      confirm(
        "Are you sure you want to start over? All your data will be reset."
      )
    ) {
      resetForm();

      // Show first step
      document.querySelectorAll(".form-step").forEach((step) => {
        step.classList.remove("active");
      });
      document
        .querySelector('.form-step[data-step="1"]')
        .classList.add("active");

      // Reset progress indicator
      document.querySelectorAll(".progress-step").forEach((step) => {
        step.classList.remove("active", "completed");
      });
      document
        .querySelector('.progress-step[data-step="1"]')
        .classList.add("active");
    }
  });

  // Recalculate button
  const recalculateBtn = document.getElementById("recalculate");
  recalculateBtn.addEventListener("click", function () {
    // Go back to step 1
    document.querySelectorAll(".form-step").forEach((step) => {
      step.classList.remove("active");
    });
    document.querySelector('.form-step[data-step="1"]').classList.add("active");

    // Reset progress indicator
    document.querySelectorAll(".progress-step").forEach((step) => {
      step.classList.remove("active", "completed");
    });
    document
      .querySelector('.progress-step[data-step="1"]')
      .classList.add("active");
  });
}

function setupEventListeners() {
  // Family size changes
  const familySizeInput = document.getElementById("family-size");
  familySizeInput.addEventListener("change", function () {
    updateFamilyComposition();
  });

  // Housing status changes
  const housingStatusSelect = document.getElementById("housing-status");
  housingStatusSelect.addEventListener("change", function () {
    const emiSection = document.getElementById("housing-loan-section");
    if (this.value === "loan") {
      emiSection.classList.remove("hidden");
    } else {
      emiSection.classList.add("hidden");
    }
  });

  // Export PDF button
  const exportPdfBtn = document.getElementById("export-pdf");
  exportPdfBtn.addEventListener("click", function () {
    generatePDF();
  });

  // Priority selection
  const priorityOptions = document.querySelectorAll(".priority-option");
  priorityOptions.forEach((option) => {
    option.addEventListener("click", function () {
      const radioInput = this.querySelector('input[type="radio"]');
      radioInput.checked = true;

      // Update UI
      document.querySelectorAll(".priority-option").forEach((opt) => {
        opt.classList.remove("selected");
      });
      this.classList.add("selected");
    });
  });

  // Risk tolerance selection
  const riskOptions = document.querySelectorAll(".risk-option");
  riskOptions.forEach((option) => {
    option.addEventListener("click", function () {
      const radioInput = this.querySelector('input[type="radio"]');
      radioInput.checked = true;

      // Update UI
      document.querySelectorAll(".risk-option").forEach((opt) => {
        opt.classList.remove("selected");
      });
      this.classList.add("selected");
    });
  });

  // Tax regime selection
  const taxOptions = document.querySelectorAll(".tax-option");
  taxOptions.forEach((option) => {
    option.addEventListener("click", function () {
      const radioInput = this.querySelector('input[type="radio"]');
      radioInput.checked = true;

      // Update UI
      document.querySelectorAll(".tax-option").forEach((opt) => {
        opt.classList.remove("selected");
      });
      this.classList.add("selected");
    });
  });
}

function setupDynamicFormElements() {
  // Initialize family composition based on default value
  updateFamilyComposition();
}

function updateFamilyComposition() {
  const familySize =
    parseInt(document.getElementById("family-size").value) || 1;
  const container = document.getElementById("family-members-container");
  const familyCompositionSection = document.querySelector(
    ".family-composition"
  );

  // Show family composition section if more than 1 member
  if (familySize > 1) {
    familyCompositionSection.classList.remove("hidden");
  } else {
    familyCompositionSection.classList.add("hidden");
    return;
  }

  // Clear existing members
  container.innerHTML = "";

  // Self is always the first member
  const selfMember = document.createElement("div");
  selfMember.classList.add("family-member");
  selfMember.innerHTML = `
        <div class="grid grid-cols-3 gap-4">
            <div class="form-group">
                <label>Relationship</label>
                <input type="text" value="Self" disabled class="form-input">
            </div>
            <div class="form-group">
                <label for="self-age">Age</label>
                <input type="number" id="self-age" class="form-input" value="${
                  document.getElementById("age").value
                }" disabled>
            </div>
            <div class="form-group">
                <label for="self-dependent">Dependent</label>
                <select id="self-dependent" class="form-select" disabled>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                </select>
            </div>
        </div>
    `;
  container.appendChild(selfMember);

  // Add other family members
  for (let i = 2; i <= familySize; i++) {
    const member = document.createElement("div");
    member.classList.add("family-member");
    member.innerHTML = `
            <div class="grid grid-cols-3 gap-4">
                <div class="form-group">
                    <label for="member-${i}-relationship">Relationship</label>
                    <select id="member-${i}-relationship" class="form-select">
                        <option value="spouse">Spouse</option>
                        <option value="child">Child</option>
                        <option value="parent">Parent</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="member-${i}-age">Age</label>
                    <input type="number" id="member-${i}-age" min="0" max="120" class="form-input">
                </div>
                <div class="form-group">
                    <label for="member-${i}-dependent">Dependent</label>
                    <select id="member-${i}-dependent" class="form-select">
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                    </select>
                </div>
            </div>
        `;
    container.appendChild(member);
  }
}

// Add to setupEventListeners() function in setup.js
// After the existing priority options event listener

/**
 * Updates the priority explanation based on selection and income tier
 */
function updatePriorityExplanation(priority) {
  const explanationPanel = document.getElementById("priority-explanation");
  if (!explanationPanel) return;

  explanationPanel.classList.remove("hidden");

  // Get user data if available
  const income =
    parseFloat(document.getElementById("monthly-income").value) || 50000;
  const incomeTier = determineIncomeTier(income);

  // Get template
  const template = PRIORITY_TEMPLATES[priority];
  if (!template) return;

  // Get income-specific description
  const tierDesc =
    template.income_tier_adjustments[incomeTier]?.description ||
    template.description;

  // Get lifestyle impact
  let lifestyleImpact = "";
  if (incomeTier === "VERY_LOW" || incomeTier === "LOW") {
    lifestyleImpact =
      template.lifestyle_impact.VERY_LOW || template.lifestyle_impact.LOW;
  } else if (incomeTier === "LOWER_MIDDLE" || incomeTier === "MIDDLE") {
    lifestyleImpact = template.lifestyle_impact.MIDDLE;
  } else {
    lifestyleImpact = template.lifestyle_impact.HIGH;
  }

  // Update content
  document.getElementById("priority-explanation-title").textContent =
    template.title;
  document.getElementById("priority-explanation-text").innerHTML = `
    <p class="mb-2">${tierDesc}</p>
    <p class="text-sm italic">${lifestyleImpact}</p>
  `;

  // Update allocation guides
  if (priority === "future_focused") {
    document.getElementById("priority-retirement-value").innerHTML =
      '<span class="text-green-700">↑ Higher Priority</span>';
    document.getElementById("priority-shortterm-value").innerHTML =
      '<span class="text-green-700">↑ Higher Priority</span>';
    document.getElementById("priority-discretionary-value").innerHTML =
      '<span class="text-red-700">↓ Lower Priority</span>';
  } else if (priority === "current_focused") {
    document.getElementById("priority-retirement-value").innerHTML =
      '<span class="text-red-700">↓ Lower Priority</span>';
    document.getElementById("priority-shortterm-value").innerHTML =
      '<span class="text-red-700">↓ Lower Priority</span>';
    document.getElementById("priority-discretionary-value").innerHTML =
      '<span class="text-green-700">↑ Higher Priority</span>';
  } else {
    document.getElementById("priority-retirement-value").innerHTML =
      '<span class="text-blue-700">Balanced Approach</span>';
    document.getElementById("priority-shortterm-value").innerHTML =
      '<span class="text-blue-700">Balanced Approach</span>';
    document.getElementById("priority-discretionary-value").innerHTML =
      '<span class="text-blue-700">Balanced Approach</span>';
  }

  // Add real-world examples relevant to income level
  let examplesHTML = '<div class="mt-3 text-xs p-2 bg-gray-100 rounded">';

  if (priority === "future_focused") {
    if (incomeTier === "VERY_LOW" || incomeTier === "LOW") {
      examplesHTML +=
        "Example: You might choose public transportation over ride-sharing or cook at home instead of ordering food, directing the savings to your future.";
    } else if (incomeTier === "MIDDLE") {
      examplesHTML +=
        "Example: You might choose a modest vehicle instead of a luxury model, live in a comfortable but not extravagant home, and invest the difference.";
    } else {
      examplesHTML +=
        "Example: You might delay upgrading to premium luxury items, choose selective high-value experiences over constant indulgence, and maximize tax-advantaged investing.";
    }
  } else if (priority === "current_focused") {
    if (incomeTier === "VERY_LOW" || incomeTier === "LOW") {
      examplesHTML +=
        "Example: You might allow for occasional dining out or entertainment while still maintaining minimum saving habits for future stability.";
    } else if (incomeTier === "MIDDLE") {
      examplesHTML +=
        "Example: You might choose a nicer apartment, dine out more frequently, or pursue hobbies that enhance your daily life, while still saving at minimum recommended levels.";
    } else {
      examplesHTML +=
        "Example: You might upgrade your home, car, or lifestyle sooner rather than later, travel more frequently, or pursue premium experiences while maintaining basic wealth building.";
    }
  } else {
    if (incomeTier === "VERY_LOW" || incomeTier === "LOW") {
      examplesHTML +=
        "Example: You balance small consistent savings with occasional modest treats, building financial security without feeling completely deprived.";
    } else if (incomeTier === "MIDDLE") {
      examplesHTML +=
        "Example: You save consistently for retirement while enjoying moderate lifestyle pleasures like occasional travel, dining out weekly, and comfortable housing.";
    } else {
      examplesHTML +=
        "Example: You build significant wealth through consistent investing while also enjoying premium experiences, quality products, and lifestyle enhancements that matter to you.";
    }
  }

  examplesHTML += "</div>";
  document.getElementById("priority-explanation-text").innerHTML +=
    examplesHTML;

  // Add guidance on system constraints
  if (
    (priority === "current_focused" &&
      (incomeTier === "VERY_LOW" || incomeTier === "LOW")) ||
    (priority === "future_focused" &&
      (incomeTier === "HIGH" || incomeTier === "ULTRA_HIGH"))
  ) {
    let constraintHTML =
      '<div class="mt-3 text-xs p-2 bg-yellow-50 text-yellow-800 rounded">';

    if (
      priority === "current_focused" &&
      (incomeTier === "VERY_LOW" || incomeTier === "LOW")
    ) {
      constraintHTML +=
        "<strong>Note:</strong> At your income level, minimum savings requirements may limit how much you can allocate to discretionary spending, even with this priority selection.";
    } else if (
      priority === "future_focused" &&
      (incomeTier === "HIGH" || incomeTier === "ULTRA_HIGH")
    ) {
      constraintHTML +=
        "<strong>Note:</strong> At your income level, maximum contribution caps may limit how much you can allocate to retirement, even with this priority selection.";
    }

    constraintHTML += "</div>";
    document.getElementById("priority-explanation-text").innerHTML +=
      constraintHTML;
  }
}

// Call once on initialization with default value
const defaultPriority = document.querySelector(
  'input[name="priority"]:checked'
).value;
updatePriorityExplanation(defaultPriority);

// === VALIDATION ===

function validateStep(stepNumber) {
  let isValid = true;

  switch (stepNumber) {
    case 1:
      // Basic Profile validation
      const age = parseInt(document.getElementById("age").value);
      const retirementAge = parseInt(
        document.getElementById("retirement-age").value
      );
      const location = document.getElementById("location").value;

      if (!age || age < 18 || age > 75) {
        showError("Please enter a valid age between 18 and 75.");
        isValid = false;
      } else if (!retirementAge || retirementAge <= age || retirementAge > 80) {
        showError(
          "Please enter a valid retirement age greater than your current age and up to 80."
        );
        isValid = false;
      } else if (!location) {
        showError("Please select your location.");
        isValid = false;
      }
      break;

    case 2:
      // Financial Information validation
      const monthlyIncome = parseFloat(
        document.getElementById("monthly-income").value
      );
      const housingStatus = document.getElementById("housing-status").value;
      const housingEmiSection = document.getElementById("housing-loan-section");

      if (!monthlyIncome || monthlyIncome < 5000) {
        showError("Please enter a valid monthly income (minimum ₹5,000).");
        isValid = false;
      } else if (
        housingStatus === "loan" &&
        !housingEmiSection.classList.contains("hidden")
      ) {
        const housingEmi = parseFloat(
          document.getElementById("housing-emi").value
        );
        if (!housingEmi && housingEmi !== 0) {
          showError("Please enter your current housing EMI amount.");
          isValid = false;
        }
      }
      break;

    case 3:
      // All inputs in this step are optional or pre-selected
      break;
  }

  return isValid;
}

function showError(message) {
  alert(message); // Basic error display, could be improved with a nicer UI element
}

function resetForm() {
  // Reset all form fields
  document
    .querySelectorAll('input:not([type="radio"]), select')
    .forEach((input) => {
      input.value = "";
    });

  // Reset radio buttons to defaults
  document.getElementById("priority-balanced").checked = true;
  document.getElementById("risk-moderate").checked = true;
  document.getElementById("tax-old").checked = true;

  // Reset UI states
  document.getElementById("housing-loan-section").classList.add("hidden");
  document.querySelector(".family-composition").classList.add("hidden");
}

// === DATA COLLECTION AND PROCESSING ===

function calculateResults() {
  // Collect user inputs
  const userData = collectUserInputs();

  // Determine income tier for applying different strategies
  userData.incomeTier = determineIncomeTier(userData.monthlyIncome);

  // Calculate budget allocation
  const budgetResults = calculateBudgetAllocation(userData);

  // Calculate retirement corpus
  const retirementResults = calculateRetirementCorpus(userData, budgetResults);

  // UPDATE: Synchronize budget results with retirement calculation
  budgetResults.retirement_savings =
    retirementResults.recommended_monthly_savings;
  budgetResults.total_savings =
    retirementResults.recommended_monthly_savings +
    budgetResults.short_term_savings;
  budgetResults.total_budget =
    budgetResults.total_essentials +
    budgetResults.total_savings +
    budgetResults.discretionary;

  // Recalculate metrics after update
  budgetResults.metrics.savings_rate =
    budgetResults.total_savings / userData.monthlyIncome;
  budgetResults.metrics.retirement_rate =
    budgetResults.retirement_savings / userData.monthlyIncome;

  // Calculate investment recommendations with updated retirement savings
  const investmentResults = calculateInvestmentRecommendations(
    userData,
    retirementResults
  );

  // Calculate optimization opportunities
  const optimizationResults = calculateOptimizationOpportunities(
    userData,
    budgetResults
  );

  // Store results for access across the application
  window.calculationResults = {
    userData,
    budgetResults,
    retirementResults,
    investmentResults,
    optimizationResults,
  };

  // Update the UI with all results
  updateResultsUI(
    userData,
    budgetResults,
    retirementResults,
    investmentResults,
    optimizationResults
  );
}

function collectUserInputs() {
  return {
    // Personal Info
    age: parseInt(document.getElementById("age").value),
    retirementAge: parseInt(document.getElementById("retirement-age").value),
    lifeExpectancy:
      parseInt(document.getElementById("life-expectancy").value) || 85,
    familySize: parseInt(document.getElementById("family-size").value) || 1,
    location: document.getElementById("location").value,
    locationTier: getLocationTier(document.getElementById("location").value),

    // Financial Info
    monthlyIncome: parseFloat(document.getElementById("monthly-income").value),
    monthlyExpenses:
      parseFloat(document.getElementById("monthly-expenses").value) || 0,
    currentSavings:
      parseFloat(document.getElementById("current-savings").value) || 0,
    currentDebt: parseFloat(document.getElementById("current-debt").value) || 0,
    housingStatus: document.getElementById("housing-status").value,
    housingEmi: parseFloat(document.getElementById("housing-emi").value) || 0,

    // Preferences
    financialPriority: document.querySelector('input[name="priority"]:checked')
      .value,
    riskTolerance: document.querySelector('input[name="risk"]:checked').value,
    taxRegime: document.querySelector('input[name="tax"]:checked').value,

    // Family Composition
    familyComposition: collectFamilyComposition(),
  };
}

function collectFamilyComposition() {
  const familySize =
    parseInt(document.getElementById("family-size").value) || 1;
  const familyMembers = [];

  // Self is always first member
  familyMembers.push({
    relationship: "self",
    age: parseInt(document.getElementById("age").value),
    dependent: false,
  });

  // Add other family members
  for (let i = 2; i <= familySize; i++) {
    const relationshipEl = document.getElementById(`member-${i}-relationship`);
    const ageEl = document.getElementById(`member-${i}-age`);
    const dependentEl = document.getElementById(`member-${i}-dependent`);

    if (relationshipEl && ageEl && dependentEl) {
      familyMembers.push({
        relationship: relationshipEl.value,
        age: parseInt(ageEl.value) || 0,
        dependent: dependentEl.value === "yes",
      });
    }
  }

  return familyMembers;
}

function getLocationTier(location) {
  const tier1Cities = [
    "mumbai",
    "delhi",
    "bangalore",
    "chennai",
    "kolkata",
    "hyderabad",
    "pune",
  ];

  const tier2Cities = [
    "ahmedabad",
    "jaipur",
    "kochi",
    "lucknow",
    "chandigarh",
    "indore",
    "nagpur",
  ];

  if (tier1Cities.includes(location.toLowerCase())) {
    return "METRO"; // Tier 1 cities
  } else if (tier2Cities.includes(location.toLowerCase())) {
    return "TIER_2"; // Tier 2 cities
  } else {
    return "TIER_3"; // Tier 3 cities and others
  }
}

function determineIncomeTier(monthlyIncome) {
  if (monthlyIncome <= INCOME_TIERS.VERY_LOW) {
    return "VERY_LOW";
  } else if (monthlyIncome <= INCOME_TIERS.LOW) {
    return "LOW";
  } else if (monthlyIncome <= INCOME_TIERS.LOWER_MIDDLE) {
    return "LOWER_MIDDLE";
  } else if (monthlyIncome <= INCOME_TIERS.MIDDLE) {
    return "MIDDLE";
  } else if (monthlyIncome <= INCOME_TIERS.HIGH) {
    return "HIGH";
  } else {
    return "ULTRA_HIGH";
  }
}

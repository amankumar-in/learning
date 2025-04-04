/**
 * Indian Retirement & Budget Calculator
 * Version 2.0
 *
 * This is a complete rewrite focused on fixing the issues with the original implementation:
 * - Proper budget allocation based on income level
 * - Realistic retirement corpus calculations
 * - Balanced allocation between present and future needs
 * - Income-appropriate strategies (different for low/mid/high income)
 * - Adaptive calculations that don't over-allocate to retirement
 */

// === CONSTANTS AND CONFIGURATION ===

/**
 * Income tier thresholds (monthly, in rupees)
 * These define the income levels that trigger different calculation strategies
 */
const INCOME_TIERS = {
  VERY_LOW: 15000, // ₹5,000-15,000/month
  LOW: 30000, // ₹15,001-30,000/month
  LOWER_MIDDLE: 60000, // ₹30,001-60,000/month
  MIDDLE: 150000, // ₹60,001-1,50,000/month
  HIGH: 1000000, // ₹1,50,001-10,00,000/month
  ULTRA_HIGH: Infinity, // ₹10,00,000+/month
};

/**
 * Maximum allowed retirement savings as a percentage of income
 * Prevents over-allocation to retirement regardless of calculations
 */
const MAX_RETIREMENT_SAVINGS_PERCENT = {
  VERY_LOW: 0.05, // Max 5% of income for very low income
  LOW: 0.1, // Max 10% for low income
  LOWER_MIDDLE: 0.15, // Max 15% for lower middle income
  MIDDLE: 0.5, // Max 50% for middle income
  HIGH: 0.5, // Max 50% for high income
  ULTRA_HIGH: 0.5, // Max 50% for ultra high income
};

/**
 * Minimum emergency fund targets (in months of expenses)
 * Defines how many months of expenses should be saved in emergency fund
 */
const EMERGENCY_FUND_TARGETS = {
  VERY_LOW: 2, // 2 months for very low income
  LOW: 3, // 3 months for low income
  LOWER_MIDDLE: 4, // 4 months for lower middle income
  MIDDLE: 6, // 6 months for middle income
  HIGH: 9, // 9 months for high income
  ULTRA_HIGH: 12, // 12 months for ultra high income
};

/**
 * Base essential expense amounts for a family of 2 in a metro area
 * These will be adjusted based on location and family size
 */
const BASE_ESSENTIAL_EXPENSES = {
  HOUSING: 20000,
  FOOD: 15000,
  UTILITIES: 7000,
  TRANSPORT: 6000,
  HEALTHCARE: 3000,
  EDUCATION_PER_CHILD: 6000,
  PERSONAL: 4000,
  HOUSEHOLD: 5000,
};

/**
 * Location multipliers for adjusting expenses based on city tier
 */
const LOCATION_MULTIPLIERS = {
  METRO: 1.0, // Tier 1 cities
  TIER_2: 0.7, // Tier 2 cities
  TIER_3: 0.5, // Tier 3 cities and others
};

/**
 * Family size factors for adjusting expenses based on family members
 */
const FAMILY_SIZE_FACTORS = {
  1: 0.7,
  2: 1.0,
  3: 1.2,
  4: 1.4,
  5: 1.5,
  // For families larger than 5, use formula: 1.5 + 0.1 * (N-5)
};

/**
 * Retirement savings rate based on years to retirement
 * These are baseline rates that may be adjusted based on income level and priorities
 */
const RETIREMENT_SAVINGS_RATES = {
  LESS_THAN_10_YEARS: 0.4, // 40% if less than 10 years to retirement
  LESS_THAN_20_YEARS: 0.3, // 30% if 10-20 years to retirement
  LESS_THAN_30_YEARS: 0.25, // 25% if 20-30 years to retirement
  MORE_THAN_30_YEARS: 0.2, // 20% if more than 30 years to retirement
};

/**
 * Minimum savings rates based on income level
 * These ensure a minimum savings percentage regardless of other calculations
 */
const MINIMUM_SAVINGS_RATES = {
  VERY_LOW: 0.02, // 2% minimum for very low income
  LOW: 0.05, // 5% minimum for low income
  LOWER_MIDDLE: 0.1, // 10% minimum for lower middle income
  MIDDLE: 0.15, // 15% minimum for middle income
  HIGH: 0.2, // 20% minimum for high income
  ULTRA_HIGH: 0.25, // 25% minimum for ultra high income
};

/**
 * Investment return rate assumptions based on risk profile
 */
const INVESTMENT_RETURN_RATES = {
  CONSERVATIVE: {
    PRE_RETIREMENT: 0.07, // 7% annual return before retirement
    POST_RETIREMENT: 0.05, // 5% annual return during retirement
  },
  MODERATE: {
    PRE_RETIREMENT: 0.09, // 9% annual return before retirement
    POST_RETIREMENT: 0.06, // 6% annual return during retirement
  },
  AGGRESSIVE: {
    PRE_RETIREMENT: 0.11, // 11% annual return before retirement
    POST_RETIREMENT: 0.07, // 7% annual return during retirement
  },
};

/**
 * Safe withdrawal rates during retirement based on risk profile
 */
const SAFE_WITHDRAWAL_RATES = {
  CONSERVATIVE: 0.025, // 2.5% safe withdrawal rate
  MODERATE: 0.03, // 3.0% safe withdrawal rate
  AGGRESSIVE: 0.035, // 3.5% safe withdrawal rate
};

/**
 * Inflation rate assumptions for different expense categories
 */
const INFLATION_RATES = {
  GENERAL: 0.04, // 4% for general expenses
  HOUSING: 0.05, // 5% for housing
  FOOD: 0.04, // 4% for food
  HEALTHCARE: 0.07, // 7% for healthcare
};

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

  // Calculate investment recommendations
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

// === BUDGET ALLOCATION ENGINE ===

function calculateBudgetAllocation(userData) {
  // Step 1: Calculate Base Essential Expenses
  const locationMultiplier = LOCATION_MULTIPLIERS[userData.locationTier];
  let familySizeFactor;

  // Apply family size factor with special handling for large families
  if (userData.familySize <= 5) {
    familySizeFactor = FAMILY_SIZE_FACTORS[userData.familySize];
  } else {
    // For families larger than 5, use formula: 1.5 + 0.1 * (N-5)
    familySizeFactor = 1.5 + 0.1 * (userData.familySize - 5);
  }

  // Calculate base essential categories
  let housing =
    BASE_ESSENTIAL_EXPENSES.HOUSING * locationMultiplier * familySizeFactor;
  const food =
    BASE_ESSENTIAL_EXPENSES.FOOD * locationMultiplier * familySizeFactor;
  const utilities =
    BASE_ESSENTIAL_EXPENSES.UTILITIES * locationMultiplier * familySizeFactor;
  const transport =
    BASE_ESSENTIAL_EXPENSES.TRANSPORT * locationMultiplier * familySizeFactor;
  const healthcare =
    BASE_ESSENTIAL_EXPENSES.HEALTHCARE * locationMultiplier * familySizeFactor;
  const personal =
    BASE_ESSENTIAL_EXPENSES.PERSONAL * locationMultiplier * familySizeFactor;
  const household =
    BASE_ESSENTIAL_EXPENSES.HOUSEHOLD * locationMultiplier * familySizeFactor;

  // Education depends on number of children
  const childrenCount = getChildrenCount(userData.familyComposition);
  const education =
    BASE_ESSENTIAL_EXPENSES.EDUCATION_PER_CHILD *
    childrenCount *
    locationMultiplier;

  // Step 2: Apply Housing Situation Adjustments
  if (userData.housingStatus === "owned_fully") {
    // Remove rent component, add property tax and higher maintenance
    housing = housing * 0.3; // Reduces to just maintenance and taxes
  } else if (userData.housingStatus === "loan") {
    // Check if EMI is provided by user
    if (userData.housingEmi > 0) {
      housing = userData.housingEmi + housing * 0.15; // EMI + maintenance
    } else {
      // Estimate EMI based on typical home values in this location tier
      housing = estimateTypicalEmi(userData.locationTier) + housing * 0.15;
    }
  }

  // Calculate total essential expenses
  const totalEssentials =
    housing +
    food +
    utilities +
    transport +
    healthcare +
    education +
    personal +
    household;

  // Step 3: Calculate Appropriate Savings Rate
  // Get minimum savings rate based on income tier
  const minSavingsRate = MINIMUM_SAVINGS_RATES[userData.incomeTier];

  // Calculate target savings rate based on retirement goals
  const yearsToRetirement = userData.retirementAge - userData.age;
  let targetSavingsRate;

  if (yearsToRetirement < 10) {
    targetSavingsRate = RETIREMENT_SAVINGS_RATES.LESS_THAN_10_YEARS;
  } else if (yearsToRetirement < 20) {
    targetSavingsRate = RETIREMENT_SAVINGS_RATES.LESS_THAN_20_YEARS;
  } else if (yearsToRetirement < 30) {
    targetSavingsRate = RETIREMENT_SAVINGS_RATES.LESS_THAN_30_YEARS;
  } else {
    targetSavingsRate = RETIREMENT_SAVINGS_RATES.MORE_THAN_30_YEARS;
  }

  // Calculate required monthly savings for retirement
  const retirementCorpusResult = calculateRetirementCorpusQuick(
    userData,
    totalEssentials
  );
  const requiredMonthlySavings = retirementCorpusResult.requiredMonthlySavings;
  const requiredSavingsRate = requiredMonthlySavings / userData.monthlyIncome;

  // Get maximum retirement savings cap based on income tier
  const maxRetirementSavingsRate =
    MAX_RETIREMENT_SAVINGS_PERCENT[userData.incomeTier];

  // Calculate actual savings rate (capped by maximum rate)
  let actualSavingsRate = Math.max(minSavingsRate, requiredSavingsRate);
  actualSavingsRate = Math.min(actualSavingsRate, maxRetirementSavingsRate);

  // Define final retirement savings amount (capped)
  const cappedRetirementSavings = userData.monthlyIncome * actualSavingsRate;

  // Step 4: Calculate disposable income after essentials
  const disposableIncome = userData.monthlyIncome - totalEssentials;

  // Calculate minimum savings amount
  const minimumSavings = userData.monthlyIncome * minSavingsRate;

  // Initialize variables for allocations
  let retirementSavings;
  let shortTermSavings;
  let discretionary;
  let deficit = 0;

  // Calculate retirement savings based on priority
  if (userData.financialPriority === "future_focused") {
    // Future-focused: Prioritize retirement savings
    if (disposableIncome > minimumSavings) {
      retirementSavings = Math.min(
        cappedRetirementSavings,
        Math.max(requiredMonthlySavings, disposableIncome * 0.6)
      );
    } else {
      retirementSavings = minimumSavings;
    }
  } else if (userData.financialPriority === "balanced") {
    // Balanced: Equal importance to present and future
    if (disposableIncome > minimumSavings) {
      retirementSavings = Math.min(
        cappedRetirementSavings,
        Math.max(requiredMonthlySavings, disposableIncome * 0.4)
      );
    } else {
      retirementSavings = minimumSavings;
    }
  } else {
    // current_focused
    // Current-focused: Maintain minimum retirement savings
    retirementSavings = Math.min(
      cappedRetirementSavings,
      Math.max(minimumSavings, requiredMonthlySavings * 0.6)
    );
  }

  // Check if retirement savings exceeds disposable income
  if (retirementSavings > disposableIncome) {
    deficit = retirementSavings - disposableIncome;
    retirementSavings = disposableIncome;

    // Note: We always calculate short-term savings and discretionary, even with deficit
    // This addresses the bug in the original implementation
    shortTermSavings = 0;
    discretionary = 0;
  } else {
    // Calculate remaining funds for discretionary spending
    const remainingFunds = disposableIncome - retirementSavings;

    // Adjust allocations based on income tier
    const stSavingsPercent = getShortTermSavingsPercent(
      userData.incomeTier,
      userData.financialPriority
    );

    // Allocate to short-term savings and discretionary based on priority and income tier
    shortTermSavings = remainingFunds * stSavingsPercent;
    discretionary = remainingFunds * (1 - stSavingsPercent);
  }

  // Step 5: Calculate Category and Subcategory Allocations
  const housingBreakdown = {
    rent_or_emi: housing * 0.85,
    maintenance: housing * 0.1,
    property_tax: housing * 0.05,
  };

  const foodBreakdown = {
    groceries: food * 0.6,
    dairy: food * 0.15,
    eating_out: food * 0.15,
    ordering_in: food * 0.1,
  };

  const utilitiesBreakdown = {
    electricity: utilities * 0.4,
    water: utilities * 0.15,
    gas: utilities * 0.15,
    internet_cable: utilities * 0.3,
  };

  const transportBreakdown = {
    fuel: transport * 0.4,
    maintenance: transport * 0.2,
    public_transport: transport * 0.3,
    rideshare_taxi: transport * 0.1,
  };

  const healthcareBreakdown = {
    insurance: healthcare * 0.4,
    medications: healthcare * 0.2,
    doctor_visits: healthcare * 0.3,
    wellness: healthcare * 0.1,
  };

  const educationBreakdown = {
    school_fees: education * 0.7,
    supplies: education * 0.1,
    tutoring: education * 0.1,
    extracurricular: education * 0.1,
  };

  const personalBreakdown = {
    grooming: personal * 0.3,
    clothing: personal * 0.3,
    recreation: personal * 0.3,
    subscriptions: personal * 0.1,
  };

  const householdBreakdown = {
    domestic_help: household * 0.4,
    furnishings: household * 0.2,
    repairs: household * 0.2,
    supplies: household * 0.2,
  };

  // Calculate discretionary breakdown
  let discretionaryBreakdown = {};

  // Adjust discretionary allocations based on income tier
  if (userData.incomeTier === "HIGH" || userData.incomeTier === "ULTRA_HIGH") {
    // High income users get additional categories like charity
    discretionaryBreakdown = {
      entertainment: discretionary * 0.25,
      shopping: discretionary * 0.2,
      travel: discretionary * 0.2,
      gifts: discretionary * 0.1,
      charity: discretionary * 0.15,
      luxury: discretionary * 0.1,
    };
  } else if (userData.incomeTier === "MIDDLE") {
    // Middle income with some charitable giving
    discretionaryBreakdown = {
      entertainment: discretionary * 0.3,
      shopping: discretionary * 0.25,
      travel: discretionary * 0.2,
      gifts: discretionary * 0.15,
      charity: discretionary * 0.1,
    };
  } else {
    // Lower income tiers focus on basics
    discretionaryBreakdown = {
      entertainment: discretionary * 0.35,
      shopping: discretionary * 0.3,
      travel: discretionary * 0.15,
      gifts: discretionary * 0.1,
      miscellaneous: discretionary * 0.1,
    };
  }

  // Combine all categories into a budget plan
  const budget = {
    // Main category totals
    housing,
    food,
    utilities,
    transport,
    healthcare,
    education,
    personal,
    household,
    retirement_savings: retirementSavings,
    short_term_savings: shortTermSavings,
    discretionary,

    // Calculated totals
    total_essentials: totalEssentials,
    total_savings: retirementSavings + shortTermSavings,
    total_budget:
      totalEssentials + retirementSavings + shortTermSavings + discretionary,

    // Deficit if any
    deficit,

    // Category breakdowns
    category_breakdown: {
      housing: housingBreakdown,
      food: foodBreakdown,
      utilities: utilitiesBreakdown,
      transport: transportBreakdown,
      healthcare: healthcareBreakdown,
      education: educationBreakdown,
      personal: personalBreakdown,
      household: householdBreakdown,
      discretionary: discretionaryBreakdown,
    },

    // Metrics
    metrics: {
      savings_rate:
        (retirementSavings + shortTermSavings) / userData.monthlyIncome,
      essential_rate: totalEssentials / userData.monthlyIncome,
      discretionary_rate: discretionary / userData.monthlyIncome,
      retirement_rate: retirementSavings / userData.monthlyIncome,
      required_savings_rate: requiredSavingsRate,
      capped_savings_rate: actualSavingsRate,
    },

    // User's income tier for reference
    income_tier: userData.incomeTier,
    income_tier_display: getIncomeTierDisplay(userData.incomeTier),
  };

  return budget;
}

/**
 * Calculates a quick estimate of retirement corpus needs
 * This is a simplified version used during budget allocation
 * The full calculation happens in calculateRetirementCorpus()
 */
function calculateRetirementCorpusQuick(userData, totalEssentials) {
  // Use current expenses or calculated essential expenses + some discretionary
  const currentMonthlyExpenses =
    userData.monthlyExpenses > 0
      ? userData.monthlyExpenses
      : totalEssentials * 1.2; // Add 20% for discretionary

  // Apply inflation for retirement years
  const yearsToRetirement = userData.retirementAge - userData.age;
  const futureMonthlyExpenses =
    currentMonthlyExpenses *
    Math.pow(1 + INFLATION_RATES.GENERAL, yearsToRetirement);

  // For quick calculation, assume 70% of pre-retirement income needed
  const retirementMonthlyExpenses = futureMonthlyExpenses * 0.7;

  // Annual expenses
  const annualExpenses = retirementMonthlyExpenses * 12;

  // Get appropriate withdrawal rate based on risk profile
  const withdrawalRate = SAFE_WITHDRAWAL_RATES[userData.riskTolerance];

  // Calculate corpus needed
  const baseCorpus = annualExpenses / withdrawalRate;
  const buffer = annualExpenses * 2; // 2 years buffer
  const totalCorpusRequired = baseCorpus + buffer;

  // Calculate future value of current savings
  const returnRate =
    INVESTMENT_RETURN_RATES[userData.riskTolerance.toUpperCase()]
      .PRE_RETIREMENT;
  const futureValueOfCurrentSavings =
    userData.currentSavings * Math.pow(1 + returnRate, yearsToRetirement);

  // Additional corpus needed
  const additionalCorpusNeeded =
    totalCorpusRequired - futureValueOfCurrentSavings;

  // Calculate monthly savings needed
  let requiredMonthlySavings = 0;
  if (additionalCorpusNeeded > 0) {
    const monthlyRate = returnRate / 12;
    const monthsToRetirement = yearsToRetirement * 12;

    // Future value factor for regular payments
    const fvFactor =
      (Math.pow(1 + monthlyRate, monthsToRetirement) - 1) / monthlyRate;

    // Required monthly savings
    requiredMonthlySavings = additionalCorpusNeeded / fvFactor;
  }

  return {
    totalCorpusRequired,
    futureValueOfCurrentSavings,
    additionalCorpusNeeded,
    requiredMonthlySavings,
  };
}

/**
 * Gets appropriate short-term savings percentage based on income tier and financial priority
 */
function getShortTermSavingsPercent(incomeTier, financialPriority) {
  // Base percentages
  const basePercentages = {
    future_focused: {
      VERY_LOW: 0.6, // 60% to short-term, 40% to discretionary
      LOW: 0.5,
      LOWER_MIDDLE: 0.4,
      MIDDLE: 0.3,
      HIGH: 0.25,
      ULTRA_HIGH: 0.2,
    },
    balanced: {
      VERY_LOW: 0.5, // 50% to short-term, 50% to discretionary
      LOW: 0.4,
      LOWER_MIDDLE: 0.3,
      MIDDLE: 0.25,
      HIGH: 0.2,
      ULTRA_HIGH: 0.15,
    },
    current_focused: {
      VERY_LOW: 0.4, // 40% to short-term, 60% to discretionary
      LOW: 0.3,
      LOWER_MIDDLE: 0.25,
      MIDDLE: 0.2,
      HIGH: 0.15,
      ULTRA_HIGH: 0.1,
    },
  };

  return basePercentages[financialPriority][incomeTier];
}

// === UTILITY FUNCTIONS ===

function getChildrenCount(familyComposition) {
  if (!familyComposition || !Array.isArray(familyComposition)) {
    return 0;
  }

  return familyComposition.filter(
    (member) => member.relationship === "child" && member.dependent === true
  ).length;
}

function estimateTypicalEmi(locationTier) {
  // Estimated typical EMIs based on location tier
  const typicalEmis = {
    METRO: 30000, // Metro cities
    TIER_2: 20000, // Tier 2 cities
    TIER_3: 12000, // Tier 3 cities
  };

  return typicalEmis[locationTier] || 20000; // Default to Tier 2 if not found
}

function getIncomeTierDisplay(incomeTier) {
  const tierDisplays = {
    VERY_LOW: "Very Low Income",
    LOW: "Low Income",
    LOWER_MIDDLE: "Lower Middle Income",
    MIDDLE: "Middle Income",
    HIGH: "High Income",
    ULTRA_HIGH: "Ultra-High Income",
  };

  return tierDisplays[incomeTier] || "Middle Income";
}

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

function generatePDF() {
  // Placeholder function for PDF generation
  // Would need to integrate with a PDF generation library
  alert("PDF export functionality would be implemented here");
}
// ============================= part 2 below
// === RETIREMENT CORPUS CALCULATOR ===

/**
 * Calculates the retirement corpus needed and monthly savings required
 * Based on the user's inputs and financial situation
 *
 * @param {Object} userData User profile and financial information
 * @param {Object} budgetResults Budget allocation results
 * @returns {Object} Complete retirement planning calculations
 */
function calculateRetirementCorpus(userData, budgetResults) {
  // Step 1: Calculate Future Monthly Expenses
  // Get current monthly expenses (either user-provided or calculated from budget)
  const currentMonthlyExpenses =
    userData.monthlyExpenses > 0
      ? userData.monthlyExpenses
      : budgetResults.total_essentials + budgetResults.discretionary;

  // Get category-specific expenses for differential inflation
  const categoryRatio = {
    housing: budgetResults.housing / budgetResults.total_essentials,
    food: budgetResults.food / budgetResults.total_essentials,
    healthcare: budgetResults.healthcare / budgetResults.total_essentials,
  };

  const housingExpense = currentMonthlyExpenses * categoryRatio.housing;
  const foodExpense = currentMonthlyExpenses * categoryRatio.food;
  const healthcareExpense = currentMonthlyExpenses * categoryRatio.healthcare;
  const otherExpense =
    currentMonthlyExpenses - housingExpense - foodExpense - healthcareExpense;

  // Apply category-specific inflation for years until retirement
  const yearsToRetirement = userData.retirementAge - userData.age;

  // Calculate future monthly expenses by category using appropriate inflation rates
  const futureHousing =
    housingExpense * Math.pow(1 + INFLATION_RATES.HOUSING, yearsToRetirement);
  const futureFood =
    foodExpense * Math.pow(1 + INFLATION_RATES.FOOD, yearsToRetirement);
  const futureHealthcare =
    healthcareExpense *
    Math.pow(1 + INFLATION_RATES.HEALTHCARE, yearsToRetirement);
  const futureOther =
    otherExpense * Math.pow(1 + INFLATION_RATES.GENERAL, yearsToRetirement);

  // Total future monthly expenses
  let futureMonthlyExpenses =
    futureHousing + futureFood + futureHealthcare + futureOther;

  // Adjust for retirement lifestyle changes (-10% for transport, +20% for leisure, etc.)
  futureMonthlyExpenses = applyRetirementLifestyleAdjustments(
    futureMonthlyExpenses,
    userData.incomeTier,
    userData.financialPriority
  );

  // Step 2: Calculate Corpus Using Withdrawal Rate Method
  // Convert to annual expenses
  const futureAnnualExpenses = futureMonthlyExpenses * 12;

  // Get appropriate safe withdrawal rate based on risk profile
  const safeWithdrawalRate = SAFE_WITHDRAWAL_RATES[userData.riskTolerance];

  // Base corpus calculation
  const baseCorpus = futureAnnualExpenses / safeWithdrawalRate;

  // Add buffer for emergencies and healthcare (2 years of expenses)
  const buffer = futureAnnualExpenses * 2;

  // Calculate total corpus required
  const totalCorpusRequired = baseCorpus + buffer;

  // Calculate range
  const conservativeCorpus = totalCorpusRequired * 1.1; // +10%
  const optimisticCorpus = totalCorpusRequired * 0.9; // -10%

  // Step 3: Calculate Monthly Savings Required
  // Get current savings and investments
  const currentSavings = userData.currentSavings;

  // Get expected return rate before retirement based on risk profile
  const preRetirementReturn =
    INVESTMENT_RETURN_RATES[userData.riskTolerance].PRE_RETIREMENT;

  // Also get post-retirement return for later calculations
  const postRetirementReturn =
    INVESTMENT_RETURN_RATES[userData.riskTolerance].POST_RETIREMENT;

  // Calculate future value of current savings
  const futureValueOfCurrentSavings = calculateFutureValue(
    currentSavings,
    preRetirementReturn,
    yearsToRetirement
  );

  // Additional corpus needed
  const additionalCorpusNeeded = Math.max(
    0,
    totalCorpusRequired - futureValueOfCurrentSavings
  );

  // Calculate monthly savings needed
  let requiredMonthlySavings = 0;
  let excess = 0;

  if (additionalCorpusNeeded <= 0) {
    // Current savings will exceed needed corpus
    requiredMonthlySavings = 0;
    excess = Math.abs(additionalCorpusNeeded);
  } else {
    // Calculate required monthly savings
    requiredMonthlySavings = calculateRequiredMonthlySavings(
      additionalCorpusNeeded,
      preRetirementReturn,
      yearsToRetirement
    );
  }

  // Step 4: Generate Multiple Scenarios
  const scenarios = generateRetirementScenarios(
    userData,
    budgetResults,
    currentMonthlyExpenses,
    currentSavings,
    preRetirementReturn,
    postRetirementReturn,
    safeWithdrawalRate
  );

  // Step 5: Calculate Retirement Income Breakdown
  const retirementIncomeBreakdown = calculateRetirementIncomeBreakdown(
    userData,
    totalCorpusRequired,
    safeWithdrawalRate,
    futureAnnualExpenses
  );

  // Generate retirement growth projection data for visualization
  const growthProjection = calculateRetirementGrowthProjection(
    userData,
    currentSavings,
    requiredMonthlySavings,
    preRetirementReturn,
    postRetirementReturn,
    totalCorpusRequired
  );

  // Calculate retirement readiness score
  const retirementReadiness = calculateRetirementReadiness(
    userData,
    requiredMonthlySavings,
    budgetResults.retirement_savings,
    currentSavings,
    totalCorpusRequired
  );

  // Combine all results
  return {
    // Current monthly expenses
    current_monthly_expenses: currentMonthlyExpenses,

    // Future expenses
    future_monthly_expenses: futureMonthlyExpenses,
    future_annual_expenses: futureAnnualExpenses,
    category_expenses: {
      housing: futureHousing,
      food: futureFood,
      healthcare: futureHealthcare,
      other: futureOther,
    },

    // Corpus calculations
    base_corpus: baseCorpus,
    buffer: buffer,
    total_corpus_required: totalCorpusRequired,
    conservative_corpus: conservativeCorpus,
    optimistic_corpus: optimisticCorpus,

    // Savings calculations
    current_savings: currentSavings,
    future_value_of_current_savings: futureValueOfCurrentSavings,
    additional_corpus_needed: additionalCorpusNeeded,
    required_monthly_savings: requiredMonthlySavings,
    recommended_monthly_savings: Math.min(
      requiredMonthlySavings,
      userData.monthlyIncome *
        MAX_RETIREMENT_SAVINGS_PERCENT[userData.incomeTier]
    ),
    excess: excess,

    // Rate assumptions
    safe_withdrawal_rate: safeWithdrawalRate,
    pre_retirement_return: preRetirementReturn,
    post_retirement_return: postRetirementReturn,

    // Multiple scenarios
    scenarios: scenarios,

    // Retirement income breakdown
    retirement_income_breakdown: retirementIncomeBreakdown,

    // Retirement growth projections
    growth_projection: growthProjection,

    // Retirement readiness metrics
    retirement_readiness: retirementReadiness,
  };
}

/**
 * Applies lifestyle adjustments for retirement expenses
 * Different adjustment factors based on income tier and priorities
 *
 * @param {number} monthlyExpenses Future monthly expenses before adjustments
 * @param {string} incomeTier User's income tier
 * @param {string} financialPriority User's financial priority
 * @returns {number} Adjusted monthly expenses for retirement
 */
function applyRetirementLifestyleAdjustments(
  monthlyExpenses,
  incomeTier,
  financialPriority
) {
  // Base adjustment factors (representing expense reduction in retirement)
  const baseAdjustments = {
    VERY_LOW: 0.95, // 5% reduction for very low income
    LOW: 0.93, // 7% reduction for low income
    LOWER_MIDDLE: 0.9, // 10% reduction for lower middle income
    MIDDLE: 0.85, // 15% reduction for middle income
    HIGH: 0.8, // 20% reduction for high income
    ULTRA_HIGH: 0.75, // 25% reduction for ultra high income
  };

  // Further modify based on financial priority
  let priorityModifier = 0;
  if (financialPriority === "future_focused") {
    priorityModifier = -0.05; // Additional 5% reduction for future-focused
  } else if (financialPriority === "current_focused") {
    priorityModifier = 0.05; // 5% less reduction for current-focused
  }

  // Calculate final adjustment factor
  const adjustmentFactor = baseAdjustments[incomeTier] + priorityModifier;

  // Apply adjustment
  return monthlyExpenses * adjustmentFactor;
}

/**
 * Calculates future value of an investment
 *
 * @param {number} presentValue Initial investment amount
 * @param {number} rate Annual interest rate (decimal)
 * @param {number} years Number of years
 * @returns {number} Future value
 */
function calculateFutureValue(presentValue, rate, years) {
  return presentValue * Math.pow(1 + rate, years);
}

/**
 * Calculates required monthly savings to reach a target amount
 *
 * @param {number} targetAmount Amount needed
 * @param {number} rate Annual interest rate (decimal)
 * @param {number} years Number of years
 * @returns {number} Required monthly payment
 */
function calculateRequiredMonthlySavings(targetAmount, rate, years) {
  const monthlyRate = rate / 12;
  const months = years * 12;

  // Future value factor for regular payments
  const fvFactor = (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;

  // Required monthly savings
  return targetAmount / fvFactor;
}

/**
 * Generates multiple retirement scenarios for comparison
 *
 * @param {Object} userData User profile and financial information
 * @param {Object} budgetResults Budget allocation results
 * @param {number} currentMonthlyExpenses Current monthly expenses
 * @param {number} currentSavings Current savings amount
 * @param {number} preRetirementReturn Expected return rate before retirement
 * @param {number} postRetirementReturn Expected return rate during retirement
 * @param {number} safeWithdrawalRate Safe withdrawal rate
 * @returns {Object} Multiple retirement scenarios
 */
function generateRetirementScenarios(
  userData,
  budgetResults,
  currentMonthlyExpenses,
  currentSavings,
  preRetirementReturn,
  postRetirementReturn,
  safeWithdrawalRate
) {
  // Base scenario already calculated in main function
  const baseScenario = {
    name: "Base Plan",
    description: `Retirement at age ${userData.retirementAge}`,
    retirement_age: userData.retirementAge,
    life_expectancy: userData.lifeExpectancy,
    monthly_expenses: currentMonthlyExpenses,
    withdrawal_rate: safeWithdrawalRate,
  };

  // Calculate additional scenarios

  // Early retirement scenario (5 years earlier)
  const earlyRetirementAge = Math.max(
    userData.age + 5,
    userData.retirementAge - 5
  );
  const earlyRetirementScenario = calculateScenario(
    "Early Retirement",
    `Retirement at age ${earlyRetirementAge}`,
    userData,
    budgetResults,
    earlyRetirementAge,
    userData.lifeExpectancy,
    currentMonthlyExpenses,
    currentSavings,
    preRetirementReturn,
    postRetirementReturn,
    safeWithdrawalRate
  );

  // Delayed retirement scenario (5 years later)
  const delayedRetirementAge = userData.retirementAge + 5;
  const delayedRetirementScenario = calculateScenario(
    "Delayed Retirement",
    `Retirement at age ${delayedRetirementAge}`,
    userData,
    budgetResults,
    delayedRetirementAge,
    userData.lifeExpectancy,
    currentMonthlyExpenses,
    currentSavings,
    preRetirementReturn,
    postRetirementReturn,
    safeWithdrawalRate
  );

  // Conservative returns scenario
  const conservativeReturnScenario = calculateScenario(
    "Conservative Returns",
    `Lower investment returns (${(preRetirementReturn - 0.02) * 100}%)`,
    userData,
    budgetResults,
    userData.retirementAge,
    userData.lifeExpectancy,
    currentMonthlyExpenses,
    currentSavings,
    preRetirementReturn - 0.02,
    postRetirementReturn - 0.01,
    safeWithdrawalRate - 0.005
  );

  // Reduced expenses scenario (-20% expenses in retirement)
  const reducedExpensesScenario = calculateScenario(
    "Reduced Expenses",
    "20% lower expenses in retirement",
    userData,
    budgetResults,
    userData.retirementAge,
    userData.lifeExpectancy,
    currentMonthlyExpenses * 0.8,
    currentSavings,
    preRetirementReturn,
    postRetirementReturn,
    safeWithdrawalRate
  );

  // Higher life expectancy scenario
  const longevityScenario = calculateScenario(
    "Longevity",
    `Living until age ${userData.lifeExpectancy + 10}`,
    userData,
    budgetResults,
    userData.retirementAge,
    userData.lifeExpectancy + 10,
    currentMonthlyExpenses,
    currentSavings,
    preRetirementReturn,
    postRetirementReturn,
    safeWithdrawalRate
  );

  // Combine all scenarios
  return {
    base: baseScenario,
    early_retirement: earlyRetirementScenario,
    delayed_retirement: delayedRetirementScenario,
    conservative_returns: conservativeReturnScenario,
    reduced_expenses: reducedExpensesScenario,
    longevity: longevityScenario,
  };
}

/**
 * Calculates a specific retirement scenario
 *
 * @param {string} name Scenario name
 * @param {string} description Scenario description
 * @param {Object} userData User profile information
 * @param {Object} budgetResults Budget allocation results
 * @param {number} retirementAge Retirement age for this scenario
 * @param {number} lifeExpectancy Life expectancy for this scenario
 * @param {number} monthlyExpenses Monthly expenses for this scenario
 * @param {number} currentSavings Current savings amount
 * @param {number} preRetirementReturn Expected return rate before retirement
 * @param {number} postRetirementReturn Expected return rate during retirement
 * @param {number} withdrawalRate Safe withdrawal rate for this scenario
 * @returns {Object} Retirement scenario details
 */
function calculateScenario(
  name,
  description,
  userData,
  budgetResults,
  retirementAge,
  lifeExpectancy,
  monthlyExpenses,
  currentSavings,
  preRetirementReturn,
  postRetirementReturn,
  withdrawalRate
) {
  // Calculate years to retirement for this scenario
  const yearsToRetirement = retirementAge - userData.age;

  // Calculate years in retirement
  const yearsInRetirement = lifeExpectancy - retirementAge;

  // Calculate inflation-adjusted monthly expenses at retirement
  let inflatedMonthlyExpenses =
    monthlyExpenses * Math.pow(1 + INFLATION_RATES.GENERAL, yearsToRetirement);

  // Apply retirement lifestyle adjustments
  inflatedMonthlyExpenses = applyRetirementLifestyleAdjustments(
    inflatedMonthlyExpenses,
    userData.incomeTier,
    userData.financialPriority
  );

  // Calculate annual expenses
  const annualExpenses = inflatedMonthlyExpenses * 12;

  // Calculate corpus needed using withdrawal rate
  const baseCorpus = annualExpenses / withdrawalRate;
  const buffer = annualExpenses * 2;
  const totalCorpus = baseCorpus + buffer;

  // Calculate future value of current savings
  const futureValueOfSavings = calculateFutureValue(
    currentSavings,
    preRetirementReturn,
    yearsToRetirement
  );

  // Calculate additional corpus needed
  const additionalCorpusNeeded = Math.max(
    0,
    totalCorpus - futureValueOfSavings
  );

  // Calculate monthly savings required
  let monthlySavings = 0;

  if (additionalCorpusNeeded > 0) {
    monthlySavings = calculateRequiredMonthlySavings(
      additionalCorpusNeeded,
      preRetirementReturn,
      yearsToRetirement
    );
  }

  // Apply maximum savings cap based on income tier
  const maxSavings =
    userData.monthlyIncome *
    MAX_RETIREMENT_SAVINGS_PERCENT[userData.incomeTier];
  const cappedMonthlySavings = Math.min(monthlySavings, maxSavings);

  // Calculate feasibility score (how achievable is this scenario)
  const feasibilityScore = calculateFeasibilityScore(
    cappedMonthlySavings,
    userData.monthlyIncome,
    budgetResults.total_essentials
  );

  return {
    name: name,
    description: description,
    retirement_age: retirementAge,
    life_expectancy: lifeExpectancy,
    years_to_retirement: yearsToRetirement,
    years_in_retirement: yearsInRetirement,
    monthly_expenses: inflatedMonthlyExpenses,
    annual_expenses: annualExpenses,
    corpus: totalCorpus,
    monthly_savings: cappedMonthlySavings,
    uncapped_savings: monthlySavings,
    withdrawal_rate: withdrawalRate,
    feasibility: feasibilityScore,
  };
}

/**
 * Calculates feasibility score for a retirement scenario
 * Score from 0-10 indicating how achievable the scenario is
 *
 * @param {number} requiredSavings Required monthly savings
 * @param {number} monthlyIncome User's monthly income
 * @param {number} essentialExpenses Essential monthly expenses
 * @returns {number} Feasibility score (0-10)
 */
function calculateFeasibilityScore(
  requiredSavings,
  monthlyIncome,
  essentialExpenses
) {
  // Calculate disposable income
  const disposableIncome = monthlyIncome - essentialExpenses;

  // If disposable income is zero or negative, feasibility is zero
  if (disposableIncome <= 0) return 0;

  // Calculate what percentage of disposable income is required for savings
  const savingsRatio = requiredSavings / disposableIncome;

  // Feasibility decreases as savings ratio increases
  if (savingsRatio <= 0.3) {
    // Very feasible (savings < 30% of disposable income)
    return 10;
  } else if (savingsRatio <= 0.5) {
    // Feasible (savings 30-50% of disposable income)
    return 8;
  } else if (savingsRatio <= 0.7) {
    // Moderately difficult (savings 50-70% of disposable income)
    return 6;
  } else if (savingsRatio <= 0.9) {
    // Difficult (savings 70-90% of disposable income)
    return 4;
  } else if (savingsRatio <= 1.0) {
    // Very difficult (savings 90-100% of disposable income)
    return 2;
  } else {
    // Impossible (savings > 100% of disposable income)
    return 0;
  }
}

/**
 * Calculates projected retirement income breakdown
 * Shows how the retirement income is expected to be funded
 *
 * @param {Object} userData User profile information
 * @param {number} totalCorpusRequired Total corpus needed for retirement
 * @param {number} safeWithdrawalRate Safe withdrawal rate
 * @param {number} annualExpenses Projected annual expenses in retirement
 * @returns {Object} Breakdown of retirement income sources
 */
function calculateRetirementIncomeBreakdown(
  userData,
  totalCorpusRequired,
  safeWithdrawalRate,
  annualExpenses
) {
  // Calculate annual income from corpus
  const annualIncomeFromCorpus = totalCorpusRequired * safeWithdrawalRate;

  // For Indian context, estimate other income sources
  // These are approximate estimates and could be refined with more inputs
  let epfAmount = 0;
  let npsAmount = 0;
  let rentalAmount = 0;
  let otherAmount = 0;

  // Estimate EPF/PPF based on income and age
  // Simple model: assume 12% of income for workLife years with 8% return
  const workLife = userData.age - 20; // Assuming work started at 20
  const averageIncomeHalf = userData.monthlyIncome * 0.5; // Assuming half of current income as average
  const monthlyEpfContribution = averageIncomeHalf * 0.12; // 12% of income
  const epfCorpus = calculateFutureValue(
    monthlyEpfContribution * workLife * 12,
    0.08,
    userData.retirementAge - userData.age
  );
  epfAmount = epfCorpus * 0.05; // Assuming 5% withdrawal per year

  // Estimate NPS if income is high enough
  if (
    userData.incomeTier === "MIDDLE" ||
    userData.incomeTier === "HIGH" ||
    userData.incomeTier === "ULTRA_HIGH"
  ) {
    // Simple estimation: 10% of corpus
    npsAmount = annualIncomeFromCorpus * 0.1;
  }

  // Estimate rental income for high income users
  if (userData.incomeTier === "HIGH" || userData.incomeTier === "ULTRA_HIGH") {
    // Simple estimation based on income
    rentalAmount = userData.monthlyIncome * 0.15 * 12; // 15% of current income
  }

  // Estimate other sources (interest, dividends, part-time work)
  otherAmount = annualIncomeFromCorpus * 0.05; // 5% of corpus income

  // Total annual retirement income
  const totalRetirementIncome =
    annualIncomeFromCorpus + epfAmount + npsAmount + rentalAmount + otherAmount;

  // Income surplus/deficit
  const incomeSurplus = totalRetirementIncome - annualExpenses;

  return {
    annual_expenses: annualExpenses,
    total_income: totalRetirementIncome,
    surplus_deficit: incomeSurplus,
    corpus_income: annualIncomeFromCorpus,
    epf_ppf: epfAmount,
    nps: npsAmount,
    rental: rentalAmount,
    other: otherAmount,
    income_sources: {
      corpus: (annualIncomeFromCorpus / totalRetirementIncome) * 100,
      epf_ppf: (epfAmount / totalRetirementIncome) * 100,
      nps: (npsAmount / totalRetirementIncome) * 100,
      rental: (rentalAmount / totalRetirementIncome) * 100,
      other: (otherAmount / totalRetirementIncome) * 100,
    },
  };
}

/**
 * Calculates detailed retirement corpus growth projections
 * Used for visualizing savings growth journey
 *
 * @param {Object} userData User profile information
 * @param {number} currentSavings Current savings amount
 * @param {number} monthlySavings Monthly savings amount
 * @param {number} preRetirementReturn Expected return before retirement
 * @param {number} postRetirementReturn Expected return during retirement
 * @param {number} targetCorpus Target corpus amount
 * @returns {Array} Year-by-year growth projections
 */
function calculateRetirementGrowthProjection(
  userData,
  currentSavings,
  monthlySavings,
  preRetirementReturn,
  postRetirementReturn,
  targetCorpus
) {
  const yearsToRetirement = userData.retirementAge - userData.age;
  const yearsInRetirement = userData.lifeExpectancy - userData.retirementAge;
  const totalYears = yearsToRetirement + yearsInRetirement;
  const projection = [];

  let currentAge = userData.age;
  let currentAmount = currentSavings;
  let retirementPhase = false;
  let withdrawalAmount = 0;

  if (yearsInRetirement > 0) {
    // Calculate annual withdrawal amount during retirement
    // Using safe withdrawal rate for the user's risk profile
    const safeWithdrawalRate = SAFE_WITHDRAWAL_RATES[userData.riskTolerance];
    withdrawalAmount = targetCorpus * safeWithdrawalRate;
  }

  // Pre-retirement growth phase
  for (let year = 0; year <= totalYears; year++) {
    // Record current state
    projection.push({
      age: currentAge,
      year: year,
      amount: currentAmount,
      phase: retirementPhase ? "retirement" : "accumulation",
    });

    // Transition to retirement phase if age matches retirement age
    if (currentAge >= userData.retirementAge && !retirementPhase) {
      retirementPhase = true;
    }

    // Calculate next year's amount
    if (!retirementPhase) {
      // Pre-retirement: Add returns + contributions
      const monthlyRate = preRetirementReturn / 12;

      // Formula for future value with regular contributions
      const yearlyContribution =
        monthlySavings *
        ((Math.pow(1 + monthlyRate, 12) - 1) / monthlyRate) *
        (1 + monthlyRate);

      // Add returns on existing amount
      currentAmount =
        currentAmount * (1 + preRetirementReturn) + yearlyContribution;
    } else {
      // Retirement phase: Add returns but subtract withdrawals
      // Adjust withdrawal amount with inflation
      withdrawalAmount *= 1 + INFLATION_RATES.GENERAL;

      // Calculate growth minus withdrawals
      currentAmount =
        currentAmount * (1 + postRetirementReturn) - withdrawalAmount;

      // Prevent negative values
      currentAmount = Math.max(0, currentAmount);
    }

    currentAge++;
  }

  return projection;
}

/**
 * Calculates retirement readiness score and status
 * Provides a score from 0-100 indicating retirement preparedness
 *
 * @param {Object} userData User profile information
 * @param {number} requiredSavings Required monthly savings amount
 * @param {number} currentSavings Current retirement savings amount
 * @param {number} totalSavings Total accumulated savings
 * @param {number} targetCorpus Target corpus amount
 * @returns {Object} Retirement readiness metrics
 */
function calculateRetirementReadiness(
  userData,
  requiredSavings,
  currentRetirementSavings,
  totalSavings,
  targetCorpus
) {
  // Calculate years to retirement
  const yearsToRetirement = userData.retirementAge - userData.age;

  // Calculate current trajectory based on current savings rate
  const projectedFutureSavings = calculateFutureValue(
    totalSavings,
    INVESTMENT_RETURN_RATES[userData.riskTolerance].PRE_RETIREMENT,
    yearsToRetirement
  );

  // Calculate additional future value from current retirement savings
  const additionalSavings = calculateFutureSavedAmount(
    currentRetirementSavings,
    INVESTMENT_RETURN_RATES[userData.riskTolerance].PRE_RETIREMENT,
    yearsToRetirement
  );

  // Total projected corpus at retirement
  const projectedCorpus = projectedFutureSavings + additionalSavings;

  // Calculate corpus ratio (projected vs required)
  const corpusRatio = projectedCorpus / targetCorpus;

  // Calculate savings ratio (current vs required)
  const savingsRatio = currentRetirementSavings / requiredSavings;

  // Calculate base readiness score (0-100)
  let readinessScore;

  if (corpusRatio >= 1.0) {
    // On track or ahead of target
    readinessScore = 90 + (corpusRatio - 1) * 10;
    readinessScore = Math.min(100, readinessScore); // Cap at 100
  } else if (corpusRatio >= 0.75) {
    // Near target
    readinessScore = 75 + (corpusRatio - 0.75) * 60;
  } else if (corpusRatio >= 0.5) {
    // Catching up
    readinessScore = 50 + (corpusRatio - 0.5) * 100;
  } else if (corpusRatio >= 0.25) {
    // Behind target
    readinessScore = 25 + (corpusRatio - 0.25) * 100;
  } else {
    // Far behind
    readinessScore = corpusRatio * 100;
  }

  // Round to nearest integer
  readinessScore = Math.round(readinessScore);

  // Determine status
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

  // Next steps or recommendations
  let nextSteps = [];

  if (readinessScore < 50) {
    if (savingsRatio < 0.5) {
      nextSteps.push("Increase your monthly retirement savings");
    }
    if (yearsToRetirement < 15) {
      nextSteps.push("Consider delaying retirement by a few years");
    }
    nextSteps.push("Review your investment strategy for higher returns");
  } else if (readinessScore < 75) {
    if (savingsRatio < 0.8) {
      nextSteps.push("Slightly increase your retirement savings rate");
    }
    nextSteps.push(
      "Ensure your investment mix is aligned with your risk profile"
    );
  } else {
    nextSteps.push("Stay on course with your current retirement plan");
    nextSteps.push("Review your plan annually to ensure continued progress");
  }

  return {
    score: readinessScore,
    status: status,
    projected_corpus: projectedCorpus,
    corpus_ratio: corpusRatio,
    savings_ratio: savingsRatio,
    next_steps: nextSteps,
  };
}

/**
 * Calculates the future value of periodic savings with compounding
 *
 * @param {number} monthlySavings Monthly savings amount
 * @param {number} rate Annual interest rate (decimal)
 * @param {number} years Number of years
 * @returns {number} Future value of savings
 */
function calculateFutureSavedAmount(monthlySavings, rate, years) {
  const monthlyRate = rate / 12;
  const months = years * 12;

  // Formula for future value of periodic payments
  // FV = PMT × ((1 + r)^n - 1) / r × (1 + r)
  return (
    monthlySavings *
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
    (1 + monthlyRate)
  );
}
// === INVESTMENT RECOMMENDATION ENGINE ===

/**
 * Generates personalized investment recommendations based on user profile
 *
 * @param {Object} userData User profile and financial information
 * @param {Object} retirementResults Retirement planning calculations
 * @returns {Object} Complete investment recommendations
 */
function calculateInvestmentRecommendations(userData, retirementResults) {
  // Step 1: Calculate Base Asset Allocation
  // Age-based equity allocation (100 - age rule with modifications)
  let baseEquityAllocation = Math.max(30, 100 - userData.age);

  // Adjust based on risk profile
  let equityAdjustment = 0;
  if (userData.riskTolerance === "CONSERVATIVE") {
    equityAdjustment = -15;
  } else if (userData.riskTolerance === "MODERATE") {
    equityAdjustment = 0;
  } else {
    // AGGRESSIVE
    equityAdjustment = 10;
  }

  // Calculate adjusted equity allocation (with min/max bounds)
  const equityAllocation = Math.max(
    20,
    Math.min(90, baseEquityAllocation + equityAdjustment)
  );

  // Calculate other allocations
  const debtAllocation = 100 - equityAllocation - 10; // Reserve 10% for gold and alternatives
  const goldAllocation = 5;
  const alternativeAllocation = 5;

  // Convert to percentages
  const equityPercent = equityAllocation / 100;
  const debtPercent = debtAllocation / 100;
  const goldPercent = goldAllocation / 100;
  const alternativePercent = alternativeAllocation / 100;

  // Monthly investment amount - use recommended amount from retirement calculation
  const monthlyInvestment = retirementResults.recommended_monthly_savings;

  // Step 2: Calculate Sub-Asset Allocations
  // Get sub-asset allocations based on user's profile and investment amount
  const equityAllocationBreakdown = calculateEquityBreakdown(
    equityPercent,
    monthlyInvestment,
    userData.incomeTier,
    userData.riskTolerance
  );

  const debtAllocationBreakdown = calculateDebtBreakdown(
    debtPercent,
    monthlyInvestment,
    userData.incomeTier,
    userData.riskTolerance
  );

  // Step 3: Adjust for Tax Efficiency
  // Get user's tax bracket
  const taxBracket = getTaxBracket(userData.monthlyIncome, userData.taxRegime);

  // If in higher tax brackets, adjust for tax efficiency
  if (taxBracket >= 0.2) {
    // 20% or higher
    const adjustedDebtBreakdown = adjustForTaxEfficiency(
      debtAllocationBreakdown,
      taxBracket
    );
    Object.assign(debtAllocationBreakdown, adjustedDebtBreakdown);
  }

  // Step 4: Calculate Monthly Investment Amounts
  // Calculate investment amounts for each category
  const investmentAmounts = {};
  const allocationDetail = {};

  // Calculate equity investments
  for (const [investmentType, allocationPercent] of Object.entries(
    equityAllocationBreakdown
  )) {
    investmentAmounts[investmentType] = monthlyInvestment * allocationPercent;
    allocationDetail[investmentType] = {
      category: "Equity",
      allocation_percent: allocationPercent * 100,
      monthly_amount: monthlyInvestment * allocationPercent,
    };
  }

  // Calculate debt investments
  for (const [investmentType, allocationPercent] of Object.entries(
    debtAllocationBreakdown
  )) {
    investmentAmounts[investmentType] = monthlyInvestment * allocationPercent;
    allocationDetail[investmentType] = {
      category: "Debt",
      allocation_percent: allocationPercent * 100,
      monthly_amount: monthlyInvestment * allocationPercent,
    };
  }

  // Gold and alternatives
  investmentAmounts.gold = monthlyInvestment * goldPercent;
  allocationDetail.gold = {
    category: "Gold",
    allocation_percent: goldPercent * 100,
    monthly_amount: monthlyInvestment * goldPercent,
  };

  investmentAmounts.alternatives = monthlyInvestment * alternativePercent;
  allocationDetail.alternatives = {
    category: "Alternatives",
    allocation_percent: alternativePercent * 100,
    monthly_amount: monthlyInvestment * alternativePercent,
  };

  // Calculate category totals
  const categoryTotals = {
    equity: equityPercent * 100,
    debt: debtPercent * 100,
    gold: goldPercent * 100,
    alternatives: alternativePercent * 100,
  };

  // Step 5: Generate specific investment recommendations
  const specificRecommendations = generateInvestmentRecommendations(
    userData,
    monthlyInvestment,
    equityAllocationBreakdown,
    debtAllocationBreakdown,
    goldPercent,
    alternativePercent,
    taxBracket
  );

  // Step 6: Create long term wealth building plan
  const wealthBuildingPlan = generateWealthBuildingPlan(
    userData,
    retirementResults,
    categoryTotals
  );

  // Return compiled results
  return {
    monthly_investment: monthlyInvestment,
    allocation_percentages: categoryTotals,
    category_totals: categoryTotals,
    allocation_breakdown: allocationDetail,
    investment_amounts: investmentAmounts,
    specific_recommendations: specificRecommendations,
    wealth_building_plan: wealthBuildingPlan,
    tax_bracket: taxBracket,
  };
}

/**
 * Calculates equity allocation breakdown
 *
 * @param {number} equityPercent Total equity allocation as decimal (0-1)
 * @param {number} monthlyInvestment Monthly investment amount
 * @param {string} incomeTier User's income tier
 * @param {string} riskTolerance User's risk tolerance
 * @returns {Object} Breakdown of equity allocation
 */
function calculateEquityBreakdown(
  equityPercent,
  monthlyInvestment,
  incomeTier,
  riskTolerance
) {
  // Create different allocation strategies based on investment amount and income tier
  if (
    incomeTier === "VERY_LOW" ||
    incomeTier === "LOW" ||
    monthlyInvestment < 10000
  ) {
    // Simpler equity allocation for smaller amounts
    return {
      index_funds: equityPercent * 0.7,
      tax_saving_elss: equityPercent * 0.3,
    };
  } else if (
    incomeTier === "LOWER_MIDDLE" ||
    incomeTier === "MIDDLE" ||
    monthlyInvestment < 50000
  ) {
    // Moderate complexity
    return {
      index_funds: equityPercent * 0.4,
      large_cap: equityPercent * 0.2,
      multi_cap: equityPercent * 0.2,
      tax_saving_elss: equityPercent * 0.2,
    };
  } else {
    // Full diversification for higher amounts
    // Adjust based on risk tolerance
    if (riskTolerance === "CONSERVATIVE") {
      return {
        index_funds: equityPercent * 0.35,
        large_cap: equityPercent * 0.25,
        multi_cap: equityPercent * 0.15,
        mid_cap: equityPercent * 0.1,
        small_cap: equityPercent * 0.05,
        tax_saving_elss: equityPercent * 0.1,
      };
    } else if (riskTolerance === "MODERATE") {
      return {
        index_funds: equityPercent * 0.3,
        large_cap: equityPercent * 0.2,
        multi_cap: equityPercent * 0.15,
        mid_cap: equityPercent * 0.15,
        small_cap: equityPercent * 0.1,
        tax_saving_elss: equityPercent * 0.1,
      };
    } else {
      // AGGRESSIVE
      return {
        index_funds: equityPercent * 0.25,
        large_cap: equityPercent * 0.15,
        multi_cap: equityPercent * 0.15,
        mid_cap: equityPercent * 0.2,
        small_cap: equityPercent * 0.15,
        tax_saving_elss: equityPercent * 0.1,
      };
    }
  }
}

/**
 * Calculates debt allocation breakdown
 *
 * @param {number} debtPercent Total debt allocation as decimal (0-1)
 * @param {number} monthlyInvestment Monthly investment amount
 * @param {string} incomeTier User's income tier
 * @param {string} riskTolerance User's risk tolerance
 * @returns {Object} Breakdown of debt allocation
 */
function calculateDebtBreakdown(
  debtPercent,
  monthlyInvestment,
  incomeTier,
  riskTolerance
) {
  // Create different allocation strategies based on investment amount and income tier
  if (
    incomeTier === "VERY_LOW" ||
    incomeTier === "LOW" ||
    monthlyInvestment < 5000
  ) {
    // Very simple for low income/investments
    return {
      ppf: debtPercent * 0.7,
      fd: debtPercent * 0.3,
    };
  } else if (incomeTier === "LOWER_MIDDLE" || monthlyInvestment < 20000) {
    // Basic for lower middle income
    return {
      ppf: debtPercent * 0.6,
      fd: debtPercent * 0.3,
      debt_funds: debtPercent * 0.1,
    };
  } else if (incomeTier === "MIDDLE" || monthlyInvestment < 50000) {
    // Moderate for middle income
    return {
      ppf: debtPercent * 0.4,
      fd: debtPercent * 0.3,
      debt_funds: debtPercent * 0.3,
    };
  } else {
    // Full diversification for higher amounts
    // Adjust based on risk tolerance
    if (riskTolerance === "CONSERVATIVE") {
      return {
        ppf: debtPercent * 0.35,
        fd: debtPercent * 0.25,
        debt_funds: debtPercent * 0.2,
        corporate_bonds: debtPercent * 0.1,
        govt_securities: debtPercent * 0.1,
      };
    } else if (riskTolerance === "MODERATE") {
      return {
        ppf: debtPercent * 0.3,
        fd: debtPercent * 0.2,
        debt_funds: debtPercent * 0.2,
        corporate_bonds: debtPercent * 0.15,
        govt_securities: debtPercent * 0.15,
      };
    } else {
      // AGGRESSIVE
      return {
        ppf: debtPercent * 0.25,
        fd: debtPercent * 0.15,
        debt_funds: debtPercent * 0.25,
        corporate_bonds: debtPercent * 0.2,
        govt_securities: debtPercent * 0.15,
      };
    }
  }
}

/**
 * Gets the user's income tax bracket
 *
 * @param {number} monthlyIncome Monthly income
 * @param {string} taxRegime Tax regime (old/new)
 * @returns {number} Tax bracket as decimal (0-0.3)
 */
function getTaxBracket(monthlyIncome, taxRegime) {
  // Estimate tax bracket based on annual income
  const annualIncome = monthlyIncome * 12;

  if (taxRegime === "old") {
    // Old regime tax brackets
    if (annualIncome <= 250000) {
      return 0; // 0% tax bracket
    } else if (annualIncome <= 500000) {
      return 0.05; // 5% tax bracket
    } else if (annualIncome <= 1000000) {
      return 0.2; // 20% tax bracket
    } else {
      return 0.3; // 30% tax bracket
    }
  } else {
    // New regime tax brackets
    if (annualIncome <= 300000) {
      return 0; // 0% tax bracket
    } else if (annualIncome <= 600000) {
      return 0.05; // 5% tax bracket
    } else if (annualIncome <= 900000) {
      return 0.1; // 10% tax bracket
    } else if (annualIncome <= 1200000) {
      return 0.15; // 15% tax bracket
    } else if (annualIncome <= 1500000) {
      return 0.2; // 20% tax bracket
    } else {
      return 0.3; // 30% tax bracket
    }
  }
}

/**
 * Adjusts debt allocation for tax efficiency
 *
 * @param {Object} debtAllocation Original debt allocation
 * @param {number} taxBracket User's tax bracket
 * @returns {Object} Adjusted debt allocation
 */
function adjustForTaxEfficiency(debtAllocation, taxBracket) {
  // Create a copy of the original allocation
  const adjustedAllocation = { ...debtAllocation };

  // Increase allocation to tax-efficient options (scale based on tax bracket)
  if (adjustedAllocation.ppf) {
    adjustedAllocation.ppf *= 1 + taxBracket;
  }

  if (adjustedAllocation.debt_funds) {
    adjustedAllocation.debt_funds *= 1 + taxBracket * 0.5;
  }

  if (adjustedAllocation.tax_free_bonds) {
    adjustedAllocation.tax_free_bonds *= 1 + taxBracket * 1.5;
  }

  // Reduce allocation to tax-inefficient options
  if (adjustedAllocation.fd) {
    adjustedAllocation.fd *= 1 - taxBracket;
  }

  // Normalize percentages to maintain total
  normalizeAllocationPercentages(
    adjustedAllocation,
    Object.values(debtAllocation).reduce((a, b) => a + b, 0)
  );

  return adjustedAllocation;
}

/**
 * Normalizes allocation percentages to a target sum
 *
 * @param {Object} allocation Allocation object
 * @param {number} targetTotal Desired total sum
 */
function normalizeAllocationPercentages(allocation, targetTotal) {
  // Calculate current total
  const currentTotal = Object.values(allocation).reduce((a, b) => a + b, 0);

  // If current total is 0, can't normalize
  if (currentTotal === 0) return;

  // Normalize to target total
  const ratio = targetTotal / currentTotal;
  for (const key in allocation) {
    allocation[key] *= ratio;
  }
}

/**
 * Generates specific investment recommendations
 *
 * @param {Object} userData User profile information
 * @param {number} monthlyInvestment Monthly investment amount
 * @param {Object} equityAllocation Equity allocation breakdown
 * @param {Object} debtAllocation Debt allocation breakdown
 * @param {number} goldPercent Gold allocation percentage
 * @param {number} alternativePercent Alternative allocation percentage
 * @param {number} taxBracket User's tax bracket
 * @returns {Object} Detailed investment recommendations
 */
function generateInvestmentRecommendations(
  userData,
  monthlyInvestment,
  equityAllocation,
  debtAllocation,
  goldPercent,
  alternativePercent,
  taxBracket
) {
  const recommendations = {
    equity: [],
    debt: [],
    gold: [],
    alternatives: [],
  };

  // Equity recommendations
  if (equityAllocation.index_funds) {
    recommendations.equity.push({
      type: "Index Funds",
      allocation: equityAllocation.index_funds * 100,
      amount: monthlyInvestment * equityAllocation.index_funds,
      details: "Low-cost index funds tracking Nifty 50 or Sensex",
      options: [
        "UTI Nifty Index Fund",
        "HDFC Index Fund Sensex",
        "ICICI Prudential Nifty Index Fund",
      ],
      taxEfficiency: "Medium",
      riskLevel: "Medium",
      recommendedFor: "All investors for core equity holding",
    });
  }

  if (equityAllocation.large_cap) {
    recommendations.equity.push({
      type: "Large Cap Funds",
      allocation: equityAllocation.large_cap * 100,
      amount: monthlyInvestment * equityAllocation.large_cap,
      details: "Stable large-cap mutual funds for core equity allocation",
      options: [
        "ICICI Prudential Bluechip Fund",
        "Mirae Asset Large Cap Fund",
        "Axis Bluechip Fund",
      ],
      taxEfficiency: "Medium",
      riskLevel: "Medium",
      recommendedFor: "Stability-focused investors",
    });
  }

  if (equityAllocation.multi_cap) {
    recommendations.equity.push({
      type: "Multi Cap Funds",
      allocation: equityAllocation.multi_cap * 100,
      amount: monthlyInvestment * equityAllocation.multi_cap,
      details: "Diversified across market capitalizations",
      options: [
        "Kotak Standard Multicap Fund",
        "Parag Parikh Flexi Cap Fund",
        "Axis Multicap Fund",
      ],
      taxEfficiency: "Medium",
      riskLevel: "Medium-High",
      recommendedFor: "Investors seeking diversification",
    });
  }

  if (equityAllocation.mid_cap) {
    recommendations.equity.push({
      type: "Mid Cap Funds",
      allocation: equityAllocation.mid_cap * 100,
      amount: monthlyInvestment * equityAllocation.mid_cap,
      details: "Higher growth potential with moderate risk",
      options: [
        "Kotak Emerging Equity Fund",
        "Axis Midcap Fund",
        "DSP Midcap Fund",
      ],
      taxEfficiency: "Medium",
      riskLevel: "High",
      recommendedFor: "Growth-oriented investors with 7+ year horizon",
    });
  }

  if (equityAllocation.small_cap) {
    recommendations.equity.push({
      type: "Small Cap Funds",
      allocation: equityAllocation.small_cap * 100,
      amount: monthlyInvestment * equityAllocation.small_cap,
      details: "High growth potential with higher volatility",
      options: [
        "Axis Small Cap Fund",
        "SBI Small Cap Fund",
        "Nippon India Small Cap Fund",
      ],
      taxEfficiency: "Medium",
      riskLevel: "Very High",
      recommendedFor: "Aggressive investors with 10+ year horizon",
    });
  }

  if (equityAllocation.tax_saving_elss) {
    recommendations.equity.push({
      type: "ELSS Funds (Tax Saving)",
      allocation: equityAllocation.tax_saving_elss * 100,
      amount: monthlyInvestment * equityAllocation.tax_saving_elss,
      details: "Tax benefits under Section 80C with 3-year lock-in",
      options: [
        "Mirae Asset Tax Saver Fund",
        "Axis Long Term Equity Fund",
        "DSP Tax Saver Fund",
      ],
      taxEfficiency: "High",
      riskLevel: "Medium-High",
      recommendedFor: "Tax-conscious investors in 20%+ bracket",
    });
  }

  // Debt recommendations
  if (debtAllocation.ppf) {
    recommendations.debt.push({
      type: "Public Provident Fund (PPF)",
      allocation: debtAllocation.ppf * 100,
      amount: monthlyInvestment * debtAllocation.ppf,
      details: "Government-backed long-term savings with tax benefits",
      options: ["Open PPF account at any major bank or post office"],
      taxEfficiency: "Very High",
      riskLevel: "Very Low",
      recommendedFor: "Tax-conscious investors seeking guaranteed returns",
    });
  }

  if (debtAllocation.fd) {
    recommendations.debt.push({
      type: "Fixed Deposits",
      allocation: debtAllocation.fd * 100,
      amount: monthlyInvestment * debtAllocation.fd,
      details: "Stable returns with low risk",
      options: [
        "Bank FDs with laddering strategy",
        "Corporate FDs from AAA-rated companies",
        "Post Office Time Deposits",
      ],
      taxEfficiency: "Low",
      riskLevel: "Low",
      recommendedFor: "Conservative investors seeking stability",
    });
  }

  if (debtAllocation.debt_funds) {
    recommendations.debt.push({
      type: "Debt Mutual Funds",
      allocation: debtAllocation.debt_funds * 100,
      amount: monthlyInvestment * debtAllocation.debt_funds,
      details: "Better tax efficiency than FDs for holding periods > 3 years",
      options: [
        "HDFC Corporate Bond Fund",
        "Aditya Birla Sun Life Corporate Bond Fund",
        "Kotak Corporate Bond Fund",
      ],
      taxEfficiency: "Medium-High",
      riskLevel: "Low-Medium",
      recommendedFor: "Investors in 20%+ tax bracket",
    });
  }

  if (debtAllocation.corporate_bonds) {
    recommendations.debt.push({
      type: "Corporate Bonds",
      allocation: debtAllocation.corporate_bonds * 100,
      amount: monthlyInvestment * debtAllocation.corporate_bonds,
      details: "Higher yields than government securities with moderate risk",
      options: ["AAA-rated corporate bonds", "PSU bonds", "Bond ETFs"],
      taxEfficiency: "Medium",
      riskLevel: "Medium",
      recommendedFor: "Yield-seeking investors with medium risk tolerance",
    });
  }

  if (debtAllocation.govt_securities) {
    recommendations.debt.push({
      type: "Government Securities",
      allocation: debtAllocation.govt_securities * 100,
      amount: monthlyInvestment * debtAllocation.govt_securities,
      details: "Safest debt instruments with sovereign guarantee",
      options: [
        "G-Sec funds",
        "Gilt funds",
        "Direct G-Sec through RBI Retail Direct",
      ],
      taxEfficiency: "Medium",
      riskLevel: "Low",
      recommendedFor: "Safety-focused investors",
    });
  }

  // Gold recommendations
  if (goldPercent > 0) {
    recommendations.gold.push({
      type: "Gold Investment",
      allocation: goldPercent * 100,
      amount: monthlyInvestment * goldPercent,
      details: "Hedge against inflation and economic uncertainty",
      options: ["Gold ETFs", "Sovereign Gold Bonds", "Gold Mutual Funds"],
      taxEfficiency: "Medium-High",
      riskLevel: "Medium",
      recommendedFor: "Portfolio diversification and hedging",
    });
  }

  // Alternative recommendations
  if (alternativePercent > 0) {
    // High income users get more sophisticated alternative options
    if (
      userData.incomeTier === "HIGH" ||
      userData.incomeTier === "ULTRA_HIGH"
    ) {
      recommendations.alternatives.push({
        type: "Alternative Investments",
        allocation: alternativePercent * 100,
        amount: monthlyInvestment * alternativePercent,
        details: "Diversification beyond traditional asset classes",
        options: ["REITs", "InvITs", "P2P Lending", "Market-Linked Debentures"],
        taxEfficiency: "Varies",
        riskLevel: "Medium-High",
        recommendedFor: "Sophisticated investors seeking diversification",
      });
    } else {
      recommendations.alternatives.push({
        type: "Alternative Investments",
        allocation: alternativePercent * 100,
        amount: monthlyInvestment * alternativePercent,
        details: "Diversification beyond traditional asset classes",
        options: ["REITs", "InvITs", "P2P Lending Platforms"],
        taxEfficiency: "Medium",
        riskLevel: "Medium-High",
        recommendedFor: "Investors seeking yield and diversification",
      });
    }
  }

  // Add tax-optimization tips for higher tax brackets
  if (taxBracket >= 0.2) {
    recommendations.tax_tips = [
      "Consider maximizing PPF contribution for tax-free interest",
      "Hold debt mutual funds for over 3 years for indexation benefits",
      "Invest in ELSS funds for Section 80C benefits with shorter lock-in",
      "Consider Sovereign Gold Bonds for tax-free returns if held till maturity",
    ];

    if (taxBracket >= 0.3) {
      recommendations.tax_tips.push(
        "Look into NPS for additional tax deduction under Section 80CCD(1B)",
        "Explore tax-free bonds if available in secondary market"
      );
    }
  }

  return recommendations;
}

/**
 * Generates a long-term wealth building plan
 *
 * @param {Object} userData User profile information
 * @param {Object} retirementResults Retirement planning results
 * @param {Object} categoryTotals Investment category allocations
 * @returns {Object} Wealth building plan
 */
function generateWealthBuildingPlan(
  userData,
  retirementResults,
  categoryTotals
) {
  // Create wealth building plan based on income tier
  const plan = {
    timeline: [],
    milestones: [],
    strategies: [],
  };

  // Calculate years to retirement
  const yearsToRetirement = userData.retirementAge - userData.age;

  // Set up timeline phases
  if (yearsToRetirement <= 10) {
    // Short timeline to retirement
    plan.timeline = [
      {
        phase: "Pre-Retirement Focus",
        years: `${userData.age} to ${userData.retirementAge}`,
        focus: "Capital preservation with moderate growth",
        description:
          "Conservative approach with emphasis on protecting accumulated wealth while still achieving modest growth",
      },
      {
        phase: "Early Retirement",
        years: `${userData.retirementAge} to ${userData.retirementAge + 10}`,
        focus: "Income generation with inflation protection",
        description:
          "Focus on stable income sources while maintaining some growth component to offset inflation",
      },
      {
        phase: "Late Retirement",
        years: `${userData.retirementAge + 10} to ${userData.lifeExpectancy}`,
        focus: "Income stability and legacy planning",
        description:
          "Priority on reliable income streams and wealth transfer strategies",
      },
    ];
  } else if (yearsToRetirement <= 20) {
    // Medium timeline to retirement
    plan.timeline = [
      {
        phase: "Accumulation",
        years: `${userData.age} to ${
          userData.age + Math.floor(yearsToRetirement / 2)
        }`,
        focus: "Aggressive growth and wealth building",
        description:
          "Higher allocation to growth assets to maximize long-term returns",
      },
      {
        phase: "Pre-Retirement Transition",
        years: `${userData.age + Math.floor(yearsToRetirement / 2)} to ${
          userData.retirementAge
        }`,
        focus: "Balanced growth with increased capital preservation",
        description:
          "Gradual shift towards more conservative allocations while maintaining growth component",
      },
      {
        phase: "Retirement",
        years: `${userData.retirementAge} to ${userData.lifeExpectancy}`,
        focus: "Income generation with moderate growth",
        description:
          "Focus on sustainable withdrawals and inflation protection",
      },
    ];
  } else {
    // Long timeline to retirement
    plan.timeline = [
      {
        phase: "Early Accumulation",
        years: `${userData.age} to ${userData.age + 15}`,
        focus: "Maximum growth potential",
        description:
          "Aggressive positioning in higher risk/return assets to maximize compound growth",
      },
      {
        phase: "Mid-Life Accumulation",
        years: `${userData.age + 15} to ${userData.age + 30}`,
        focus: "Strong growth with increasing diversification",
        description:
          "Maintaining significant growth exposure with introduction of more diverse asset classes",
      },
      {
        phase: "Pre-Retirement Transition",
        years: `${userData.age + 30} to ${userData.retirementAge}`,
        focus: "Balanced approach with capital preservation",
        description:
          "Gradual shift to more conservative allocations as retirement approaches",
      },
      {
        phase: "Retirement",
        years: `${userData.retirementAge} to ${userData.lifeExpectancy}`,
        focus: "Income generation with inflation protection",
        description:
          "Focus on sustainable income streams with some growth component",
      },
    ];
  }

  // Generate milestones based on income tier
  if (userData.incomeTier === "VERY_LOW" || userData.incomeTier === "LOW") {
    // Basic milestones for lower income
    plan.milestones = [
      {
        name: "Emergency Fund",
        description: `Build ₹${(
          userData.monthlyExpenses * 3
        ).toLocaleString()} emergency fund (3 months expenses)`,
        timeframe: "Immediate priority",
      },
      {
        name: "Debt Elimination",
        description: "Pay off all high-interest debts",
        timeframe: "1-2 years",
      },
      {
        name: "Basic Retirement Savings",
        description: "Start regular investments in PPF and index funds",
        timeframe: "Within first year",
      },
      {
        name: "Health Insurance",
        description: "Secure adequate health insurance for family",
        timeframe: "Immediate priority",
      },
    ];
  } else if (
    userData.incomeTier === "LOWER_MIDDLE" ||
    userData.incomeTier === "MIDDLE"
  ) {
    // More comprehensive milestones for middle income
    plan.milestones = [
      {
        name: "Emergency Fund",
        description: `Build ₹${(
          userData.monthlyExpenses * 6
        ).toLocaleString()} emergency fund (6 months expenses)`,
        timeframe: "1 year",
      },
      {
        name: "Debt Optimization",
        description: "Eliminate high-interest debt, optimize low-interest debt",
        timeframe: "1-2 years",
      },
      {
        name: "Retirement Base",
        description: `Accumulate ₹${(
          userData.monthlyIncome *
          12 *
          3
        ).toLocaleString()} in retirement accounts`,
        timeframe: "3-5 years",
      },
      {
        name: "Major Life Goals",
        description: "Save for major life events (home, education, etc.)",
        timeframe: "5-10 years",
      },
      {
        name: "Wealth Accumulation",
        description: `Grow portfolio to ₹${(
          userData.monthlyIncome *
          12 *
          10
        ).toLocaleString()}`,
        timeframe: `By age ${userData.age + 15}`,
      },
    ];
  } else {
    // Sophisticated milestones for high income
    plan.milestones = [
      {
        name: "Emergency & Opportunity Fund",
        description: `Build ₹${(
          userData.monthlyExpenses * 12
        ).toLocaleString()} liquid reserve (12 months expenses)`,
        timeframe: "1 year",
      },
      {
        name: "Tax-Optimized Foundation",
        description:
          "Maximize tax-advantaged accounts and optimize tax structure",
        timeframe: "1-2 years",
      },
      {
        name: "Core Portfolio",
        description: `Establish ₹${(
          userData.monthlyIncome *
          12 *
          5
        ).toLocaleString()} diversified investment base`,
        timeframe: "3-5 years",
      },
      {
        name: "Alternative Investments",
        description:
          "Allocate to real estate, private equity, or other alternatives",
        timeframe: "5-7 years",
      },
      {
        name: "Wealth Milestone 1",
        description: `Grow portfolio to ₹${(
          userData.monthlyIncome *
          12 *
          15
        ).toLocaleString()}`,
        timeframe: `By age ${userData.age + 10}`,
      },
      {
        name: "Wealth Milestone 2",
        description: `Grow portfolio to ₹${(
          userData.monthlyIncome *
          12 *
          30
        ).toLocaleString()}`,
        timeframe: `By age ${userData.age + 20}`,
      },
      {
        name: "Estate Planning",
        description:
          "Develop comprehensive wealth transfer and legacy strategy",
        timeframe: "10-15 years",
      },
    ];
  }

  // Generate strategies based on income tier and risk profile
  if (userData.incomeTier === "VERY_LOW" || userData.incomeTier === "LOW") {
    // Simple strategies for lower income
    plan.strategies = [
      {
        name: "Automatic Saving",
        description:
          "Set up auto-deduction for retirement contributions immediately after receiving income",
        benefit: "Ensures consistent saving without requiring discipline",
      },
      {
        name: "Government Schemes",
        description:
          "Maximize utilization of government savings schemes like PPF, Sukanya Samriddhi, etc.",
        benefit: "Provides guaranteed returns with government backing",
      },
      {
        name: "Laddered FDs",
        description:
          "Create fixed deposit ladders for better liquidity and interest rate management",
        benefit: "Balances access to funds with higher interest rates",
      },
      {
        name: "Index Investing",
        description: "Use low-cost index funds for equity exposure",
        benefit: "Reduces costs and complexity while providing market returns",
      },
    ];
  } else if (
    userData.incomeTier === "LOWER_MIDDLE" ||
    userData.incomeTier === "MIDDLE"
  ) {
    // More comprehensive strategies for middle income
    plan.strategies = [
      {
        name: "Systematic Investment Plan (SIP)",
        description: "Implement SIPs across different mutual fund categories",
        benefit: "Rupee cost averaging and disciplined investing",
      },
      {
        name: "Tax-Efficient Structuring",
        description:
          "Optimize investments for tax efficiency based on holding period and tax bracket",
        benefit: "Maximizes after-tax returns",
      },
      {
        name: "Debt Diversification",
        description: "Spread debt investments across PPF, debt funds, and FDs",
        benefit: "Balances liquidity, returns, and tax efficiency",
      },
      {
        name: "Annual Rebalancing",
        description:
          "Rebalance portfolio annually to maintain target asset allocation",
        benefit: "Controls risk and potentially enhances returns",
      },
      {
        name: "Goal-Based Bucketing",
        description:
          "Separate investments into short, medium, and long-term buckets",
        benefit:
          "Aligns investment strategy with specific goals and time horizons",
      },
    ];
  } else {
    // Sophisticated strategies for high income
    plan.strategies = [
      {
        name: "Tax-Advantaged Maximization",
        description:
          "Maximize all available tax-advantaged investment options (80C, 80D, 80CCD, etc.)",
        benefit: "Reduces tax burden while building wealth",
      },
      {
        name: "Core-Satellite Approach",
        description:
          "Build a core portfolio of index funds surrounded by satellite active funds and direct equities",
        benefit: "Balances reliable beta returns with alpha opportunities",
      },
      {
        name: "Alternative Asset Integration",
        description:
          "Add REITs, InvITs, private equity, and structured products for diversification",
        benefit:
          "Reduces correlation with traditional markets and enhances returns",
      },
      {
        name: "Strategic Asset Location",
        description:
          "Place tax-inefficient assets in tax-advantaged accounts and vice versa",
        benefit: "Optimizes after-tax returns across the entire portfolio",
      },
      {
        name: "Tactical Rebalancing",
        description:
          "Implement rule-based tactical shifts around strategic allocation",
        benefit: "Potential to enhance returns through disciplined adjustments",
      },
      {
        name: "Legacy Planning",
        description:
          "Implement estate planning, trusts, and generational wealth transfer strategies",
        benefit: "Ensures efficient wealth transition and lasting legacy",
      },
    ];
  }

  return plan;
}

// === EXPENSE OPTIMIZATION ENGINE ===

/**
 * Identifies expense optimization opportunities in the user's budget
 *
 * @param {Object} userData User profile and financial information
 * @param {Object} budgetResults Budget allocation results
 * @returns {Object} Optimization opportunities and recommendations
 */
function calculateOptimizationOpportunities(userData, budgetResults) {
  // Step 1: Calculate Category Benchmarks
  const benchmarks = calculateBenchmarksForProfile(userData);

  // Step 2: Identify Optimization Opportunities
  const opportunities = [];

  const currentExpenses = {
    housing: budgetResults.housing,
    food: budgetResults.food,
    utilities: budgetResults.utilities,
    transport: budgetResults.transport,
    healthcare: budgetResults.healthcare,
    education: budgetResults.education,
    personal: budgetResults.personal,
    household: budgetResults.household,
    discretionary: budgetResults.discretionary,
  };

  for (const [category, spending] of Object.entries(currentExpenses)) {
    const benchmark = benchmarks[category];

    if (benchmark && spending > benchmark.typical * 1.2) {
      const excessAmount = spending - benchmark.typical;

      // Calculate potential savings
      const conservativeSavings = excessAmount * 0.2;
      const moderateSavings = excessAmount * 0.4;
      const aggressiveSavings = excessAmount * 0.6;

      opportunities.push({
        category: category,
        current_spending: spending,
        benchmark: benchmark.typical,
        benchmark_min: benchmark.min,
        benchmark_max: benchmark.max,
        excess_percentage:
          ((spending - benchmark.typical) / benchmark.typical) * 100,
        potential_savings: {
          conservative: conservativeSavings,
          moderate: moderateSavings,
          aggressive: aggressiveSavings,
        },
        income_percentage: (spending / userData.monthlyIncome) * 100,
      });
    }
  }

  // Step 3: Generate Specific Recommendations
  for (const opportunity of opportunities) {
    opportunity.recommendations = generateRecommendationsForCategory(
      opportunity.category,
      opportunity.potential_savings,
      userData.incomeTier
    );
  }

  // Step 4: Prioritize Recommendations
  for (const opportunity of opportunities) {
    for (const recommendation of opportunity.recommendations) {
      // Calculate impact score (higher is better)
      let impactScore = 0;
      if (recommendation.impact < 1000) {
        impactScore = 1;
      } else if (recommendation.impact < 5000) {
        impactScore = 2;
      } else {
        impactScore = 3;
      }

      // Calculate effort score (lower is better)
      let effortScore = 0;
      if (recommendation.effort === "low") {
        effortScore = 3;
      } else if (recommendation.effort === "medium") {
        effortScore = 2;
      } else {
        effortScore = 1;
      }

      // Overall score
      recommendation.score = impactScore * effortScore;
    }

    // Sort recommendations by score (descending)
    opportunity.recommendations.sort((a, b) => b.score - a.score);
  }

  // Sort opportunities by potential moderate savings (descending)
  opportunities.sort(
    (a, b) => b.potential_savings.moderate - a.potential_savings.moderate
  );

  // Collect all recommendations
  const allRecommendations = [];
  for (const opportunity of opportunities) {
    allRecommendations.push(...opportunity.recommendations);
  }

  // Sort by score (descending)
  allRecommendations.sort((a, b) => b.score - a.score);

  // Get top recommendations
  const topRecommendations = allRecommendations.slice(0, 5);

  // Calculate income improvement opportunities based on income tier
  const incomeImprovementSuggestions =
    generateIncomeImprovementSuggestions(userData);

  return {
    opportunities: opportunities,
    top_recommendations: topRecommendations,
    total_potential_savings: {
      conservative: opportunities.reduce(
        (sum, opp) => sum + opp.potential_savings.conservative,
        0
      ),
      moderate: opportunities.reduce(
        (sum, opp) => sum + opp.potential_savings.moderate,
        0
      ),
      aggressive: opportunities.reduce(
        (sum, opp) => sum + opp.potential_savings.aggressive,
        0
      ),
    },
    income_improvement: incomeImprovementSuggestions,
    has_opportunities: opportunities.length > 0,
  };
}

/**
 * Calculates benchmarks for different expense categories
 *
 * @param {Object} userData User profile information
 * @returns {Object} Benchmark ranges for each expense category
 */
function calculateBenchmarksForProfile(userData) {
  // Calculate typical spending ranges based on user's profile
  const monthlyIncome = userData.monthlyIncome;

  // Base percentages of income for each category (will be adjusted)
  const baseBenchmarks = {
    housing: {
      min: 0.15,
      typical: 0.25,
      max: 0.35,
    },
    food: {
      min: 0.1,
      typical: 0.15,
      max: 0.2,
    },
    utilities: {
      min: 0.03,
      typical: 0.05,
      max: 0.08,
    },
    transport: {
      min: 0.05,
      typical: 0.1,
      max: 0.15,
    },
    healthcare: {
      min: 0.02,
      typical: 0.05,
      max: 0.08,
    },
    education: {
      min: 0.05,
      typical: 0.1,
      max: 0.15,
    },
    personal: {
      min: 0.03,
      typical: 0.05,
      max: 0.08,
    },
    household: {
      min: 0.03,
      typical: 0.05,
      max: 0.08,
    },
    discretionary: {
      min: 0.05,
      typical: 0.1,
      max: 0.2,
    },
  };

  // Adjust percentages based on income tier
  let incomeTierAdjustment = 1.0; // Default multiplier

  if (userData.incomeTier === "VERY_LOW") {
    // Lower income households spend higher percentage on essentials
    incomeTierAdjustment = 1.2;
    // And less on discretionary
    baseBenchmarks.discretionary.typical = 0.05;
    baseBenchmarks.discretionary.max = 0.1;
  } else if (userData.incomeTier === "LOW") {
    incomeTierAdjustment = 1.1;
    baseBenchmarks.discretionary.typical = 0.07;
    baseBenchmarks.discretionary.max = 0.15;
  } else if (userData.incomeTier === "HIGH") {
    // Higher income households spend lower percentage on essentials
    incomeTierAdjustment = 0.8;
    // And more on discretionary
    baseBenchmarks.discretionary.typical = 0.15;
    baseBenchmarks.discretionary.max = 0.3;
  } else if (userData.incomeTier === "ULTRA_HIGH") {
    incomeTierAdjustment = 0.6;
    baseBenchmarks.discretionary.typical = 0.25;
    baseBenchmarks.discretionary.max = 0.4;
  }

  // Calculate actual benchmarks in rupees
  const benchmarks = {};

  for (const [category, percentages] of Object.entries(baseBenchmarks)) {
    // Apply adjustment to essential categories only
    const adjustment =
      category === "discretionary" ? 1.0 : incomeTierAdjustment;

    benchmarks[category] = {
      min: monthlyIncome * percentages.min * adjustment,
      typical: monthlyIncome * percentages.typical * adjustment,
      max: monthlyIncome * percentages.max * adjustment,
    };
  }

  // Adjust based on family size
  const familySizeFactor = getFamilySizeFactor(userData.familySize);

  // Categories that scale with family size
  const scalingCategories = ["food", "healthcare", "education", "personal"];

  for (const category of scalingCategories) {
    if (benchmarks[category]) {
      benchmarks[category].min *= familySizeFactor;
      benchmarks[category].typical *= familySizeFactor;
      benchmarks[category].max *= familySizeFactor;
    }
  }

  // Adjust based on location tier
  const locationMultiplier = getLocationMultiplier(userData.locationTier);

  // Categories that scale with location
  const locationScalingCategories = [
    "housing",
    "food",
    "utilities",
    "transport",
    "household",
  ];

  for (const category of locationScalingCategories) {
    if (benchmarks[category]) {
      benchmarks[category].min *= locationMultiplier;
      benchmarks[category].typical *= locationMultiplier;
      benchmarks[category].max *= locationMultiplier;
    }
  }

  // Special adjustments based on housing status
  if (userData.housingStatus === "owned_fully") {
    benchmarks.housing.min *= 0.3;
    benchmarks.housing.typical *= 0.3;
    benchmarks.housing.max *= 0.3;
  }

  return benchmarks;
}

/**
 * Gets location multiplier for a given location tier
 *
 * @param {string} locationTier Location tier
 * @returns {number} Location multiplier
 */
function getLocationMultiplier(locationTier) {
  return LOCATION_MULTIPLIERS[locationTier] || 1.0;
}

/**
 * Gets family size factor for a given family size
 *
 * @param {number} familySize Number of family members
 * @returns {number} Family size factor
 */
function getFamilySizeFactor(familySize) {
  if (familySize <= 5) {
    return FAMILY_SIZE_FACTORS[familySize] || 1.0;
  } else {
    // For families larger than 5, use formula: 1.5 + 0.1 * (N-5)
    return 1.5 + 0.1 * (familySize - 5);
  }
}

/**
 * Generates category-specific optimization recommendations
 *
 * @param {string} category Expense category
 * @param {Object} potentialSavings Potential savings estimates
 * @param {string} incomeTier User's income tier
 * @returns {Array} Optimization recommendations
 */
function generateRecommendationsForCategory(
  category,
  potentialSavings,
  incomeTier
) {
  const recommendations = [];

  // Standard recommendations by category
  switch (category) {
    case "housing":
      recommendations.push(
        {
          action: "Consider moving to a nearby area with lower rent",
          impact: potentialSavings.moderate,
          effort: "high",
          type: "structural",
        },
        {
          action: "Negotiate rent with current landlord",
          impact: potentialSavings.conservative,
          effort: "low",
          type: "immediate",
        },
        {
          action: "Find a roommate to share expenses",
          impact: potentialSavings.aggressive,
          effort: "medium",
          type: "structural",
        },
        {
          action: "Refinance your home loan for better interest rates",
          impact: potentialSavings.conservative,
          effort: "medium",
          type: "financial",
        }
      );
      break;

    case "food":
      recommendations.push(
        {
          action: "Reduce eating out frequency by half",
          impact: potentialSavings.moderate,
          effort: "medium",
          type: "behavioral",
        },
        {
          action: "Plan meals and grocery shopping in advance",
          impact: potentialSavings.conservative,
          effort: "low",
          type: "behavioral",
        },
        {
          action: "Buy groceries from local markets instead of premium stores",
          impact: potentialSavings.conservative,
          effort: "low",
          type: "immediate",
        },
        {
          action: "Cook in bulk and store meals for the week",
          impact: potentialSavings.moderate,
          effort: "medium",
          type: "behavioral",
        }
      );
      break;

    case "utilities":
      recommendations.push(
        {
          action: "Switch to energy-efficient appliances",
          impact: potentialSavings.moderate,
          effort: "high",
          type: "investment",
        },
        {
          action: "Install LED bulbs throughout your home",
          impact: potentialSavings.conservative,
          effort: "low",
          type: "immediate",
        },
        {
          action: "Optimize AC temperature settings (increase by 1-2°C)",
          impact: potentialSavings.conservative,
          effort: "low",
          type: "behavioral",
        },
        {
          action: "Switch to a more affordable internet/cable plan",
          impact: potentialSavings.moderate,
          effort: "low",
          type: "immediate",
        }
      );
      break;

    case "transport":
      recommendations.push(
        {
          action: "Use public transportation more frequently",
          impact: potentialSavings.aggressive,
          effort: "medium",
          type: "behavioral",
        },
        {
          action: "Carpool for regular commutes",
          impact: potentialSavings.moderate,
          effort: "medium",
          type: "behavioral",
        },
        {
          action: "Compare fuel prices and refuel at cheaper stations",
          impact: potentialSavings.conservative,
          effort: "low",
          type: "immediate",
        },
        {
          action: "Maintain your vehicle regularly to improve fuel efficiency",
          impact: potentialSavings.conservative,
          effort: "medium",
          type: "maintenance",
        }
      );
      break;

    case "discretionary":
      recommendations.push(
        {
          action: "Create a specific entertainment budget and stick to it",
          impact: potentialSavings.moderate,
          effort: "low",
          type: "behavioral",
        },
        {
          action: "Use free or discounted entertainment options",
          impact: potentialSavings.conservative,
          effort: "low",
          type: "immediate",
        },
        {
          action: "Implement a 48-hour rule for non-essential purchases",
          impact: potentialSavings.aggressive,
          effort: "medium",
          type: "behavioral",
        },
        {
          action: "Cancel unused subscriptions and memberships",
          impact: potentialSavings.moderate,
          effort: "low",
          type: "immediate",
        }
      );
      break;

    default:
      recommendations.push(
        {
          action: `Review your ${category} expenses and identify non-essential items`,
          impact: potentialSavings.moderate,
          effort: "medium",
          type: "analysis",
        },
        {
          action: `Set a monthly budget for ${category} and track spending`,
          impact: potentialSavings.conservative,
          effort: "low",
          type: "behavioral",
        },
        {
          action: `Look for discounts and alternatives for ${category} expenses`,
          impact: potentialSavings.conservative,
          effort: "medium",
          type: "immediate",
        }
      );
  }

  // Add income tier-specific recommendations
  if (incomeTier === "HIGH" || incomeTier === "ULTRA_HIGH") {
    if (category === "discretionary") {
      recommendations.push({
        action: "Consider value-based spending prioritization for luxury items",
        impact: potentialSavings.moderate,
        effort: "medium",
        type: "behavioral",
      });
    }

    if (category === "housing") {
      recommendations.push({
        action: "Evaluate property tax assessment for potential appeals",
        impact: potentialSavings.conservative,
        effort: "medium",
        type: "financial",
      });
    }
  } else if (incomeTier === "VERY_LOW" || incomeTier === "LOW") {
    if (category === "food") {
      recommendations.push({
        action: "Utilize community food banks or government subsidy programs",
        impact: potentialSavings.moderate,
        effort: "low",
        type: "resource",
      });
    }

    if (category === "healthcare") {
      recommendations.push({
        action: "Research government healthcare schemes you may qualify for",
        impact: potentialSavings.moderate,
        effort: "medium",
        type: "resource",
      });
    }
  }

  return recommendations;
}

/**
 * Generates income improvement suggestions based on user profile
 *
 * @param {Object} userData User profile information
 * @returns {Array} Income improvement suggestions
 */
function generateIncomeImprovementSuggestions(userData) {
  const suggestions = [];

  // Common suggestions for all income tiers
  suggestions.push({
    title: "Side Income Opportunities",
    description: "Explore ways to supplement your primary income",
    effort: "medium",
    impact: "high",
  });

  // Tier-specific suggestions
  if (userData.incomeTier === "VERY_LOW" || userData.incomeTier === "LOW") {
    suggestions.push(
      {
        title: "Skill Development",
        description:
          "Invest in learning new skills that can increase your earning potential",
        effort: "high",
        impact: "high",
        resources: [
          "Government skill development programs",
          "Free online courses",
          "Community workshops",
        ],
      },
      {
        title: "Government Assistance",
        description:
          "Research and apply for government schemes you may qualify for",
        effort: "medium",
        impact: "medium",
        resources: [
          "Local welfare office",
          "Online government portals",
          "Community resource centers",
        ],
      },
      {
        title: "Gig Economy Work",
        description:
          "Consider flexible gig opportunities that fit around your schedule",
        effort: "low",
        impact: "medium",
        examples: ["Delivery services", "Ride-sharing", "Task-based platforms"],
      }
    );
  } else if (
    userData.incomeTier === "LOWER_MIDDLE" ||
    userData.incomeTier === "MIDDLE"
  ) {
    suggestions.push(
      {
        title: "Career Advancement",
        description:
          "Seek promotion opportunities or job changes for higher compensation",
        effort: "high",
        impact: "high",
        steps: [
          "Update your resume and skills",
          "Network within your industry",
          "Research salary benchmarks for negotiation",
        ],
      },
      {
        title: "Professional Certification",
        description:
          "Obtain industry certifications to qualify for better positions",
        effort: "high",
        impact: "medium",
        timeframe: "6-12 months",
      },
      {
        title: "Freelance Services",
        description:
          "Offer services related to your expertise on freelance platforms",
        effort: "medium",
        impact: "medium",
        examples: ["Content writing", "Design work", "Consulting services"],
      }
    );
  } else {
    suggestions.push(
      {
        title: "Investment Income",
        description:
          "Focus on building passive income streams through investments",
        effort: "medium",
        impact: "high",
        strategies: [
          "Dividend-generating portfolios",
          "Real estate investments",
          "Alternative income-generating assets",
        ],
      },
      {
        title: "Business Ventures",
        description:
          "Consider entrepreneurial opportunities or angel investing",
        effort: "very high",
        impact: "very high",
        approaches: [
          "Start a side business",
          "Invest in startups",
          "Buy existing small businesses",
        ],
      },
      {
        title: "Board Positions",
        description:
          "Seek advisory or board positions in companies or non-profits",
        effort: "medium",
        impact: "medium",
        benefits: [
          "Additional income",
          "Network expansion",
          "Professional development",
        ],
      }
    );
  }

  return suggestions;
}
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
 * Updates the retirement scenarios section
 *
 * @param {Object} userData User profile and financial information
 * @param {Object} retirementResults Retirement planning results
 */
function updateRetirementScenarios(userData, retirementResults) {
  const container = document.getElementById("retirement-scenarios");
  container.innerHTML = "";

  // Add scenario cards for each scenario
  for (const [key, scenario] of Object.entries(retirementResults.scenarios)) {
    // Skip the base scenario as it's already shown in the main view
    if (key === "base") continue;

    // Create card with appropriate color based on feasibility
    let cardClass = "border-gray-200";
    let feasibilityClass = "text-gray-600";

    if (scenario.feasibility >= 8) {
      cardClass = "border-green-200 bg-green-50";
      feasibilityClass = "text-green-800";
    } else if (scenario.feasibility >= 5) {
      cardClass = "border-yellow-200 bg-yellow-50";
      feasibilityClass = "text-yellow-800";
    } else if (scenario.feasibility >= 3) {
      cardClass = "border-orange-200 bg-orange-50";
      feasibilityClass = "text-orange-800";
    } else {
      cardClass = "border-red-200 bg-red-50";
      feasibilityClass = "text-red-800";
    }

    const card = document.createElement("div");
    card.className = `border rounded-lg p-4 ${cardClass}`;
    card.innerHTML = `
      <div class="flex justify-between items-center mb-2">
        <h5 class="font-semibold">${scenario.name}</h5>
        <span class="text-sm ${feasibilityClass}">
          Feasibility: ${scenario.feasibility}/10
        </span>
      </div>
      <p class="text-sm text-gray-600 mb-3">${scenario.description}</p>
      <div class="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span class="font-medium">Corpus:</span> 
          ${formatCurrency(scenario.corpus)}
        </div>
        <div>
          <span class="font-medium">Monthly Savings:</span> 
          ${formatCurrency(scenario.monthly_savings)}
        </div>
      </div>
    `;
    container.appendChild(card);
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

  // Get income breakdown data
  const incomeBreakdown = retirementResults.retirement_income_breakdown;
  const hasMultipleSources =
    incomeBreakdown.epf_ppf > 0 ||
    incomeBreakdown.nps > 0 ||
    incomeBreakdown.rental > 0 ||
    incomeBreakdown.other > 0;

  // Format surplus/deficit
  const surplusDeficit = incomeBreakdown.surplus_deficit;
  const surplusDeficitText =
    surplusDeficit >= 0
      ? `<span class="text-green-600">Surplus: ${formatCurrency(
          surplusDeficit
        )}</span>`
      : `<span class="text-red-600">Deficit: ${formatCurrency(
          Math.abs(surplusDeficit)
        )}</span>`;

  // Create content
  let content = `
    <h3 class="panel-title">Retirement Income Sources</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <div class="flex justify-between mb-2">
          <span class="font-medium">Annual Expenses in Retirement:</span>
          <span>${formatCurrency(incomeBreakdown.annual_expenses)}</span>
        </div>
        <div class="flex justify-between mb-2">
          <span class="font-medium">Total Annual Income:</span>
          <span>${formatCurrency(incomeBreakdown.total_income)}</span>
        </div>
        <div class="flex justify-between mb-4">
          <span class="font-medium">Income vs. Expenses:</span>
          <span>${surplusDeficitText}</span>
        </div>
  `;

  // Add income source breakdown
  if (hasMultipleSources) {
    content += `
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b">
            <th class="text-left py-2">Income Source</th>
            <th class="text-right py-2">Annual Amount</th>
            <th class="text-right py-2">Percentage</th>
          </tr>
        </thead>
        <tbody>
    `;

    // Add sources
    if (incomeBreakdown.corpus_income > 0) {
      content += `
        <tr class="border-b">
          <td class="py-2">Investment Corpus</td>
          <td class="text-right">${formatCurrency(
            incomeBreakdown.corpus_income
          )}</td>
          <td class="text-right">${incomeBreakdown.income_sources.corpus.toFixed(
            1
          )}%</td>
        </tr>
      `;
    }

    if (incomeBreakdown.epf_ppf > 0) {
      content += `
        <tr class="border-b">
          <td class="py-2">EPF/PPF</td>
          <td class="text-right">${formatCurrency(incomeBreakdown.epf_ppf)}</td>
          <td class="text-right">${incomeBreakdown.income_sources.epf_ppf.toFixed(
            1
          )}%</td>
        </tr>
      `;
    }

    if (incomeBreakdown.nps > 0) {
      content += `
        <tr class="border-b">
          <td class="py-2">NPS</td>
          <td class="text-right">${formatCurrency(incomeBreakdown.nps)}</td>
          <td class="text-right">${incomeBreakdown.income_sources.nps.toFixed(
            1
          )}%</td>
        </tr>
      `;
    }

    if (incomeBreakdown.rental > 0) {
      content += `
        <tr class="border-b">
          <td class="py-2">Rental Income</td>
          <td class="text-right">${formatCurrency(incomeBreakdown.rental)}</td>
          <td class="text-right">${incomeBreakdown.income_sources.rental.toFixed(
            1
          )}%</td>
        </tr>
      `;
    }

    if (incomeBreakdown.other > 0) {
      content += `
        <tr class="border-b">
          <td class="py-2">Other Sources</td>
          <td class="text-right">${formatCurrency(incomeBreakdown.other)}</td>
          <td class="text-right">${incomeBreakdown.income_sources.other.toFixed(
            1
          )}%</td>
        </tr>
      `;
    }

    content += `
        </tbody>
      </table>
    `;
  } else {
    content += `
      <p class="text-sm text-gray-600">
        Your retirement income will primarily come from your investment corpus.
        Consider diversifying your retirement income sources as you progress in your career.
      </p>
    `;
  }

  content += `
      </div>
      <div>
        <h4 class="font-medium mb-3">Income Source Distribution</h4>
        <div class="chart-container" style="height: 200px;">
          <canvas id="retirement-income-chart"></canvas>
        </div>
        <p class="text-sm text-gray-600 mt-4">
          A diverse mix of income sources in retirement provides greater security
          and flexibility. Consider building multiple streams for your retirement years.
        </p>
      </div>
    </div>
  `;

  // Update section
  retirementIncomeSection.innerHTML = content;

  // Create pie chart for income sources
  createRetirementIncomeChart(incomeBreakdown);
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
 * Updates the retirement readiness section
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

  // Create content
  // Update with clearer metrics display
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
                    readiness.savings_ratio * 100
                  )}%"></div>
              <div class="relative z-10 text-xs text-white text-center py-0.5">
                ${Math.min(
                  100,
                  (readiness.savings_ratio * 100).toFixed(0)
                )}% of needed
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
                  style="width: ${Math.min(
                    100,
                    readiness.corpus_ratio * 100
                  )}%"></div>
              <div class="relative z-10 text-xs text-white text-center py-0.5">
                ${Math.min(
                  100,
                  (readiness.corpus_ratio * 100).toFixed(0)
                )}% of needed
              </div>
            </div>
          </div>
        </div>
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

// Main application code for the Indian Retirement Calculator - Part 1
// Contains: Initialization, Navigation, Form Handling, and Budget Calculation

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
    alert("PDF export functionality would be implemented here");
    // Implementation would require a PDF generation library
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
        alert("Please enter a valid age between 18 and 75.");
        isValid = false;
      } else if (!retirementAge || retirementAge <= age || retirementAge > 80) {
        alert(
          "Please enter a valid retirement age greater than your current age and up to 80."
        );
        isValid = false;
      } else if (!location) {
        alert("Please select your location.");
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
        alert("Please enter a valid monthly income (minimum ₹5,000).");
        isValid = false;
      } else if (
        housingStatus === "loan" &&
        !housingEmiSection.classList.contains("hidden")
      ) {
        const housingEmi = parseFloat(
          document.getElementById("housing-emi").value
        );
        if (!housingEmi && housingEmi !== 0) {
          alert("Please enter your current housing EMI amount.");
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

// === DATA COLLECTION AND CALCULATION ===

function calculateResults() {
  // Get all user inputs
  const userData = collectUserInputs();

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

  if (tier1Cities.includes(location)) {
    return 1; // Metro
  } else if (tier2Cities.includes(location)) {
    return 2; // Tier 2
  } else {
    return 3; // Tier 3 or other
  }
}

// === UTILITY FUNCTIONS ===

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

function getChildrenCount(familyComposition) {
  if (!familyComposition || !Array.isArray(familyComposition)) {
    return 0;
  }

  return familyComposition.filter(
    (member) => member.relationship === "child" && member.dependent === true
  ).length;
}

function getLocationMultiplier(tier) {
  // Location multipliers from the requirements
  const multipliers = {
    1: 1.0, // Metro
    2: 0.7, // Tier 2
    3: 0.5, // Tier 3
  };

  return multipliers[tier] || 0.7; // Default to Tier 2 if not found
}

function getFamilySizeFactor(size) {
  // Family size factors from the requirements
  const factors = {
    1: 0.7,
    2: 1.0,
    3: 1.2,
    4: 1.4,
    5: 1.5,
  };

  // For families larger than 5
  if (size > 5) {
    return 1.5 + 0.1 * (size - 5);
  }

  return factors[size] || 1.0; // Default to 1.0 if not found
}

// === BUDGET ALLOCATION ENGINE ===

function calculateBudgetAllocation(userData) {
  // Get location multiplier
  const locationMultiplier = getLocationMultiplier(userData.locationTier);

  // Get family size factor
  const familySizeFactor = getFamilySizeFactor(userData.familySize);

  // Calculate base essential expenses
  const housingBase = 20000;
  const foodBase = 15000;
  const utilitiesBase = 7000;
  const transportBase = 6000;
  const healthcareBase = 3000;
  const educationPerChild = 6000;
  const personalBase = 4000;
  const householdBase = 5000;

  // Apply multipliers for location and family size
  let housing = housingBase * locationMultiplier * familySizeFactor;
  const food = foodBase * locationMultiplier * familySizeFactor;
  const utilities = utilitiesBase * locationMultiplier * familySizeFactor;
  const transport = transportBase * locationMultiplier * familySizeFactor;
  const healthcare = healthcareBase * locationMultiplier * familySizeFactor;
  const personal = personalBase * locationMultiplier * familySizeFactor;
  const household = householdBase * locationMultiplier * familySizeFactor;

  // Calculate education based on number of children
  const childrenCount = getChildrenCount(userData.familyComposition);
  const education = educationPerChild * childrenCount * locationMultiplier;

  // Apply housing situation adjustments
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

  // Calculate appropriate savings rate
  let minSavingsRate = 0.05; // Default 5%

  // Adjust based on income
  if (userData.monthlyIncome < 30000) {
    minSavingsRate = 0.05; // 5% minimum
  } else if (userData.monthlyIncome < 60000) {
    minSavingsRate = 0.1; // 10% minimum
  } else if (userData.monthlyIncome < 150000) {
    minSavingsRate = 0.15; // 15% minimum
  } else {
    minSavingsRate = 0.2; // 20% minimum
  }

  // Calculate target savings rate based on retirement goals
  let targetSavingsRate = 0.2; // Default
  const yearsToRetirement = userData.retirementAge - userData.age;

  if (yearsToRetirement < 10) {
    targetSavingsRate = 0.4; // Aggressive savings needed
  } else if (yearsToRetirement < 20) {
    targetSavingsRate = 0.3; // Strong savings needed
  } else if (yearsToRetirement < 30) {
    targetSavingsRate = 0.25; // Moderate savings needed
  } else {
    targetSavingsRate = 0.2; // Standard savings rate
  }

  // Calculate required monthly savings for retirement
  // This is a placeholder until we calculate the full retirement corpus
  const estimatedMonthlyIncome = userData.monthlyIncome * 0.7; // Assume 70% of current income needed in retirement
  const yearsInRetirement = userData.lifeExpectancy - userData.retirementAge;
  const retirementCorpusEstimate =
    estimatedMonthlyIncome * 12 * yearsInRetirement;
  const monthsToRetirement = yearsToRetirement * 12;
  const requiredMonthlySavings = retirementCorpusEstimate / monthsToRetirement;
  const requiredSavingsRate = requiredMonthlySavings / userData.monthlyIncome;

  // Select appropriate rate
  const savingsRate = Math.max(minSavingsRate, requiredSavingsRate);

  // Calculate disposable income after essentials
  const disposableIncome = userData.monthlyIncome - totalEssentials;

  // Calculate minimum savings amount
  const minimumSavings = userData.monthlyIncome * minSavingsRate;

  // Initialize variables for allocations
  let retirementSavings = 0;
  let shortTermSavings = 0;
  let discretionary = 0;
  let deficit = 0;

  // Calculate retirement savings based on priority
  if (userData.financialPriority === "future_focused") {
    if (disposableIncome > minimumSavings) {
      retirementSavings = Math.max(
        requiredMonthlySavings,
        disposableIncome * 0.7
      );
    } else {
      retirementSavings = minimumSavings;
    }
  } else if (userData.financialPriority === "balanced") {
    if (disposableIncome > minimumSavings) {
      retirementSavings = Math.max(
        requiredMonthlySavings,
        disposableIncome * 0.5
      );
    } else {
      retirementSavings = minimumSavings;
    }
  } else if (userData.financialPriority === "current_focused") {
    retirementSavings = Math.max(minimumSavings, requiredMonthlySavings * 0.6);
  }

  // Check if retirement savings exceeds disposable income
  if (retirementSavings > disposableIncome) {
    deficit = retirementSavings - disposableIncome;
    retirementSavings = disposableIncome;
  } else {
    // Calculate remaining funds for discretionary spending
    const remainingFunds = disposableIncome - retirementSavings;

    // Allocate to short-term savings and discretionary based on priority
    if (userData.financialPriority === "future_focused") {
      shortTermSavings = remainingFunds * 0.4;
      discretionary = remainingFunds * 0.6;
    } else if (userData.financialPriority === "balanced") {
      shortTermSavings = remainingFunds * 0.3;
      discretionary = remainingFunds * 0.7;
    } else if (userData.financialPriority === "current_focused") {
      shortTermSavings = remainingFunds * 0.2;
      discretionary = remainingFunds * 0.8;
    }
  }
  // Main application code for the Indian Retirement Calculator - Part 2
  // Contains: Budget Subcategories, Retirement Corpus Calculator, and Investment Recommendation Engine

  // === BUDGET ALLOCATION ENGINE (CONTINUED) ===

  // Calculate category and subcategory allocations
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

  const discretionaryBreakdown = {
    entertainment: discretionary * 0.3,
    shopping: discretionary * 0.3,
    travel: discretionary * 0.2,
    gifts: discretionary * 0.1,
    miscellaneous: discretionary * 0.1,
  };

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
    },
  };

  return budget;
}

function estimateTypicalEmi(locationTier) {
  // Estimated typical EMIs based on location tier
  const typicalEmis = {
    1: 30000, // Metro
    2: 20000, // Tier 2
    3: 12000, // Tier 3
  };

  return typicalEmis[locationTier] || 20000; // Default to Tier 2 if not found
}

// === RETIREMENT CORPUS CALCULATOR ===

function calculateRetirementCorpus(userData, budgetResults) {
  // Step 1: Calculate Future Monthly Expenses
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

  // Apply category-specific inflation for the years until retirement
  const yearsToRetirement = userData.retirementAge - userData.age;

  // Current inflation rates (as of 2025)
  const generalInflation = 0.04; // 4%
  const housingInflation = 0.05; // 5%
  const foodInflation = 0.04; // 4%
  const healthcareInflation = 0.07; // 7%

  // Calculate future monthly expenses by category
  const futureHousing =
    housingExpense * Math.pow(1 + housingInflation, yearsToRetirement);
  const futureFood =
    foodExpense * Math.pow(1 + foodInflation, yearsToRetirement);
  const futureHealthcare =
    healthcareExpense * Math.pow(1 + healthcareInflation, yearsToRetirement);
  const futureOther =
    otherExpense * Math.pow(1 + generalInflation, yearsToRetirement);

  // Total future monthly expenses
  let futureMonthlyExpenses =
    futureHousing + futureFood + futureHealthcare + futureOther;

  // Adjust for retirement lifestyle changes
  // -10% for transport, +20% for leisure, etc.
  futureMonthlyExpenses = applyRetirementLifestyleAdjustments(
    futureMonthlyExpenses
  );

  // Step 2: Calculate Corpus Using Withdrawal Rate Method
  // Convert to annual expenses
  const futureAnnualExpenses = futureMonthlyExpenses * 12;

  // Calculate corpus using withdrawal rate
  // Use 3% as safe withdrawal rate for conservative estimate
  const safeWithdrawalRate = 0.03;

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

  // Expected return rate before retirement (based on risk profile)
  let preRetirementReturn;
  if (userData.riskTolerance === "conservative") {
    preRetirementReturn = 0.07; // 7%
  } else if (userData.riskTolerance === "moderate") {
    preRetirementReturn = 0.09; // 9%
  } else {
    // aggressive
    preRetirementReturn = 0.11; // 11%
  }

  // Calculate future value of current savings
  const futureValueOfCurrentSavings =
    currentSavings * Math.pow(1 + preRetirementReturn, yearsToRetirement);

  // Additional corpus needed
  const additionalCorpusNeeded =
    totalCorpusRequired - futureValueOfCurrentSavings;

  // Calculate monthly savings needed
  let requiredMonthlySavings = 0;
  let excess = 0;

  if (additionalCorpusNeeded <= 0) {
    requiredMonthlySavings = 0;
    excess = Math.abs(additionalCorpusNeeded);
  } else {
    // Calculate monthly savings needed
    const monthlyRate = preRetirementReturn / 12;
    const monthsToRetirement = yearsToRetirement * 12;

    // Future value factor for regular payments
    const fvFactor =
      (Math.pow(1 + monthlyRate, monthsToRetirement) - 1) / monthlyRate;

    // Required monthly savings
    requiredMonthlySavings = additionalCorpusNeeded / fvFactor;
  }

  // Step 4: Generate Multiple Scenarios
  // Base scenario already calculated above

  // Early retirement scenario (5 years earlier)
  const earlyRetirementAge = Math.max(
    userData.age + 5,
    userData.retirementAge - 5
  );
  const earlyRetirementYears = earlyRetirementAge - userData.age;
  const earlyRetirementCorpus = calculateCorpusForRetirementAge(
    userData,
    budgetResults,
    earlyRetirementAge
  );
  const earlyRetirementMonthlySavings = calculateMonthlySavingsForCorpus(
    userData,
    earlyRetirementCorpus,
    currentSavings,
    earlyRetirementYears,
    preRetirementReturn
  );

  // Delayed retirement scenario (5 years later)
  const delayedRetirementAge = userData.retirementAge + 5;
  const delayedRetirementYears = delayedRetirementAge - userData.age;
  const delayedRetirementCorpus = calculateCorpusForRetirementAge(
    userData,
    budgetResults,
    delayedRetirementAge
  );
  const delayedRetirementMonthlySavings = calculateMonthlySavingsForCorpus(
    userData,
    delayedRetirementCorpus,
    currentSavings,
    delayedRetirementYears,
    preRetirementReturn
  );

  // Conservative returns scenario
  const conservativeReturnsCorpus = calculateCorpusWithReturns(
    userData,
    budgetResults,
    preRetirementReturn - 0.02,
    safeWithdrawalRate - 0.01
  );
  const conservativeReturnsMonthlySavings = calculateMonthlySavingsForCorpus(
    userData,
    conservativeReturnsCorpus,
    currentSavings,
    yearsToRetirement,
    preRetirementReturn - 0.02
  );

  // Reduced expenses scenario (-20% expenses in retirement)
  const reducedExpensesCorpus = calculateCorpusWithExpenseFactor(
    userData,
    budgetResults,
    0.8
  );
  const reducedExpensesMonthlySavings = calculateMonthlySavingsForCorpus(
    userData,
    reducedExpensesCorpus,
    currentSavings,
    yearsToRetirement,
    preRetirementReturn
  );

  // Combine all results
  const retirementResults = {
    // Current monthly expenses
    current_monthly_expenses: currentMonthlyExpenses,

    // Future expenses
    future_monthly_expenses: futureMonthlyExpenses,
    future_annual_expenses: futureAnnualExpenses,

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
    excess: excess,

    // Rate assumptions
    safe_withdrawal_rate: safeWithdrawalRate,
    pre_retirement_return: preRetirementReturn,

    // Multiple scenarios
    scenarios: {
      base: {
        retirement_age: userData.retirementAge,
        corpus: totalCorpusRequired,
        monthly_savings: requiredMonthlySavings,
      },
      early_retirement: {
        retirement_age: earlyRetirementAge,
        corpus: earlyRetirementCorpus,
        monthly_savings: earlyRetirementMonthlySavings,
      },
      delayed_retirement: {
        retirement_age: delayedRetirementAge,
        corpus: delayedRetirementCorpus,
        monthly_savings: delayedRetirementMonthlySavings,
      },
      conservative_returns: {
        retirement_age: userData.retirementAge,
        corpus: conservativeReturnsCorpus,
        monthly_savings: conservativeReturnsMonthlySavings,
        pre_retirement_return: preRetirementReturn - 0.02,
      },
      reduced_expenses: {
        retirement_age: userData.retirementAge,
        corpus: reducedExpensesCorpus,
        monthly_savings: reducedExpensesMonthlySavings,
        expense_factor: 0.8,
      },
    },

    // Retirement growth projections
    growth_projection: calculateRetirementGrowthProjection(
      userData,
      currentSavings,
      requiredMonthlySavings,
      preRetirementReturn
    ),
  };

  return retirementResults;
}

function applyRetirementLifestyleAdjustments(monthlyExpenses) {
  // This function implements retirement lifestyle adjustments
  // -10% for transport, +20% for leisure, etc.
  // For simplicity, we'll just apply a 5% reduction overall
  return monthlyExpenses * 0.95;
}

function calculateCorpusForRetirementAge(
  userData,
  budgetResults,
  retirementAge
) {
  // Calculate corpus needed for a different retirement age
  const yearsToRetirement = retirementAge - userData.age;
  const currentMonthlyExpenses =
    userData.monthlyExpenses > 0
      ? userData.monthlyExpenses
      : budgetResults.total_essentials + budgetResults.discretionary;

  // Apply inflation
  const inflatedMonthlyExpenses =
    currentMonthlyExpenses * Math.pow(1 + 0.04, yearsToRetirement); // Using 4% general inflation

  // Adjust for retirement lifestyle
  const adjustedMonthlyExpenses = applyRetirementLifestyleAdjustments(
    inflatedMonthlyExpenses
  );

  // Calculate annual expenses
  const annualExpenses = adjustedMonthlyExpenses * 12;

  // Calculate corpus using 3% withdrawal rate
  const baseCorpus = annualExpenses / 0.03;

  // Add buffer
  const buffer = annualExpenses * 2;

  return baseCorpus + buffer;
}

function calculateCorpusWithReturns(
  userData,
  budgetResults,
  preRetirementReturn,
  withdrawalRate
) {
  // Calculate corpus with different return assumptions
  const yearsToRetirement = userData.retirementAge - userData.age;
  const currentMonthlyExpenses =
    userData.monthlyExpenses > 0
      ? userData.monthlyExpenses
      : budgetResults.total_essentials + budgetResults.discretionary;

  // Apply inflation
  const inflatedMonthlyExpenses =
    currentMonthlyExpenses * Math.pow(1 + 0.04, yearsToRetirement);

  // Adjust for retirement lifestyle
  const adjustedMonthlyExpenses = applyRetirementLifestyleAdjustments(
    inflatedMonthlyExpenses
  );

  // Calculate annual expenses
  const annualExpenses = adjustedMonthlyExpenses * 12;

  // Calculate corpus using provided withdrawal rate
  const baseCorpus = annualExpenses / withdrawalRate;

  // Add buffer
  const buffer = annualExpenses * 2;

  return baseCorpus + buffer;
}

function calculateCorpusWithExpenseFactor(
  userData,
  budgetResults,
  expenseFactor
) {
  // Calculate corpus with reduced expenses in retirement
  const yearsToRetirement = userData.retirementAge - userData.age;
  const currentMonthlyExpenses =
    userData.monthlyExpenses > 0
      ? userData.monthlyExpenses
      : budgetResults.total_essentials + budgetResults.discretionary;

  // Apply inflation
  const inflatedMonthlyExpenses =
    currentMonthlyExpenses * Math.pow(1 + 0.04, yearsToRetirement);

  // Apply expense factor
  const adjustedMonthlyExpenses = inflatedMonthlyExpenses * expenseFactor;

  // Calculate annual expenses
  const annualExpenses = adjustedMonthlyExpenses * 12;

  // Calculate corpus using 3% withdrawal rate
  const baseCorpus = annualExpenses / 0.03;

  // Add buffer
  const buffer = annualExpenses * 2;

  return baseCorpus + buffer;
}

function calculateMonthlySavingsForCorpus(
  userData,
  corpusRequired,
  currentSavings,
  yearsToRetirement,
  returnRate
) {
  // Calculate future value of current savings
  const futureValueOfCurrentSavings =
    currentSavings * Math.pow(1 + returnRate, yearsToRetirement);

  // Additional corpus needed
  const additionalCorpusNeeded = corpusRequired - futureValueOfCurrentSavings;

  if (additionalCorpusNeeded <= 0) {
    return 0; // No additional savings needed
  }

  // Calculate monthly savings needed
  const monthlyRate = returnRate / 12;
  const monthsToRetirement = yearsToRetirement * 12;

  // Future value factor for regular payments
  const fvFactor =
    (Math.pow(1 + monthlyRate, monthsToRetirement) - 1) / monthlyRate;

  // Required monthly savings
  return additionalCorpusNeeded / fvFactor;
}

function calculateRetirementGrowthProjection(
  userData,
  currentSavings,
  monthlySavings,
  returnRate
) {
  const yearsToRetirement = userData.retirementAge - userData.age;
  const projection = [];

  let currentAge = userData.age;
  let currentAmount = currentSavings;

  for (let year = 0; year <= yearsToRetirement; year++) {
    // Calculate corpus at this point
    projection.push({
      age: currentAge,
      year: year,
      amount: currentAmount,
    });

    // Add one year of monthly contributions with returns
    const monthlyRate = returnRate / 12;
    // Formula for future value with regular contributions
    const yearlyContribution =
      monthlySavings *
      ((Math.pow(1 + monthlyRate, 12) - 1) / monthlyRate) *
      (1 + monthlyRate);

    // Add returns on existing amount
    currentAmount = currentAmount * (1 + returnRate) + yearlyContribution;
    currentAge++;
  }

  return projection;
}

// === INVESTMENT RECOMMENDATION ENGINE ===

function calculateInvestmentRecommendations(userData, retirementResults) {
  // Step 1: Calculate Base Asset Allocation
  // Age-based equity allocation (100 - age rule with modifications)
  let baseEquityAllocation = Math.max(30, 100 - userData.age);

  // Adjust based on risk profile
  let equityAdjustment = 0;
  if (userData.riskTolerance === "conservative") {
    equityAdjustment = -15;
  } else if (userData.riskTolerance === "moderate") {
    equityAdjustment = 0;
  } else {
    // aggressive
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

  // Step 2: Calculate Sub-Asset Allocations
  // Monthly investment amount is the required monthly savings from retirement calculation
  const monthlyInvestment = retirementResults.required_monthly_savings;

  // For equity portion
  let equityAllocationBreakdown = {};

  if (monthlyInvestment < 10000) {
    // Simpler equity allocation for smaller amounts
    equityAllocationBreakdown = {
      index_funds: equityPercent * 0.7,
      tax_saving_elss: equityPercent * 0.3,
    };
  } else if (monthlyInvestment < 50000) {
    // Moderate complexity
    equityAllocationBreakdown = {
      index_funds: equityPercent * 0.4,
      large_cap: equityPercent * 0.2,
      multi_cap: equityPercent * 0.2,
      tax_saving_elss: equityPercent * 0.2,
    };
  } else {
    // Full diversification
    equityAllocationBreakdown = {
      index_funds: equityPercent * 0.3,
      large_cap: equityPercent * 0.2,
      multi_cap: equityPercent * 0.15,
      mid_cap: equityPercent * 0.15,
      small_cap: equityPercent * 0.1,
      tax_saving_elss: equityPercent * 0.1,
    };
  }

  // For debt portion
  let debtAllocationBreakdown = {};

  if (monthlyInvestment < 10000) {
    // Simpler debt allocation
    debtAllocationBreakdown = {
      ppf: debtPercent * 0.7,
      fd: debtPercent * 0.3,
    };
  } else if (monthlyInvestment < 50000) {
    // Moderate complexity
    debtAllocationBreakdown = {
      ppf: debtPercent * 0.4,
      fd: debtPercent * 0.3,
      debt_funds: debtPercent * 0.3,
    };
  } else {
    // Full diversification
    debtAllocationBreakdown = {
      ppf: debtPercent * 0.3,
      fd: debtPercent * 0.2,
      debt_funds: debtPercent * 0.2,
      corporate_bonds: debtPercent * 0.15,
      govt_securities: debtPercent * 0.15,
    };
  }

  // Step 3: Adjust for Tax Efficiency
  // Get user's tax bracket (estimated based on income)
  const taxBracket = getTaxBracket(userData.monthlyIncome, userData.taxRegime);

  // If in higher tax brackets, adjust for tax efficiency
  if (taxBracket >= 0.2) {
    // 20% or higher
    // Increase allocation to tax-efficient options
    debtAllocationBreakdown.ppf = (debtAllocationBreakdown.ppf || 0) * 1.3;
    debtAllocationBreakdown.tax_free_bonds =
      (debtAllocationBreakdown.tax_free_bonds || 0) * 1.2;

    // Reduce allocation to tax-inefficient options
    debtAllocationBreakdown.fd = (debtAllocationBreakdown.fd || 0) * 0.7;

    // Normalize percentages to sum to debtPercent
    normalizeAllocationPercentages(debtAllocationBreakdown, debtPercent);
  }

  // Step 4: Calculate Monthly Investment Amounts
  // Calculate amounts for each investment type
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

  // Generate specific investment recommendations
  const specificRecommendations = generateInvestmentRecommendations(
    userData,
    monthlyInvestment,
    equityAllocationBreakdown,
    debtAllocationBreakdown,
    goldPercent,
    alternativePercent
  );

  // Return compiled results
  return {
    monthly_investment: monthlyInvestment,
    allocation_percentages: {
      equity: equityPercent * 100,
      debt: debtPercent * 100,
      gold: goldPercent * 100,
      alternatives: alternativePercent * 100,
    },
    category_totals: categoryTotals,
    allocation_breakdown: allocationDetail,
    investment_amounts: investmentAmounts,
    specific_recommendations: specificRecommendations,
  };
}

function getTaxBracket(monthlyIncome, taxRegime) {
  // Estimate tax bracket based on annual income
  const annualIncome = monthlyIncome * 12;

  if (taxRegime === "old") {
    // Old regime tax brackets (simplified)
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
    // New regime tax brackets (simplified)
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

function normalizeAllocationPercentages(allocationBreakdown, targetTotal) {
  // Calculate current total
  let currentTotal = 0;
  for (const percent of Object.values(allocationBreakdown)) {
    currentTotal += percent;
  }

  // If current total is 0, can't normalize
  if (currentTotal === 0) return;

  // Normalize to target total
  const ratio = targetTotal / currentTotal;
  for (const key in allocationBreakdown) {
    allocationBreakdown[key] *= ratio;
  }
}

function generateInvestmentRecommendations(
  userData,
  monthlyInvestment,
  equityAllocation,
  debtAllocation,
  goldPercent,
  alternativePercent
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
    });
  }
  // Main application code for the Indian Retirement Calculator - Part 3
  // Contains: End of Investment Engine, Optimization Engine, and UI Update Functions

  // === INVESTMENT RECOMMENDATION ENGINE (CONTINUED) ===

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
    });
  }

  if (debtAllocation.corporate_bonds) {
    recommendations.debt.push({
      type: "Corporate Bonds",
      allocation: debtAllocation.corporate_bonds * 100,
      amount: monthlyInvestment * debtAllocation.corporate_bonds,
      details: "Higher yields than government securities with moderate risk",
      options: ["AAA-rated corporate bonds", "PSU bonds", "Bond ETFs"],
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
    });
  }

  // Alternative recommendations
  if (alternativePercent > 0) {
    recommendations.alternatives.push({
      type: "Alternative Investments",
      allocation: alternativePercent * 100,
      amount: monthlyInvestment * alternativePercent,
      details: "Diversification beyond traditional asset classes",
      options: ["REITs", "InvITs", "P2P Lending Platforms"],
    });
  }

  return recommendations;
}

// === EXPENSE OPTIMIZATION ENGINE ===

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
        excess_percentage:
          ((spending - benchmark.typical) / benchmark.typical) * 100,
        potential_savings: {
          conservative: conservativeSavings,
          moderate: moderateSavings,
          aggressive: aggressiveSavings,
        },
      });
    }
  }

  // Step 3: Generate Specific Recommendations
  for (const opportunity of opportunities) {
    const recommendations = generateRecommendationsForCategory(
      opportunity.category,
      opportunity.potential_savings
    );

    opportunity.recommendations = recommendations;
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
  };
}

function calculateBenchmarksForProfile(userData) {
  // Calculate typical spending ranges for user's profile
  const monthlyIncome = userData.monthlyIncome;

  // These are percentages of income for each category
  const benchmarks = {
    housing: {
      min: monthlyIncome * 0.15,
      typical: monthlyIncome * 0.25,
      max: monthlyIncome * 0.35,
    },
    food: {
      min: monthlyIncome * 0.1,
      typical: monthlyIncome * 0.15,
      max: monthlyIncome * 0.2,
    },
    utilities: {
      min: monthlyIncome * 0.03,
      typical: monthlyIncome * 0.05,
      max: monthlyIncome * 0.08,
    },
    transport: {
      min: monthlyIncome * 0.05,
      typical: monthlyIncome * 0.1,
      max: monthlyIncome * 0.15,
    },
    healthcare: {
      min: monthlyIncome * 0.02,
      typical: monthlyIncome * 0.05,
      max: monthlyIncome * 0.08,
    },
    education: {
      min: monthlyIncome * 0.05,
      typical: monthlyIncome * 0.1,
      max: monthlyIncome * 0.15,
    },
    personal: {
      min: monthlyIncome * 0.03,
      typical: monthlyIncome * 0.05,
      max: monthlyIncome * 0.08,
    },
    household: {
      min: monthlyIncome * 0.03,
      typical: monthlyIncome * 0.05,
      max: monthlyIncome * 0.08,
    },
    discretionary: {
      min: monthlyIncome * 0.05,
      typical: monthlyIncome * 0.1,
      max: monthlyIncome * 0.2,
    },
  };

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

function generateRecommendationsForCategory(category, potentialSavings) {
  const recommendations = [];

  switch (category) {
    case "housing":
      recommendations.push(
        {
          action: "Consider moving to a nearby area with lower rent",
          impact: potentialSavings.moderate,
          effort: "high",
        },
        {
          action: "Negotiate rent with current landlord",
          impact: potentialSavings.conservative,
          effort: "low",
        },
        {
          action: "Find a roommate to share expenses",
          impact: potentialSavings.aggressive,
          effort: "medium",
        },
        {
          action: "Refinance your home loan for better interest rates",
          impact: potentialSavings.conservative,
          effort: "medium",
        }
      );
      break;

    case "food":
      recommendations.push(
        {
          action: "Reduce eating out frequency by half",
          impact: potentialSavings.moderate,
          effort: "medium",
        },
        {
          action: "Plan meals and grocery shopping in advance",
          impact: potentialSavings.conservative,
          effort: "low",
        },
        {
          action: "Buy groceries from local markets instead of premium stores",
          impact: potentialSavings.conservative,
          effort: "low",
        },
        {
          action: "Cook in bulk and store meals for the week",
          impact: potentialSavings.moderate,
          effort: "medium",
        }
      );
      break;

    case "utilities":
      recommendations.push(
        {
          action: "Switch to energy-efficient appliances",
          impact: potentialSavings.moderate,
          effort: "high",
        },
        {
          action: "Install LED bulbs throughout your home",
          impact: potentialSavings.conservative,
          effort: "low",
        },
        {
          action: "Optimize AC temperature settings (increase by 1-2°C)",
          impact: potentialSavings.conservative,
          effort: "low",
        },
        {
          action: "Switch to a more affordable internet/cable plan",
          impact: potentialSavings.moderate,
          effort: "low",
        }
      );
      break;

    case "transport":
      recommendations.push(
        {
          action: "Use public transportation more frequently",
          impact: potentialSavings.aggressive,
          effort: "medium",
        },
        {
          action: "Carpool for regular commutes",
          impact: potentialSavings.moderate,
          effort: "medium",
        },
        {
          action: "Compare fuel prices and refuel at cheaper stations",
          impact: potentialSavings.conservative,
          effort: "low",
        },
        {
          action: "Maintain your vehicle regularly to improve fuel efficiency",
          impact: potentialSavings.conservative,
          effort: "medium",
        }
      );
      break;

    case "discretionary":
      recommendations.push(
        {
          action: "Create a specific entertainment budget and stick to it",
          impact: potentialSavings.moderate,
          effort: "low",
        },
        {
          action: "Use free or discounted entertainment options",
          impact: potentialSavings.conservative,
          effort: "low",
        },
        {
          action: "Implement a 48-hour rule for non-essential purchases",
          impact: potentialSavings.aggressive,
          effort: "medium",
        },
        {
          action: "Cancel unused subscriptions and memberships",
          impact: potentialSavings.moderate,
          effort: "low",
        }
      );
      break;

    default:
      recommendations.push(
        {
          action: `Review your ${category} expenses and identify non-essential items`,
          impact: potentialSavings.moderate,
          effort: "medium",
        },
        {
          action: `Set a monthly budget for ${category} and track spending`,
          impact: potentialSavings.conservative,
          effort: "low",
        },
        {
          action: `Look for discounts and alternatives for ${category} expenses`,
          impact: potentialSavings.conservative,
          effort: "medium",
        }
      );
  }

  return recommendations;
}

// === UI UPDATE FUNCTIONS ===

function updateResultsUI(
  userData,
  budgetResults,
  retirementResults,
  investmentResults,
  optimizationResults
) {
  // Update dashboard summary metrics
  updateSummaryMetrics(userData, budgetResults, retirementResults);

  // Update budget tab content
  updateBudgetTab(userData, budgetResults);

  // Update retirement tab content
  updateRetirementTab(userData, retirementResults);

  // Update investment tab content
  updateInvestmentTab(userData, investmentResults);

  // Update optimization tab content
  updateOptimizationTab(userData, optimizationResults, budgetResults);
}

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

  // Update monthly savings value
  document.getElementById("monthly-savings-value").textContent = formatCurrency(
    retirementResults.required_monthly_savings
  );

  // Update savings percentage
  document.getElementById("savings-percent").textContent = `${(
    (retirementResults.required_monthly_savings / userData.monthlyIncome) *
    100
  ).toFixed(1)}% of income`;
}

// === BUDGET TAB UI UPDATES ===

function updateBudgetTab(userData, budgetResults) {
  // Update budget breakdown table
  updateBudgetBreakdownTable(userData, budgetResults);

  // Update subcategory breakdown table
  updateSubcategoryBreakdownTable(budgetResults);

  // Create budget chart
  createBudgetChart(budgetResults);
}

function updateBudgetBreakdownTable(userData, budgetResults) {
  const table = document.getElementById("budget-breakdown-table");
  table.innerHTML = "";

  // Add essential expenses
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
  Object.entries(categoryDisplayNames).forEach(([category, displayName]) => {
    if (budgetResults[category] !== undefined) {
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
  });

  // Add total row
  const totalRow = document.createElement("tr");
  totalRow.classList.add("font-bold", "border-t-2", "border-gray-300");
  totalRow.innerHTML = `
        <td>Total</td>
        <td class="text-right">${formatCurrency(
          budgetResults.total_budget
        )}</td>
        <td class="text-right">100%</td>
    `;
  table.appendChild(totalRow);
}

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
  };

  // Add rows for each subcategory
  for (const [category, breakdown] of Object.entries(
    budgetResults.category_breakdown
  )) {
    const categoryName = categoryDisplayNames[category] || category;

    for (const [subcategory, amount] of Object.entries(breakdown)) {
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

function updateRetirementTab(userData, retirementResults) {
  // Update retirement details table
  updateRetirementDetailsTable(userData, retirementResults);

  // Update retirement scenarios
  updateRetirementScenarios(userData, retirementResults);

  // Create retirement growth chart
  createRetirementGrowthChart(userData, retirementResults);
}

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
      label: "Monthly Savings Required",
      value: formatCurrency(retirementResults.required_monthly_savings),
    },
  ];

  details.forEach((detail) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td class="font-medium">${detail.label}</td>
            <td class="text-right">${detail.value}</td>
        `;
    table.appendChild(row);
  });
}

function updateRetirementScenarios(userData, retirementResults) {
  const container = document.getElementById("retirement-scenarios");
  container.innerHTML = "";

  // Scenario display names and descriptions
  const scenarioDetails = {
    base: {
      title: "Base Plan",
      description: `Retirement at age ${retirementResults.scenarios.base.retirement_age}`,
    },
    early_retirement: {
      title: "Early Retirement",
      description: `Retirement at age ${retirementResults.scenarios.early_retirement.retirement_age}`,
    },
    delayed_retirement: {
      title: "Delayed Retirement",
      description: `Retirement at age ${retirementResults.scenarios.delayed_retirement.retirement_age}`,
    },
    conservative_returns: {
      title: "Conservative Returns",
      description: `Lower investment returns (${(
        retirementResults.scenarios.conservative_returns.pre_retirement_return *
        100
      ).toFixed(1)}%)`,
    },
    reduced_expenses: {
      title: "Reduced Expenses",
      description: `20% lower expenses in retirement`,
    },
  };

  // Add scenario cards
  for (const [key, scenario] of Object.entries(retirementResults.scenarios)) {
    const details = scenarioDetails[key] || {
      title: key.replace("_", " "),
      description: "",
    };

    const card = document.createElement("div");
    card.className = "scenario-card";
    card.innerHTML = `
            <div class="scenario-title">${details.title}</div>
            <div class="scenario-detail">${details.description}</div>
            <div class="scenario-detail">Corpus: ${formatCurrency(
              scenario.corpus
            )}</div>
            <div class="scenario-detail">Monthly Savings: ${formatCurrency(
              scenario.monthly_savings
            )}</div>
        `;
    container.appendChild(card);
  }
}

function createRetirementGrowthChart(userData, retirementResults) {
  const ctx = document
    .getElementById("retirement-growth-chart")
    .getContext("2d");

  // Prepare data for chart
  const labels = [];
  const data = [];

  retirementResults.growth_projection.forEach((point) => {
    labels.push(`Age ${point.age}`);
    data.push(point.amount);
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
          label: "Retirement Corpus Growth",
          data: data,
          backgroundColor: "rgba(79, 70, 229, 0.2)",
          borderColor: "rgba(79, 70, 229, 1)",
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: "rgba(79, 70, 229, 1)",
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
      },
    },
  });
}

// === INVESTMENT TAB UI UPDATES ===

function updateInvestmentTab(userData, investmentResults) {
  // Update investment breakdown table
  updateInvestmentBreakdownTable(investmentResults);

  // Update investment recommendations
  updateInvestmentRecommendations(investmentResults);

  // Create investment chart
  createInvestmentChart(investmentResults);
}

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

        const options = document.createElement("div");
        options.className =
          "text-sm bg-white p-2 rounded border border-gray-200";
        options.innerHTML = rec.options
          .map((opt) => `<div class="mb-1">• ${opt}</div>`)
          .join("");

        recCard.appendChild(header);
        recCard.appendChild(details);
        recCard.appendChild(options);

        section.appendChild(recCard);
      });

      container.appendChild(section);
    }
  });
}

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

// === OPTIMIZATION TAB UI UPDATES ===

function updateOptimizationTab(userData, optimizationResults, budgetResults) {
  const container = document.getElementById("optimization-opportunities");
  container.innerHTML = "";

  if (optimizationResults.opportunities.length === 0) {
    const noOpportunities = document.createElement("div");
    noOpportunities.className = "text-center py-4 text-gray-500";
    noOpportunities.textContent =
      "No significant optimization opportunities found. Your budget is well-balanced!";
    container.appendChild(noOpportunities);
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
    card.className = "opportunity-card mb-6";

    // Card header
    const header = document.createElement("div");
    header.className = "opportunity-header";
    header.innerHTML = `
            <div class="opportunity-title">${categoryName}</div>
            <div class="opportunity-amount">Save up to ${formatCurrency(
              opportunity.potential_savings.moderate
            )}</div>
        `;

    // Card details
    const details = document.createElement("div");
    details.className = "opportunity-details mb-4";
    details.innerHTML = `
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
        `;

    // Card recommendations
    const recommendations = document.createElement("div");
    recommendations.className = "opportunity-recommendations mt-4";

    opportunity.recommendations.forEach((rec) => {
      const recItem = document.createElement("div");
      recItem.className = "recommendation-item";

      // Set effort badge color
      let effortClass = "bg-gray-100 text-gray-600";
      if (rec.effort === "low") {
        effortClass = "bg-green-100 text-green-600";
      } else if (rec.effort === "high") {
        effortClass = "bg-red-100 text-red-600";
      }

      recItem.innerHTML = `
                <div class="recommendation-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="recommendation-text">
                    <div>${rec.action}</div>
                    <div>
                        <span class="recommendation-impact">Save ${formatCurrency(
                          rec.impact
                        )}</span>
                        <span class="recommendation-effort ${effortClass}">${
        rec.effort.charAt(0).toUpperCase() + rec.effort.slice(1)
      } effort</span>
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
}

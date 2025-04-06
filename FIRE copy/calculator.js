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
      Math.max(minimumSavings, requiredMonthlySavings * 0.3)
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

  // Short-term savings breakdown
  const shortTermSavingsBreakdown = {
    emergency_fund: shortTermSavings * 0.5,
    major_expenses: shortTermSavings * 0.3,
    life_goals: shortTermSavings * 0.2,
  };

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
      short_term_savings: shortTermSavingsBreakdown, // Add this line
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
  // Calculate projected corpus based on actual monthly savings
  const projectedMonthlyContribution = Math.min(
    requiredMonthlySavings,
    userData.monthlyIncome * MAX_RETIREMENT_SAVINGS_PERCENT[userData.incomeTier]
  );

  // Calculate projected corpus with current savings rate
  const projectedCorpus =
    futureValueOfCurrentSavings +
    calculateFutureSavedAmount(
      projectedMonthlyContribution,
      preRetirementReturn,
      yearsToRetirement
    );

  // Calculate retirement income breakdown for both scenarios
  const retirementIncomeBreakdown = calculateRetirementIncomeBreakdown(
    userData,
    totalCorpusRequired,
    projectedCorpus,
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
  // Calculate how much is available from budget (from budget results)
  const budgetAvailableForRetirement =
    budgetResults.retirement_savings ||
    userData.monthlyIncome *
      MAX_RETIREMENT_SAVINGS_PERCENT[userData.incomeTier];

  // Determine if ideal amount can be achieved with current budget
  const isIdealAchievable =
    requiredMonthlySavings <= budgetAvailableForRetirement;

  // Set recommended amount based on financial reality and goals
  // If ideal is achievable, use that amount, otherwise use what's available
  const recommendedAmount = isIdealAchievable
    ? requiredMonthlySavings
    : budgetAvailableForRetirement;

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
    budget_available: budgetAvailableForRetirement,
    recommended_monthly_savings: recommendedAmount,
    ideal_achievable: isIdealAchievable,
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
  // Consistent baseline adjustment factor for all income tiers
  const baseAdjustmentFactor = 0.85; // 15% reduction for everyone

  // Further modify based on financial priority (keep this part unchanged)
  let priorityModifier = 0;
  if (financialPriority === "future_focused") {
    priorityModifier = -0.05; // Additional 5% reduction for future-focused
  } else if (financialPriority === "current_focused") {
    priorityModifier = 0.05; // 5% less reduction for current-focused
  }

  // Calculate final adjustment factor
  const adjustmentFactor = baseAdjustmentFactor + priorityModifier;

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
 * @param {number} projectedCorpus Projected corpus based on current savings rate
 * @param {number} safeWithdrawalRate Safe withdrawal rate
 * @param {number} annualExpenses Projected annual expenses in retirement
 * @returns {Object} Breakdown of retirement income sources for both scenarios
 */
function calculateRetirementIncomeBreakdown(
  userData,
  totalCorpusRequired,
  projectedCorpus,
  safeWithdrawalRate,
  annualExpenses
) {
  // Calculate income for both scenarios
  const scenarios = {
    ideal: calculateScenarioIncome(
      userData,
      totalCorpusRequired,
      safeWithdrawalRate,
      annualExpenses,
      "ideal"
    ),
    projected: calculateScenarioIncome(
      userData,
      projectedCorpus,
      safeWithdrawalRate,
      annualExpenses,
      "projected"
    ),
  };

  return scenarios;
}

/**
 * Helper function to calculate income for a specific scenario
 */
function calculateScenarioIncome(
  userData,
  corpus,
  safeWithdrawalRate,
  annualExpenses,
  scenarioType
) {
  // Calculate annual income from corpus
  const annualIncomeFromCorpus = corpus * safeWithdrawalRate;

  // For Indian context, estimate other income sources
  // These are approximate estimates and could be refined with more inputs
  let epfAmount = 0;
  let npsAmount = 0;
  let rentalAmount = 0;
  let otherAmount = 0;

  // ===========================

  // Total annual retirement income
  const totalRetirementIncome = annualIncomeFromCorpus;

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
      corpus: 100, // Now 100% from corpus
      epf_ppf: 0,
      nps: 0,
      rental: 0,
      other: 0,
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
 * Fixes the percentage calculation bugs
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

  // Calculate future value of existing savings
  const futureSavingsValue = calculateFutureValue(
    totalSavings,
    INVESTMENT_RETURN_RATES[userData.riskTolerance].PRE_RETIREMENT,
    yearsToRetirement
  );

  // Calculate future value of monthly contributions using recommended savings
  const futureContributions = calculateFutureSavedAmount(
    requiredSavings, // Use the retirement calculator's recommended amount
    INVESTMENT_RETURN_RATES[userData.riskTolerance].PRE_RETIREMENT,
    yearsToRetirement
  );

  // Total projected corpus = existing savings growth + future contributions
  const projectedCorpus = futureSavingsValue + futureContributions;

  // Calculate corpus ratio (projected vs required)
  const corpusRatio = projectedCorpus / targetCorpus;

  // Calculate savings ratio (current vs required) - FIX: Correct calculation
  const savingsRatio = currentRetirementSavings / requiredSavings;

  // Calculate projected monthly income in retirement
  const safeWithdrawalRate = SAFE_WITHDRAWAL_RATES[userData.riskTolerance];
  const projectedMonthlyIncome = (projectedCorpus * safeWithdrawalRate) / 12;

  // Calculate future monthly expenses
  const futureMonthlyExpenses =
    userData.monthlyExpenses *
    Math.pow(1 + INFLATION_RATES.GENERAL, yearsToRetirement);

  // Calculate expense coverage ratio - important for a comprehensive assessment
  const corpusIncome = (projectedCorpus * safeWithdrawalRate) / 12;
  const expenseCoverageRatio = corpusIncome / futureMonthlyExpenses;
  // FIX: Base readiness score primarily on expense coverage, with corpus ratio as a factor
  let readinessScore;

  if (expenseCoverageRatio >= 0.98) {
    // If covering 98%+ of expenses, high score
    readinessScore = 95 + (expenseCoverageRatio - 0.98) * 250; // Max 100
    readinessScore = Math.min(100, readinessScore);
  } else if (expenseCoverageRatio >= 0.9) {
    // 90-98% expense coverage
    readinessScore = 80 + (expenseCoverageRatio - 0.9) * 187.5;
  } else if (expenseCoverageRatio >= 0.75) {
    // 75-90% expense coverage
    readinessScore = 60 + (expenseCoverageRatio - 0.75) * 133.3;
  } else if (expenseCoverageRatio >= 0.5) {
    // 50-75% expense coverage
    readinessScore = 40 + (expenseCoverageRatio - 0.5) * 80;
  } else {
    // Less than 50% coverage
    readinessScore = expenseCoverageRatio * 80;
  }

  // Round to nearest integer
  readinessScore = Math.round(readinessScore);

  // Determine status based on new score
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
    savings_ratio: currentRetirementSavings / requiredSavings, // Fixed calculation
    expense_coverage_ratio: expenseCoverageRatio, // New metric for clarity
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

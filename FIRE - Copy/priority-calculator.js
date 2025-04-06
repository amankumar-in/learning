// priority-calculator.js

/**
 * Applies priority and income-specific adjustments to budget allocations
 * @param {Object} userData User data including financial information
 * @param {Object} budgetData Base budget calculations before priority adjustments
 * @returns {Object} Adjusted budget allocations
 */
function applyPriorityAdjustments(userData, budgetData) {
  // Get template for current priority and income tier
  const priorityTemplate = PRIORITY_TEMPLATES[userData.financialPriority];
  const tierAdjustments =
    priorityTemplate.income_tier_adjustments[userData.incomeTier];

  // Calculate adjusted retirement savings
  let adjustedRetirement = calculateAdjustedRetirement(
    userData,
    budgetData.disposableIncome,
    budgetData.requiredMonthlySavings,
    budgetData.minimumSavings,
    budgetData.cappedRetirementSavings,
    tierAdjustments
  );

  // Calculate remaining funds after retirement allocation
  const remainingFunds = budgetData.disposableIncome - adjustedRetirement;

  // Calculate short-term savings percentage with priority adjustment
  const baseStSavingsPercent = getShortTermSavingsPercent(
    userData.incomeTier,
    "balanced" // Use balanced as baseline
  );

  // Apply multiplier from template
  const adjustedStSavingsPercent =
    baseStSavingsPercent * tierAdjustments.shortterm_multiplier;

  // Estimate monthly expenses from available data
  const monthlyExpenses =
    userData.monthlyExpenses ||
    userData.monthlyIncome - budgetData.disposableIncome;

  // Calculate emergency fund target
  const emergencyFundTarget =
    monthlyExpenses * EMERGENCY_FUND_TARGETS[userData.incomeTier];

  // Estimate current emergency fund - assume 30% of current savings is for emergencies
  const estimatedEmergencyFund = userData.currentSavings
    ? userData.currentSavings * 0.3
    : 0;

  // Calculate emergency fund gap
  const emergencyFundGap = Math.max(
    0,
    emergencyFundTarget - estimatedEmergencyFund
  );

  // Set minimum short-term savings if emergency fund isn't established
  // Fund emergency gap over 24 months (2 years), but cap at 30% of remaining funds
  const minShortTermSavings =
    emergencyFundGap > 0
      ? Math.min(remainingFunds * 0.3, emergencyFundGap / 24)
      : 0;

  // Calculate short-term savings and discretionary with emergency fund consideration
  const shortTermSavings = Math.max(
    minShortTermSavings,
    remainingFunds * adjustedStSavingsPercent
  );
  const discretionary = remainingFunds - shortTermSavings;

  // Build and return adjusted budget
  return {
    retirement_savings: adjustedRetirement,
    short_term_savings: shortTermSavings,
    discretionary: discretionary,
    total_savings: adjustedRetirement + shortTermSavings,
    priority_impacts: {
      retirement_multiplier: tierAdjustments.retirement_multiplier,
      shortterm_multiplier: tierAdjustments.shortterm_multiplier,
      discretionary_multiplier: tierAdjustments.discretionary_multiplier,
    },
    adjusted_minimum_rate: getAdjustedMinimumSavingsRate(userData),
  };
}

/**
 * Calculates adjusted retirement savings based on priority and constraints
 */
function calculateAdjustedRetirement(
  userData,
  disposableIncome,
  requiredMonthlySavings,
  minimumSavings,
  cappedRetirementSavings,
  tierAdjustments
) {
  // Get adjusted minimum savings with priority adjustment
  const adjustedMinimum = getAdjustedMinimumRate(userData);

  // Use the same multiplier from PRIORITY_TEMPLATES that consistency scoring uses
  const priorityMultiplier = tierAdjustments.retirement_multiplier;

  // Calculate target retirement allocation using consistent formula
  const targetRetirementAllocation = Math.min(
    cappedRetirementSavings,
    Math.max(
      adjustedMinimum,
      Math.max(
        requiredMonthlySavings,
        disposableIncome * priorityMultiplier * 0.4 // Scale factor to align with previous behavior
      )
    )
  );

  return targetRetirementAllocation;
}

/**
 * Gets adjusted minimum savings rate based on priority and income tier
 */
function getAdjustedMinimumRate(userData) {
  const baseRate = MINIMUM_SAVINGS_RATES[userData.incomeTier];
  const adjustments =
    PRIORITY_TEMPLATES[userData.financialPriority].income_tier_adjustments[
      userData.incomeTier
    ];

  // Apply adjustment with floor of 1%
  return (
    Math.max(0.01, baseRate + (adjustments.min_savings_adjustment || 0)) *
    userData.monthlyIncome
  );
}

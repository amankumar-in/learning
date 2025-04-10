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
 * Generates a long-term wealth building plan with realistic milestones
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

  // ========= TIMELINE GENERATION (KEEP EXISTING CODE) =========
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
    // Calculate phase durations, ensuring we don't exceed retirement age
    const earlyAccumulationYears = Math.min(
      15,
      Math.floor(yearsToRetirement * 0.4)
    );
    const earlyAccumulationEnd = userData.age + earlyAccumulationYears;

    const midLifeYears = Math.min(
      Math.floor(yearsToRetirement * 0.4),
      userData.retirementAge - earlyAccumulationEnd
    );
    const midLifeEnd = earlyAccumulationEnd + midLifeYears;

    // If there's still time before retirement, add transition phase
    if (midLifeEnd < userData.retirementAge) {
      plan.timeline = [
        {
          phase: "Early Accumulation",
          years: `${userData.age} to ${earlyAccumulationEnd}`,
          focus: "Maximum growth potential",
          description:
            "Aggressive positioning in higher risk/return assets to maximize compound growth",
        },
        {
          phase: "Mid-Life Accumulation",
          years: `${earlyAccumulationEnd} to ${midLifeEnd}`,
          focus: "Strong growth with increasing diversification",
          description:
            "Maintaining significant growth exposure with introduction of more diverse asset classes",
        },
        {
          phase: "Pre-Retirement Transition",
          years: `${midLifeEnd} to ${userData.retirementAge}`,
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
    } else {
      // If mid-life phase would exceed retirement age, adjust phases to fit
      const adjustedEarlyYears = Math.floor(yearsToRetirement * 0.5); // 50% of time to retirement

      plan.timeline = [
        {
          phase: "Early Accumulation",
          years: `${userData.age} to ${userData.age + adjustedEarlyYears}`,
          focus: "Maximum growth potential",
          description:
            "Aggressive positioning in higher risk/return assets to maximize compound growth",
        },
        {
          phase: "Pre-Retirement Transition",
          years: `${userData.age + adjustedEarlyYears} to ${
            userData.retirementAge
          }`,
          focus: "Balanced growth with increasing preservation",
          description:
            "Gradual shift towards more conservative allocations while maintaining growth component",
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
  }

  // ========= MILESTONE GENERATION (UPDATED CODE) =========
  // Calculate monthly disposable income for realistic milestones
  const monthlyExpenses =
    userData.monthlyExpenses > 0
      ? userData.monthlyExpenses
      : userData.monthlyIncome * 0.65; // Assume 65% expenses if not provided

  const monthlyDisposable = userData.monthlyIncome - monthlyExpenses;
  const annualDisposable = monthlyDisposable * 12;

  // Emergency fund based on expenses (realistic for all tiers)
  let emergencyMonths;
  if (userData.incomeTier === "VERY_LOW" || userData.incomeTier === "LOW") {
    emergencyMonths = 3; // 3 months for lower income
  } else if (
    userData.incomeTier === "LOWER_MIDDLE" ||
    userData.incomeTier === "MIDDLE"
  ) {
    emergencyMonths = 6; // 6 months for middle income
  } else {
    emergencyMonths = 12; // 12 months for high income
  }

  const emergencyFundTarget = monthlyExpenses * emergencyMonths;
  const emergencyFundMonths = Math.ceil(
    emergencyFundTarget / monthlyDisposable
  );
  const emergencyFundTimeframe =
    emergencyFundMonths <= 12
      ? "1 year"
      : `${Math.ceil(emergencyFundMonths / 12)} years`;

  // Generate milestones based on income tier with realistic targets
  if (userData.incomeTier === "VERY_LOW" || userData.incomeTier === "LOW") {
    // Basic milestones for lower income but with realistic targets
    const tinyEmergencyFund = monthlyExpenses * 2; // 2 months of expenses
    const basicRetirementSavings = monthlyDisposable * 24; // 2 years of savings

    plan.milestones = [
      {
        name: "Emergency Fund",
        description: `Build ₹${tinyEmergencyFund.toLocaleString()} emergency fund (2 months expenses)`,
        timeframe:
          Math.ceil(tinyEmergencyFund / monthlyDisposable) <= 12
            ? `${Math.ceil(tinyEmergencyFund / monthlyDisposable)} months`
            : `${Math.ceil(tinyEmergencyFund / monthlyDisposable / 12)} years`,
      },
      {
        name: "Debt Elimination",
        description: "Pay off all high-interest debts",
        timeframe: "1-2 years",
      },
      {
        name: "Basic Retirement Savings",
        description: `Start regular investments of ₹${Math.floor(
          monthlyDisposable * 0.2
        ).toLocaleString()} per month`,
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
    // More comprehensive milestones for middle income with realistic targets
    const retirementBaseTarget = monthlyDisposable * 36; // 3 years of savings capacity
    const majorLifeGoalTarget = monthlyDisposable * 60; // 5 years of savings capacity
    const wealthTarget = monthlyDisposable * 120; // 10 years of savings capacity
    const wealthAge = userData.age + Math.ceil(wealthTarget / annualDisposable);

    plan.milestones = [
      {
        name: "Emergency Fund",
        description: `Build ₹${emergencyFundTarget.toLocaleString()} emergency fund (${emergencyMonths} months expenses)`,
        timeframe: emergencyFundTimeframe,
      },
      {
        name: "Debt Optimization",
        description: "Eliminate high-interest debt, optimize low-interest debt",
        timeframe: "1-2 years",
      },
      {
        name: "Retirement Base",
        description: `Accumulate ₹${retirementBaseTarget.toLocaleString()} in retirement accounts`,
        timeframe: "3 years",
      },
      {
        name: "Major Life Goals",
        description: `Save ₹${majorLifeGoalTarget.toLocaleString()} for major life events (home, education, etc.)`,
        timeframe: "5 years",
      },
      {
        name: "Wealth Accumulation",
        description: `Grow portfolio to ₹${wealthTarget.toLocaleString()}`,
        timeframe: `By age ${wealthAge}`,
      },
    ];
  } else {
    // Sophisticated milestones for high income with realistic yet ambitious targets
    const retirementBaseTarget = monthlyDisposable * 48; // 4 years of savings capacity
    const corePortfolioTarget = monthlyDisposable * 60; // 5 years of savings capacity
    const wealthMilestone1 = monthlyDisposable * 120; // 10 years of savings
    const wealthMilestone2 = monthlyDisposable * 240; // 20 years of savings

    const wealthAge1 =
      userData.age + Math.ceil(wealthMilestone1 / annualDisposable);
    const wealthAge2 =
      userData.age + Math.ceil(wealthMilestone2 / annualDisposable);

    plan.milestones = [
      {
        name: "Emergency & Opportunity Fund",
        description: `Build ₹${emergencyFundTarget.toLocaleString()} liquid reserve (${emergencyMonths} months expenses)`,
        timeframe: emergencyFundTimeframe,
      },
      {
        name: "Tax-Optimized Foundation",
        description:
          "Maximize tax-advantaged accounts and optimize tax structure",
        timeframe: "1-2 years",
      },
      {
        name: "Core Portfolio",
        description: `Establish ₹${corePortfolioTarget.toLocaleString()} diversified investment base`,
        timeframe: "5 years",
      },
      {
        name: "Alternative Investments",
        description:
          "Allocate to real estate, private equity, or other alternatives",
        timeframe: "5-7 years",
      },
      {
        name: "Wealth Milestone 1",
        description: `Grow portfolio to ₹${wealthMilestone1.toLocaleString()}`,
        timeframe: `By age ${wealthAge1}`,
      },
      {
        name: "Wealth Milestone 2",
        description: `Grow portfolio to ₹${wealthMilestone2.toLocaleString()}`,
        timeframe: `By age ${wealthAge2}`,
      },
      {
        name: "Estate Planning",
        description:
          "Develop comprehensive wealth transfer and legacy strategy",
        timeframe: "10-15 years",
      },
    ];
  }

  // ========= STRATEGIES GENERATION (KEEP EXISTING CODE) =========
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

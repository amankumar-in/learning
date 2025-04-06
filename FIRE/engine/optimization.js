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
  // Adjust discretionary percentages based on income tier
  if (userData.incomeTier === "HIGH" || userData.incomeTier === "ULTRA_HIGH") {
    baseBenchmarks.discretionary.typical = 0.25; // 25% for high income
    baseBenchmarks.discretionary.max = 0.35; // 35% max
  } else if (userData.incomeTier === "MIDDLE") {
    baseBenchmarks.discretionary.typical = 0.15; // 15% for middle income
    baseBenchmarks.discretionary.max = 0.25; // 25% max
  }
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

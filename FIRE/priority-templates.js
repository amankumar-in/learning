// priority-templates.js

// Define distinct budget templates with income-sensitive adjustments
const PRIORITY_TEMPLATES = {
  future_focused: {
    title: "Future-Focused Strategy",
    description:
      "This strategy prioritizes your long-term financial security over current lifestyle enhancement. You'll build stronger reserves now, potentially delaying some immediate pleasures.",
    income_tier_adjustments: {
      VERY_LOW: {
        description:
          "Even at lower income levels, setting aside small amounts consistently creates powerful long-term results. This approach focuses on building your first safety net, even if that means postponing immediate wants.",
        retirement_multiplier: 1.3, // More modest adjustment for low incomes
        shortterm_multiplier: 1.4, // Emphasize emergency fund at low incomes
        discretionary_multiplier: 0.8, // Less reduction for low incomes
        min_savings_adjustment: -0.0, // No reduction to minimum
      },
      LOW: {
        description:
          "With limited resources, this approach prioritizes consistent saving for the future over current lifestyle enhancement. Building strong financial foundations now will create more freedom later.",
        retirement_multiplier: 1.4,
        shortterm_multiplier: 1.3,
        discretionary_multiplier: 0.8,
        min_savings_adjustment: -0.0,
      },
      LOWER_MIDDLE: {
        description:
          "Your income allows for meaningful retirement contributions while maintaining a reasonable lifestyle. This approach emphasizes maximizing your future security through consistent saving.",
        retirement_multiplier: 1.5,
        shortterm_multiplier: 1.2,
        discretionary_multiplier: 0.7,
        min_savings_adjustment: -0.0,
      },
      MIDDLE: {
        description:
          "At your income level, strong retirement saving now can significantly impact your future financial independence. This approach prioritizes building wealth through accelerated saving and investing.",
        retirement_multiplier: 1.5,
        shortterm_multiplier: 1.2,
        discretionary_multiplier: 0.7,
        min_savings_adjustment: -0.0,
      },
      HIGH: {
        description:
          "With your substantial income, this approach leverages your earning power to build significant wealth. You'll still enjoy a comfortable lifestyle while maximizing long-term growth potential.",
        retirement_multiplier: 1.6,
        shortterm_multiplier: 1.3,
        discretionary_multiplier: 0.6,
        min_savings_adjustment: -0.0,
      },
      ULTRA_HIGH: {
        description:
          "This approach focuses on wealth building, legacy planning, and potential early financial independence. Your high income enables significant wealth accumulation while still enjoying a premium lifestyle.",
        retirement_multiplier: 1.7,
        shortterm_multiplier: 1.4,
        discretionary_multiplier: 0.6,
        min_savings_adjustment: -0.0,
      },
    },
    lifestyle_impact: {
      VERY_LOW:
        "While this approach reduces discretionary spending, you'll maintain essential quality of life while building crucial financial security.",
      LOW: "You may need to delay some non-essential purchases, but you'll be building financial security much faster than average.",
      MIDDLE:
        "You'll still enjoy a comfortable lifestyle, though with fewer luxuries than peers with similar incomes.",
      HIGH: "Your lifestyle will remain comfortable by most standards, though more modest than what your income might typically support.",
    },
    constraints_explanation:
      "Even with a future-focused approach, your basic needs always come first. Our recommendations ensure a minimum quality of life regardless of future goals.",
    advice: [
      "Maximize tax-advantaged retirement accounts first",
      "Automate savings to remove the temptation to spend",
      "Prioritize debt elimination before lifestyle upgrades",
      "Consider delaying major discretionary purchases",
    ],
  },

  balanced: {
    title: "Balanced Financial Approach",
    description:
      "This approach seeks equilibrium between present enjoyment and future security. You'll make steady progress toward financial goals while maintaining a comfortable lifestyle today.",
    income_tier_adjustments: {
      VERY_LOW: {
        description:
          "At your income level, balancing today's needs with future goals means making steady, small steps toward financial security while ensuring your immediate quality of life.",
        retirement_multiplier: 1.0,
        shortterm_multiplier: 1.0,
        discretionary_multiplier: 1.0,
        min_savings_adjustment: -0.0,
      },
      LOW: {
        description:
          "Your balanced approach means steadily building financial security without sacrificing the small pleasures that make daily life enjoyable.",
        retirement_multiplier: 1.0,
        shortterm_multiplier: 1.0,
        discretionary_multiplier: 1.0,
        min_savings_adjustment: -0.0,
      },
      LOWER_MIDDLE: {
        description:
          "With this balanced approach, you're making solid progress toward future goals while enjoying a comfortable lifestyle relative to your income.",
        retirement_multiplier: 1.0,
        shortterm_multiplier: 1.0,
        discretionary_multiplier: 1.0,
        min_savings_adjustment: -0.0,
      },
      MIDDLE: {
        description:
          "Your income supports both meaningful saving for the future and a comfortable lifestyle today. This balanced approach helps you avoid feeling deprived while making solid financial progress.",
        retirement_multiplier: 1.0,
        shortterm_multiplier: 1.0,
        discretionary_multiplier: 1.0,
        min_savings_adjustment: -0.0,
      },
      HIGH: {
        description:
          "This approach leverages your high income to build substantial wealth while still enjoying many of life's luxuries, creating a sustainable balance between present and future.",
        retirement_multiplier: 1.0,
        shortterm_multiplier: 1.0,
        discretionary_multiplier: 1.0,
        min_savings_adjustment: -0.0,
      },
      ULTRA_HIGH: {
        description:
          "With your exceptional income, this approach ensures significant wealth accumulation while allowing you to enjoy a premium lifestyle commensurate with your success.",
        retirement_multiplier: 1.0,
        shortterm_multiplier: 1.0,
        discretionary_multiplier: 1.0,
        min_savings_adjustment: -0.0,
      },
    },
    lifestyle_impact: {
      VERY_LOW:
        "You'll maintain a careful balance between immediate needs and future security, with modest discretionary spending.",
      LOW: "Your balanced approach allows for some small indulgences while making regular progress toward financial goals.",
      MIDDLE:
        "You'll enjoy a lifestyle in line with social norms for your income level, while maintaining healthy saving habits.",
      HIGH: "Your lifestyle will be comfortable and include many luxuries, though not at the expense of solid wealth building.",
    },
    constraints_explanation:
      "Life requires balance. Our recommendations aim to help you enjoy today while preparing for tomorrow, adjusted for your unique financial situation.",
    advice: [
      "Maintain consistent contributions to retirement accounts",
      "Create separate funds for short and long-term goals",
      "Review your balance quarterly and adjust as needed",
      "Enjoy planned luxuries that align with your values",
    ],
  },

  current_focused: {
    title: "Current Lifestyle Priority",
    description:
      "This approach emphasizes quality of life in the present while maintaining basic progress toward future goals. You'll allocate more to discretionary spending but still maintain essential saving habits.",
    income_tier_adjustments: {
      VERY_LOW: {
        description:
          "Even with limited resources, this approach helps you balance necessary saving with small quality-of-life improvements that make daily life more enjoyable.",
        retirement_multiplier: 0.7,
        shortterm_multiplier: 0.7,
        discretionary_multiplier: 1.3,
        min_savings_adjustment: -0.005, // Reduce minimum by 0.5% for very low incomes
      },
      LOW: {
        description:
          "This approach prioritizes life enjoyment today while maintaining the minimum saving necessary for future stability. You'll have more resources for modest pleasures and experiences.",
        retirement_multiplier: 0.7,
        shortterm_multiplier: 0.7,
        discretionary_multiplier: 1.3,
        min_savings_adjustment: -0.01, // Reduce minimum by 1%
      },
      LOWER_MIDDLE: {
        description:
          "With this focus, you'll allocate more resources to enhancing your current lifestyle with experiences and purchases that bring joy today, while maintaining basic saving habits.",
        retirement_multiplier: 0.65,
        shortterm_multiplier: 0.7,
        discretionary_multiplier: 1.4,
        min_savings_adjustment: -0.02, // Reduce minimum by 2%
      },
      MIDDLE: {
        description:
          "Your income allows for significant lifestyle enhancement while still making progress toward future goals. This approach prioritizes experiences, comfort, and enjoyment today.",
        retirement_multiplier: 0.6,
        shortterm_multiplier: 0.7,
        discretionary_multiplier: 1.5,
        min_savings_adjustment: -0.03, // Reduce minimum by 3%
      },
      HIGH: {
        description:
          "This approach leverages your high income to create a premium lifestyle while still building wealth at a reasonable pace. You'll enjoy significantly more luxury and experiences today.",
        retirement_multiplier: 0.6,
        shortterm_multiplier: 0.6,
        discretionary_multiplier: 1.6,
        min_savings_adjustment: -0.04, // Reduce minimum by 4%
      },
      ULTRA_HIGH: {
        description:
          "With your exceptional income, this approach creates a truly luxurious lifestyle while still building substantial wealth. You'll maximize life experiences and comfort today.",
        retirement_multiplier: 0.55,
        shortterm_multiplier: 0.6,
        discretionary_multiplier: 1.7,
        min_savings_adjustment: -0.05, // Reduce minimum by 5%
      },
    },
    lifestyle_impact: {
      VERY_LOW:
        "You'll maintain minimum saving requirements but prioritize small improvements to daily life when possible.",
      LOW: "You'll balance necessary saving with more resources for modest pleasures and experiences.",
      MIDDLE:
        "You'll enjoy a lifestyle with more luxuries and experiences than typical for your income level.",
      HIGH: "Your lifestyle will include significant luxury and experiences, more in line with those earning above your income level.",
    },
    constraints_explanation:
      "While this approach prioritizes present enjoyment, we still ensure you're saving enough for basic future security. Some minimum saving is always necessary.",
    advice: [
      "Maintain minimum retirement contributions consistently",
      "Prioritize experiences that create happiness over material possessions",
      "Consider a 'fun fund' for guilt-free spending on things you enjoy",
      "Review and potentially extend your retirement timeline",
    ],
  },
};

// Calculate consistency score based on actual allocations vs template
function calculateConsistencyScore(allocations, priority, userData) {
  // Get template for selected priority with income-specific adjustments
  const template = PRIORITY_TEMPLATES[priority];
  const incomeTierAdjustments =
    template.income_tier_adjustments[userData.incomeTier];

  // Get constraint information
  const minSavingsRate = getAdjustedMinimumSavingsRate(userData);
  const hasMinimumOverride =
    allocations.actual.retirement / userData.monthlyIncome <= minSavingsRate;

  // Calculate how well actual allocations match the priority template
  const retirementIdeal =
    allocations.baseline.retirement *
    incomeTierAdjustments.retirement_multiplier;
  const shorttermIdeal =
    allocations.baseline.shortterm * incomeTierAdjustments.shortterm_multiplier;
  const discretionaryIdeal =
    allocations.baseline.discretionary *
    incomeTierAdjustments.discretionary_multiplier;

  // Calculate deviation from ideal (lower is better)
  const retirementDeviation =
    Math.abs(allocations.actual.retirement - retirementIdeal) / retirementIdeal;
  const shorttermDeviation =
    Math.abs(allocations.actual.shortterm - shorttermIdeal) / shorttermIdeal;
  const discretionaryDeviation =
    Math.abs(allocations.actual.discretionary - discretionaryIdeal) /
    discretionaryIdeal;

  // If minimum savings requirement is overriding the allocation,
  // reduce the weight of retirement in the consistency calculation
  let retirementWeight = 1.0;
  let shorttermWeight = 1.0;
  let discretionaryWeight = 1.0;

  if (hasMinimumOverride && priority === "current_focused") {
    retirementWeight = 0.3; // Reduce retirement weight if minimum is forcing higher allocation
    discretionaryWeight = 1.5; // Increase discretionary weight to compensate
  }

  // Calculate weighted average deviation
  const totalWeight = retirementWeight + shorttermWeight + discretionaryWeight;
  const weightedDeviation =
    (retirementDeviation * retirementWeight +
      shorttermDeviation * shorttermWeight +
      discretionaryDeviation * discretionaryWeight) /
    totalWeight;

  // Calculate overall consistency score (0-100, higher is better)
  const consistencyScore = Math.max(
    0,
    Math.min(100, 100 - weightedDeviation * 100)
  );

  return {
    score: consistencyScore,
    retirement: {
      ideal: retirementIdeal,
      actual: allocations.actual.retirement,
      match: 100 - retirementDeviation * 100,
      constrained: hasMinimumOverride,
    },
    shortterm: {
      ideal: shorttermIdeal,
      actual: allocations.actual.shortterm,
      match: 100 - shorttermDeviation * 100,
    },
    discretionary: {
      ideal: discretionaryIdeal,
      actual: allocations.actual.discretionary,
      match: 100 - discretionaryDeviation * 100,
    },
  };
}

// Get minimum savings rate adjusted by priority
function getAdjustedMinimumSavingsRate(userData) {
  // Get base minimum savings rate from constants
  const baseRate = MINIMUM_SAVINGS_RATES[userData.incomeTier];

  // Get adjustment for current priority
  const adjustment =
    PRIORITY_TEMPLATES[userData.financialPriority].income_tier_adjustments[
      userData.incomeTier
    ].min_savings_adjustment || 0;

  // Apply adjustment (ensuring minimum of 1%)
  return Math.max(0.01, baseRate + adjustment);
}

// Get recommendation text based on constraint status
function getConstraintRecommendation(consistencyResult, priority, incomeTier) {
  const template = PRIORITY_TEMPLATES[priority];

  // If retirement is constrained by minimum requirements
  if (
    consistencyResult.retirement.constrained &&
    priority === "current_focused"
  ) {
    if (incomeTier === "VERY_LOW" || incomeTier === "LOW") {
      return "Your retirement savings can't go lower due to minimum requirements we've set to ensure future security. Even with a current-focused approach, some basic retirement saving is essential.";
    } else {
      return "Your retirement savings are at the minimum required level for your income. While your priority is current lifestyle, we've maintained this minimum to ensure basic future security.";
    }
  }

  // If retirement is constrained by maximum cap
  if (
    consistencyResult.retirement.actual / consistencyResult.retirement.ideal <
      0.9 &&
    priority === "future_focused"
  ) {
    return "Your retirement savings may be limited by maximum contribution guidelines. Even with a future-focused approach, there are practical limits to retirement allocations.";
  }

  // Default guidance
  return template.constraints_explanation;
}

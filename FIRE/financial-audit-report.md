# FIRE Financial Planning System - Technical Audit Report

## System Analysis Matrix

Below is an analysis matrix showing key calculations across different user profiles. The inconsistencies highlighted demonstrate fundamental flaws in the system.

| Profile | Income | Age/Ret | Priority | Essential % | Req. Ret. % | Actual Ret. % | Consistency | Issue |
|---------|--------|---------|----------|------------|-------------|---------------|------------|-------|
| Low Income | ₹12,000 | 30/60 | balanced | 250% | 37.6% | 5% (capped) | -42% | **Essentials > Income** |
| Lower-Middle | ₹45,000 | 35/60 | future | 76.1% | 24.6% | 15% (capped) | +56% | **Required savings exceeds cap** |
| Middle Family | ₹1,00,000 | 45/65 | balanced | 67.2% | 72.1% | 32.8% | -19% | **Required > Disposable** |
| Pre-retirement | ₹80,000 | 55/65 | future | 40.3% | 272.6% | 50% (capped) | +21% | **Mathematically impossible** |
| High Income | ₹3,00,000 | 40/60 | future | 12.3% | 42.1% | 50% | -8% | **Negative score despite max contribution** |
| Very High | ₹5,00,000 | 42/62 | current | 8.6% | 25.3% | 25.3% | -81% | **Severe negative score despite meeting req.** |
| Ultra High | ₹15,00,000 | 45/65 | balanced | 5.1% | 13.2% | 13.2% | -121% | **Extreme negative score** |

## 1. Income Classification Issues

### 1.1. Income Tier Range Problems

**Problem:** Income tiers span ranges that are too wide, particularly for high incomes.

**Evidence:**
| **Income Tier** | **Current Range (Monthly)** | **Issues** |
|-----------------|----------------------------|------------|
| HIGH | ₹1,50,001-₹10,00,000 | Range spans 6.6x difference, grouping vastly different financial situations |
| MIDDLE | ₹60,001-₹1,50,000 | 2.5x difference within tier |

**Code Issue:**
```javascript
// In constants.js
const INCOME_TIERS = {
  VERY_LOW: 15000,    // ₹5,000-15,000
  LOW: 30000,         // ₹15,001-30,000
  LOWER_MIDDLE: 60000,// ₹30,001-60,000
  MIDDLE: 150000,     // ₹60,001-150,000
  HIGH: 1000000,      // ₹150,001-1,000,000 (6.7x range)
  ULTRA_HIGH: Infinity // ₹1,000,000+
};
```

**Fix:** Split the HIGH tier into multiple tiers:
```javascript
const INCOME_TIERS = {
  VERY_LOW: 15000,     // ₹5,000-15,000
  LOW: 30000,          // ₹15,001-30,000
  LOWER_MIDDLE: 60000, // ₹30,001-60,000
  MIDDLE: 150000,      // ₹60,001-150,000
  HIGH: 300000,        // ₹150,001-300,000
  VERY_HIGH: 600000,   // ₹300,001-600,000
  ULTRA_HIGH: 1000000, // ₹600,001-1,000,000
  SUPER_HIGH: Infinity // ₹1,000,000+
};
```

### 1.2. Maximum Retirement Savings Percentage Jumps

**Problem:** Maximum retirement savings caps have illogical jumps between tiers.

**Evidence:**
| **Income Tier** | **Current Max %** | **Issue** |
|-----------------|-------------------|-----------|
| LOWER_MIDDLE | 15% | Abrupt jump to next tier |
| MIDDLE | 50% | Unrealistically high jump from previous tier |

**Code Issue:**
```javascript
// In constants.js
const MAX_RETIREMENT_SAVINGS_PERCENT = {
  VERY_LOW: 0.05,  // 5%
  LOW: 0.1,        // 10%
  LOWER_MIDDLE: 0.15, // 15%
  MIDDLE: 0.5,     // 50% (35% jump from previous tier)
  HIGH: 0.5,       // 50%
  ULTRA_HIGH: 0.5  // 50%
};
```

**Fix:** Create smoother transitions:
```javascript
const MAX_RETIREMENT_SAVINGS_PERCENT = {
  VERY_LOW: 0.05,     // 5%
  LOW: 0.1,           // 10%
  LOWER_MIDDLE: 0.2,  // 20% (was 15%)
  MIDDLE: 0.3,        // 30% (was 50%)
  HIGH: 0.4,          // 40% (was 50%)
  VERY_HIGH: 0.45,    // 45% (new tier)
  ULTRA_HIGH: 0.5,    // 50%
  SUPER_HIGH: 0.5     // 50% (new tier)
};
```

## 2. Critical Mathematical Inconsistencies

### 2.1. Impossible Budget Allocations

**Problem:** For many scenarios, essential expenses plus required retirement savings exceed 100% of income.

**Example:** Low income user (₹12,000/month)
```
Essential expenses: ₹30,000 (250% of income)
Required retirement: ₹4,515 (37.6% of income)
TOTAL: 287.6% of income
```

**Code Issue:**
```javascript
// In calculateBudgetAllocation():
const totalEssentials = housing + food + utilities + transport + healthcare + education + personal + household;
// No validation that totalEssentials <= income
```

**Fix:** Implement reasonable scaling factor for essentials based on income constraints:
```javascript
const essentialScalingFactor = Math.min(1.0, (userData.monthlyIncome * 0.9) / totalEssentials);
const adjustedEssentials = totalEssentials * essentialScalingFactor;
```

### 2.2. Retirement Savings Requirements Exceed Available Income

**Problem:** Retirement calculations often produce required savings rates that are mathematically impossible.

**Example:** Pre-retirement user (₹80,000/month, age 55, retirement at 65)
```
Essential expenses: ₹32,200 (40.3% of income)
Disposable income: ₹47,800 (59.7% of income)
Required retirement savings: ₹218,051 (272.6% of income)
```

**Code Issue:**
```javascript
// calculateRetirementCorpus() calculates required amount without checking feasibility:
const requiredMonthlySavings = calculateRequiredMonthlySavings(
  additionalCorpusNeeded, preRetirementReturn, yearsToRetirement
);
// No validation against income
```

**Fix:** Add feasibility check and alternate scenario generation:
```javascript
if (requiredMonthlySavings > disposableIncome * 0.9) {
  const feasibleSavings = disposableIncome * 0.9;
  const achievablePercent = (feasibleSavings / requiredMonthlySavings) * 100;
  
  results.alternatives = [
    {
      name: "Delayed Retirement",
      additional_years: calculateYearsDelayNeeded(userData, feasibleSavings),
      monthly_savings: feasibleSavings
    },
    {
      name: "Reduced Retirement",
      percent_of_target: achievablePercent,
      monthly_savings: feasibleSavings
    }
  ];
}
```

### 2.3. Budget Allocation vs. Priority Consistency Conflict

**Problem:** The system allocates budget based on one set of rules, then scores the allocation against a different set of rules.

**Example:** High income user with future_focused priority (₹3,00,000/month)
```
Allocated retirement: ₹150,000 (50% of income, maximum allowed)
Consistency score: 41% with retirement match of -8%
```

**Code Issue:** The budget allocator and consistency scorer use contradictory formulas:
```javascript
// Budget allocation uses:
const cappedRetirementSavings = userData.monthlyIncome * MAX_RETIREMENT_SAVINGS_PERCENT[userData.incomeTier];

// But consistency score uses:
const retirementIdeal = allocations.baseline.retirement * incomeTierAdjustments.retirement_multiplier;
// Where HIGH tier future_focused has retirement_multiplier: 1.6
```

**Fix:** Align the calculation engines:
```javascript
// Use the same base formulas for both allocation and scoring:
const priorityMultiplier = PRIORITY_TEMPLATES[userData.financialPriority]
                          .income_tier_adjustments[userData.incomeTier]
                          .retirement_multiplier;
                          
const targetRetirementAllocation = Math.min(
  requiredMonthlySavings,
  userData.monthlyIncome * MAX_RETIREMENT_SAVINGS_PERCENT[userData.incomeTier],
  disposableIncome * priorityMultiplier
);
```

## 3. Unrealistic Financial Assumptions

### 3.1. Optimistic Investment Return Assumptions

**Problem:** The system uses fixed return rates that don't account for market cycles or volatility.

**Code Issue:**
```javascript
const INVESTMENT_RETURN_RATES = {
  CONSERVATIVE: {
    PRE_RETIREMENT: 0.07, // 7% for "conservative" is too high
    POST_RETIREMENT: 0.05,
  },
  MODERATE: {
    PRE_RETIREMENT: 0.09,
    POST_RETIREMENT: 0.06,
  },
  AGGRESSIVE: {
    PRE_RETIREMENT: 0.11,
    POST_RETIREMENT: 0.07,
  },
};
```

**Evidence:**
- Real conservative returns in India average 5-6% historically
- No consideration of sequence-of-returns risk

**Fix:** Adjust return assumptions and add volatility handling:
```javascript
const INVESTMENT_RETURN_RATES = {
  CONSERVATIVE: {
    PRE_RETIREMENT: 0.06,
    POST_RETIREMENT: 0.04,
    VOLATILITY: 0.03 // 3% standard deviation
  },
  MODERATE: {
    PRE_RETIREMENT: 0.08,
    POST_RETIREMENT: 0.05,
    VOLATILITY: 0.08
  },
  AGGRESSIVE: {
    PRE_RETIREMENT: 0.10,
    POST_RETIREMENT: 0.06,
    VOLATILITY: 0.15
  }
};
```

### 3.2. Safe Withdrawal Rate Issues

**Problem:** Fixed safe withdrawal rates don't account for multiple factors.

**Code Issue:**
```javascript
// In constants.js
const SAFE_WITHDRAWAL_RATES = {
  CONSERVATIVE: 0.025, // 2.5% safe withdrawal rate
  MODERATE: 0.03, // 3.0% safe withdrawal rate
  AGGRESSIVE: 0.035, // 3.5% safe withdrawal rate
};
```

**Evidence:**
- No adjustment for age at retirement (older retirees can withdraw more)
- No consideration of income mix (pension, rental, etc.)
- No accounting for market conditions

**Fix:** Implement dynamic SWR calculation:
```javascript
function calculateDynamicSWR(userData, marketCondition) {
  // Base rate from constants
  let baseRate = SAFE_WITHDRAWAL_RATES[userData.riskTolerance];
  
  // Age adjustment (add 0.1% for every 5 years over 65)
  const ageAdjustment = Math.max(0, (userData.retirementAge - 65) / 5) * 0.001;
  
  // Income source adjustment
  const pensionRatio = userData.pensionIncome / userData.totalRetirementIncome || 0;
  const incomeSourceAdjustment = pensionRatio * 0.005; // Up to 0.5% higher for pension income
  
  return baseRate + ageAdjustment + incomeSourceAdjustment;
}
```

### 3.3. Life Expectancy Does Not Significantly Impact Calculations

**Problem:** Changing life expectancy has minimal effect on corpus calculations.

**Evidence:**
- Testing shows changing life expectancy from 80 to 90 changes corpus requirement by only ~0.2%

**Code Issue:** The retirement phase calculation doesn't properly factor longevity:
```javascript
// In calculateRetirementCorpus():
const yearsInRetirement = userData.lifeExpectancy - userData.retirementAge;
// But this isn't sufficiently factored into corpus needs
```

**Fix:** Revise corpus calculation to properly account for longevity:
```javascript
// Adjust safe withdrawal rate based on expected retirement duration
const baseWithdrawalRate = SAFE_WITHDRAWAL_RATES[userData.riskTolerance];
const longevityFactor = Math.max(0.8, Math.min(1.2, 30 / yearsInRetirement));
const adjustedWithdrawalRate = baseWithdrawalRate * longevityFactor;

// Now use adjustedWithdrawalRate in corpus calculations
const baseCorpus = futureAnnualExpenses / adjustedWithdrawalRate;
```

### 3.4. Unrealistic Essential Expenses Model

**Problem:** Fixed percentage-based expense allocations don't scale realistically with income.

**Evidence:**
- Low income (₹12K): Essentials = 250% of income (impossible)
- Ultra high income (₹15L): Essentials = 5.1% of income (too low)

**Code Issue:** Linear scaling of expenses doesn't match real-world spending patterns:
```javascript
// BASE_ESSENTIAL_EXPENSES gets multiplied by location and family factors,
// but no income-based scaling curve
const housing = BASE_ESSENTIAL_EXPENSES.HOUSING * locationMultiplier * familySizeFactor;
```

**Fix:** Implement logarithmic scaling based on income:
```javascript
// Add income-based scaling
function getIncomeScalingFactor(monthlyIncome) {
  const baseIncome = 50000; // Reference middle income
  return 0.7 + (0.3 * Math.log10(baseIncome/monthlyIncome));
}

const incomeScaling = getIncomeScalingFactor(userData.monthlyIncome);
const housing = BASE_ESSENTIAL_EXPENSES.HOUSING * locationMultiplier * familySizeFactor * incomeScaling;
```

## 4. Asset Allocation & Investment Issues

### 4.1. Age-Based Asset Allocation Too Simplistic

**Problem:** The system uses an overly simplistic "100 minus age" rule for equity allocation.

**Code Issue:**
```javascript
// From engine.js
let baseEquityAllocation = Math.max(30, 100 - userData.age);
```

**Evidence:**
- Doesn't account for individual risk capacity beyond stated tolerance
- Ignores time horizon specific to user goals
- Doesn't consider market conditions

**Fix:** Implement a more comprehensive allocation formula:
```javascript
function calculateEquityAllocation(userData, marketConditions) {
  // Base allocation from age
  let baseAllocation = Math.max(30, 110 - userData.age);
  
  // Adjust for time horizon
  const timeHorizonAdjustment = Math.min(10, (userData.retirementAge - userData.age - 10) * 0.5);
  
  // Adjust for risk capacity (dependents, income stability)
  const dependentCount = userData.familyComposition.filter(m => m.dependent).length;
  const riskCapacityAdjustment = -2 * dependentCount;
  
  // Adjust for current valuations (would be updated periodically)
  const marketValuationAdjustment = -5; // During high valuations
  
  return Math.min(90, Math.max(20, baseAllocation + timeHorizonAdjustment + riskCapacityAdjustment + marketValuationAdjustment));
}
```

### 4.2. Tax Efficiency Calculation Problems

**Problem:** Tax efficiency is only considered for brackets above 20%, and ignores recent tax law changes.

**Code Issue:**
```javascript
// From engine.js
if (taxBracket >= 0.2) {
  // 20% or higher
  const adjustedDebtBreakdown = adjustForTaxEfficiency(
    debtAllocationBreakdown,
    taxBracket
  );
  Object.assign(debtAllocationBreakdown, adjustedDebtBreakdown);
}
```

**Fix:** Update tax efficiency logic:
```javascript
// Apply tax efficiency to all brackets with increasing intensity
const taxAdjustmentFactor = Math.max(0.5, taxBracket * 2); // Scale based on bracket
const adjustedDebtBreakdown = adjustForTaxEfficiency(
  debtAllocationBreakdown,
  taxBracket,
  taxAdjustmentFactor
);

// Update adjustForTaxEfficiency function to account for 2023 tax changes on debt funds
function adjustForTaxEfficiency(debtAllocation, taxBracket, adjustmentFactor) {
  // New tax laws make debt funds less tax-efficient for short term
  if (adjustedAllocation.debt_funds) {
    // Reduce debt fund allocation for high tax brackets
    adjustedAllocation.debt_funds *= 1 - (taxBracket * 0.3);
    // Increase more tax-efficient options
    if (adjustedAllocation.tax_free_bonds) {
      adjustedAllocation.tax_free_bonds *= 1 + (taxBracket * 0.6);
    }
  }
  // Rest of function...
}
```

## 5. Expense Category Allocation Issues

### 5.1. Emergency Fund/Short-Term Savings Issues

**Problem:** Short-term savings often get zero allocation or are inconsistently calculated.

**Evidence:**
- Multiple scenarios show zero short-term savings despite being critical
- Ultra High Income (balanced) allocated 35% to short-term savings but gets -150% consistency score

**Code Issue:** Short-term savings calculation doesn't prioritize emergency fund:
```javascript
// In applyPriorityAdjustments():
const shortTermSavings = remainingFunds * adjustedStSavingsPercent;
// No minimum for emergency fund
```

**Fix:** Ensure minimum emergency fund allocation:
```javascript
// Calculate emergency fund need
const monthlyExpenses = budgetResults.total_essentials;
const recommendedEmergencyFund = monthlyExpenses * EMERGENCY_FUND_TARGETS[userData.incomeTier];
const currentEmergencyFund = userData.emergencyFund || 0;
const emergencyFundGap = recommendedEmergencyFund - currentEmergencyFund;

// Set minimum short-term savings if emergency fund isn't established
const minShortTermSavings = emergencyFundGap > 0 ? 
  Math.min(remainingFunds * 0.3, emergencyFundGap / 24) : 0;

const shortTermSavings = Math.max(
  minShortTermSavings,
  remainingFunds * adjustedStSavingsPercent
);
```

### 5.2. Housing Status Impact Problems

**Problem:** Housing status (owned vs. loan vs. rented) has inappropriate effects on budget.

**Evidence:**
- Fully-owned home reduces housing to 30% of normal, but doesn't redistribute to other categories
- Housing loan (EMI) calculations don't validate against income

**Code Issue:**
```javascript
// In calculateBudgetAllocation():
if (userData.housingStatus === "owned_fully") {
  housing = housing * 0.3; // Reduces to just maintenance and taxes
}
// No reallocation of the savings to other categories
```

**Fix:** Reallocate housing savings appropriately:
```javascript
let housingAdjustment = 0;
if (userData.housingStatus === "owned_fully") {
  housingAdjustment = housing * 0.7; // 70% savings
  housing = housing * 0.3; 
  
  // Redistribute the savings
  retirementSavings += housingAdjustment * 0.4;
  shortTermSavings += housingAdjustment * 0.3;
  discretionary += housingAdjustment * 0.3;
}
```

### 5.3. Benchmark Calculation Problems for Optimization

**Problem:** Expense optimization uses simple income percentages that don't account for important factors.

**Code Issue:**
```javascript
// From engine.js - calculateBenchmarksForProfile function
const baseBenchmarks = {
  housing: {
    min: 0.15,
    typical: 0.25,
    max: 0.35,
  },
  // Other categories...
}
```

**Evidence:**
- No consideration of family lifecycle stage
- No adjustment for special health needs or education requirements
- Regional differences beyond simple multipliers aren't addressed

**Fix:** Add lifecycle and household adjustment factors:
```javascript
// Get life stage factor
const lifeStageFactor = getLifeStageFactor(userData.age, userData.familyComposition);

// Apply to relevant categories
benchmarks.education.typical *= lifeStageFactor.education;
benchmarks.healthcare.typical *= lifeStageFactor.healthcare;

function getLifeStageFactor(age, familyComposition) {
  const childrenCount = getChildrenCount(familyComposition);
  const childrenAges = familyComposition
    .filter(m => m.relationship === "child")
    .map(c => c.age);
  
  // Higher education costs for school-age children
  const hasSchoolAgeChildren = childrenAges.some(age => age >= 5 && age <= 18);
  
  return {
    education: hasSchoolAgeChildren ? 1.5 : (childrenCount > 0 ? 1.2 : 0.5),
    healthcare: age > 60 ? 1.8 : (age > 45 ? 1.3 : 1.0)
  };
}
```

### 5.4. Optimization Opportunity Detection Too Rigid

**Problem:** The system flags any spending >20% above "typical" as an optimization opportunity without context.

**Code Issue:**
```javascript
// From engine.js - calculateOptimizationOpportunities function
if (benchmark && spending > benchmark.typical * 1.2) {
  // Flag as optimization opportunity
}
```

**Fix:** Add contextual awareness to opportunity detection:
```javascript
// More nuanced detection
const overageThreshold = getContextualOverageThreshold(category, userData);
if (benchmark && spending > benchmark.typical * overageThreshold) {
  // Flag as optimization opportunity
}

function getContextualOverageThreshold(category, userData) {
  // Higher threshold for households with special needs
  if (category === "healthcare" && userData.hasSpecialHealthcareNeeds) {
    return 1.8; // 80% above typical is acceptable
  }
  // Higher threshold for education with multiple children
  if (category === "education" && getChildrenCount(userData.familyComposition) > 1) {
    return 1.5;
  }
  return 1.2; // Default 20% threshold
}
```

## 6. User Profile & Edge Case Issues

### 6.1. Debt Management Not Integrated

**Problem:** The system collects debt information but doesn't use it for budget planning.

**Code Issue:** No adjustment of financial plan based on debt burden:
```javascript
// This doesn't exist in current system but should
// No handling of high-interest debt as a priority
```

**Fix:** Implement debt-aware budget adjustments:
```javascript
// Add to calculateBudgetAllocation
if (userData.currentDebt > userData.monthlyIncome * 6) {
  // High debt situation, adjust allocations
  discretionary *= 0.8; // Reduce discretionary by 20%
  shortTermSavings *= 0.9; // Reduce short-term savings slightly
  
  // Add debt payment category
  const debtPayment = (discretionary * 0.2) + (shortTermSavings * 0.1);
  return {
    ...budgetResults,
    debt_payment: debtPayment,
    discretionary: discretionary * 0.8,
    short_term_savings: shortTermSavings * 0.9
  };
}
```

### 6.2. Income Volatility Not Considered

**Problem:** The system assumes stable monthly income, inappropriate for freelancers/business owners.

**Code Issue:** No accommodation for variable income:
```javascript
// This doesn't exist in current system but should
// No handling of income volatility
```

**Fix:** Add income volatility handling:
```javascript
// Add to userData collection
incomeVolatility: "HIGH", // Options: LOW, MEDIUM, HIGH

// Add to budget allocation
if (userData.incomeVolatility === "HIGH") {
  // Increase emergency fund target
  emergencyFundTarget *= 1.5;
  // Increase short-term allocation
  shortTermSavings *= 1.3;
  // Reduce discretionary proportionally
  discretionary = remainingFunds - shortTermSavings;
}
```

### 6.3. Family Composition Has Minimal Impact

**Problem:** Family composition details are collected but barely affect calculations.

**Evidence:**
- Adding dependents only impacts education costs
- No differentiation between adult dependents vs. children

**Code Issue:**
```javascript
// In calculateBudgetAllocation():
const childrenCount = getChildrenCount(userData.familyComposition);
const education = BASE_ESSENTIAL_EXPENSES.EDUCATION_PER_CHILD * childrenCount * locationMultiplier;
// No differentiation by age or type of dependent
```

**Fix:** Add more nuanced dependent handling:
```javascript
function calculateEducationExpenses(familyComposition, locationMultiplier) {
  let total = 0;
  const children = familyComposition.filter(member => member.relationship === "child");
  
  children.forEach(child => {
    const age = child.age || 10; // Default if missing
    if (age < 6) {
      total += BASE_ESSENTIAL_EXPENSES.EDUCATION_PRESCHOOL;
    } else if (age < 18) {
      total += BASE_ESSENTIAL_EXPENSES.EDUCATION_SCHOOL;
    } else {
      total += BASE_ESSENTIAL_EXPENSES.EDUCATION_COLLEGE;
    }
  });
  
  return total * locationMultiplier;
}
```

### 6.4. No Handling of Dual-Income Households

**Problem:** System assumes single-income households without any accommodation for dual earners.

**Code Issue:** No method to input or calculate with multiple income sources.

**Fix:** Add dual-income support:
```javascript
// Add to userData collection:
secondaryIncome: 0, // Default to 0

// Update calculations:
const totalIncome = userData.monthlyIncome + userData.secondaryIncome;
const primaryIncomeRatio = userData.monthlyIncome / totalIncome;

// Adjust expense calculations to account for shared expenses
const effectiveFamilySize = userData.secondaryIncome > 0 ? 
  userData.familySize * 0.8 : userData.familySize; // 20% discount for shared expenses
```

## 7. Priority Recommendations

Based on severity and technical impact, here are the most critical fixes:

### Critical (Must Fix):

1. **Fix impossible budget allocations** - Add scaling mechanism to ensure essentials ≤ income
   ```javascript
   const essentialScalingFactor = Math.min(1.0, (userData.monthlyIncome * 0.9) / totalEssentials);
   ```

2. **Add retirement feasibility checks** - Prevent mathematically impossible retirement recommendations
   ```javascript
   if (requiredMonthlySavings > disposableIncome * 0.9) {
     // Generate alternative scenarios
   }
   ```

3. **Align budget allocation and consistency scoring** - Use same formulas for both
   ```javascript
   // Use priority multipliers consistently in both allocation and scoring
   ```

4. **Revise income tier boundaries** - Add more granularity to high income tiers
   ```javascript
   HIGH: 300000,        // ₹1.5L-3L
   VERY_HIGH: 600000,   // ₹3L-6L 
   ULTRA_HIGH: 1000000, // ₹6L-10L
   SUPER_HIGH: Infinity // ₹10L+
   ```

### High Priority:

5. **Smooth retirement savings rate jumps** - Create gradual transitions between tiers
   ```javascript
   LOWER_MIDDLE: 0.15,
   MIDDLE: 0.25,     // 25% instead of 50%
   HIGH: 0.35,       // 35% 
   ```

6. **Update investment return assumptions** - More realistic returns with volatility
   ```javascript
   CONSERVATIVE: {
     PRE_RETIREMENT: 0.06, // 6% instead of 7%
     VOLATILITY: 0.03
   }
   ```

7. **Fix life expectancy impact** - Properly account for longevity in corpus calculations
   ```javascript
   const longevityFactor = Math.max(0.8, Math.min(1.2, 30 / yearsInRetirement));
   const adjustedWithdrawalRate = baseWithdrawalRate * longevityFactor;
   ```

8. **Implement logarithmic expense scaling** - Fix unrealistic expenses at income extremes
   ```javascript
   const incomeScaling = getIncomeScalingFactor(userData.monthlyIncome);
   ```

### Medium Priority:

9. **Add emergency fund guarantees** - Ensure minimum short-term savings for emergencies
   ```javascript
   const minShortTermSavings = emergencyFundGap > 0 ? 
     Math.min(remainingFunds * 0.3, emergencyFundGap / 24) : 0;
   ```

10. **Fix housing status adjustments** - Properly reallocate housing savings
    ```javascript
    if (userData.housingStatus === "owned_fully") {
      housingAdjustment = housing * 0.7;
      // Redistribute savings
    }
    ```

11. **Add debt management integration** - Prioritize debt reduction for applicable users
    ```javascript
    if (userData.currentDebt > userData.monthlyIncome * 6) {
      // High debt adjustment logic
    }
    ```

12. **Improve benchmark calculations** - Add life stage factors for optimization
    ```javascript
    function getLifeStageFactor(age, familyComposition) {
      // Life stage calculation
    }
    ```

13. **Add dual-income support** - Account for multiple income streams
    ```javascript
    const totalIncome = userData.monthlyIncome + userData.secondaryIncome;
    ```

14. **Add income volatility handling** - Support freelancers and business owners
    ```javascript
    if (userData.incomeVolatility === "HIGH") {
      // Volatility adjustment logic
    }
    ```

15. **Implement dynamic safe withdrawal rates** - Account for age, income sources, market conditions
    ```javascript
    const safeWithdrawalRate = calculateDynamicSWR(userData, marketCondition);
    ```

16. **Improve asset allocation model** - Move beyond simple age-based formula
    ```javascript
    function calculateEquityAllocation(userData, marketConditions) {
      // Comprehensive equity allocation
    }
    ```

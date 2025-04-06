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
  HIGH: 300000, // ₹1,50,001-3,00,000/month
  VERY_HIGH: 600000, // ₹3,00,001-6,00,000/month
  ULTRA_HIGH: 1000000, // ₹6,00,001-10,00,000/month
  SUPER_HIGH: Infinity, // ₹10,00,000+/month
};

/**
 * Maximum allowed retirement savings as a percentage of income
 * Prevents over-allocation to retirement regardless of calculations
 */
const MAX_RETIREMENT_SAVINGS_PERCENT = {
  VERY_LOW: 0.05, // Max 5% of income for very low income
  LOW: 0.1, // Max 10% for low income
  LOWER_MIDDLE: 0.2, // Max 20% for lower middle income (was 15%)
  MIDDLE: 0.3, // Max 30% for middle income
  HIGH: 0.4, // Max 40% for high income (was 35%)
  VERY_HIGH: 0.45, // Max 45% for very high income (was 40%)
  ULTRA_HIGH: 0.5, // Max 50% for ultra high income (was 45%)
  SUPER_HIGH: 0.5, // Max 50% for super high income
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
  HIGH: 8, // 8 months for high income
  VERY_HIGH: 10, // 10 months for very high income
  ULTRA_HIGH: 12, // 12 months for ultra high income
  SUPER_HIGH: 15, // 15 months for super high income
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
  VERY_HIGH: 0.225, // 22.5% minimum for very high income
  ULTRA_HIGH: 0.25, // 25% minimum for ultra high income
  SUPER_HIGH: 0.275, // 27.5% minimum for super high income
};

/**
 * Investment return rate assumptions based on risk profile
 */
const INVESTMENT_RETURN_RATES = {
  CONSERVATIVE: {
    PRE_RETIREMENT: 0.07, // 7% annual return before retirement
    POST_RETIREMENT: 0.07, // 7% annual return during retirement
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

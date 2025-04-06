// family-expense-calculator.js - New file

// === AGE-SPECIFIC EDUCATION COSTS ===
const EDUCATION_COSTS = {
    PRESCHOOL: 4000,    // Ages 3-5
    PRIMARY: 5000,      // Ages 6-10
    MIDDLE: 6000,       // Ages 11-14
    SECONDARY: 8000,    // Ages 15-17
    COLLEGE: 15000,     // Ages 18-22
    HIGHER_EDUCATION: 20000, // Ages 23+
  };
  
  // === HEALTHCARE COSTS BY AGE GROUP ===
  const HEALTHCARE_COSTS = {
    INFANT: 2000,      // Ages 0-2
    CHILD: 1500,       // Ages 3-12
    TEEN: 1200,        // Ages 13-19
    ADULT: 1000,       // Ages 20-45
    MIDDLE_AGE: 2000,  // Ages 46-60
    SENIOR: 3500,      // Ages 61+
  };
  
  // === FOOD COSTS BY AGE GROUP ===
  const FOOD_COSTS = {
    INFANT: 2000,      // Ages 0-2
    CHILD: 3500,       // Ages 3-12
    TEEN: 5000,        // Ages 13-19
    ADULT: 5000,       // Ages 20+
  };
  
  /**
   * Calculates education expenses based on detailed family composition
   * @param {Array} familyComposition - Array of family members with their details
   * @param {number} locationMultiplier - Multiplier based on location tier
   * @returns {Object} Education expenses breakdown and total
   */
  function calculateEducationExpenses(familyComposition, locationMultiplier) {
    let total = 0;
    const breakdown = {
      preschool: 0,
      primary: 0,
      middle: 0,
      secondary: 0,
      college: 0,
      higher_education: 0
    };
    
    // Filter to include only dependent children
    const educationEligible = familyComposition.filter(member => 
      member.dependent === true && 
      member.relationship === "child" && 
      member.age >= 3 && member.age <= 25
    );
    
    educationEligible.forEach(child => {
      const age = child.age || 10; // Default if missing
      let educationCost = 0;
      let category = '';
      
      if (age < 6) {
        educationCost = EDUCATION_COSTS.PRESCHOOL;
        category = 'preschool';
      } else if (age < 11) {
        educationCost = EDUCATION_COSTS.PRIMARY;
        category = 'primary';
      } else if (age < 15) {
        educationCost = EDUCATION_COSTS.MIDDLE;
        category = 'middle';
      } else if (age < 18) {
        educationCost = EDUCATION_COSTS.SECONDARY;
        category = 'secondary';
      } else if (age < 23) {
        educationCost = EDUCATION_COSTS.COLLEGE;
        category = 'college';
      } else if (age <= 25) {
        educationCost = EDUCATION_COSTS.HIGHER_EDUCATION;
        category = 'higher_education';
      }
      
      educationCost *= locationMultiplier;
      total += educationCost;
      breakdown[category] += educationCost;
    });
    
    return {
      total: total,
      breakdown: breakdown
    };
  }
  
  /**
   * Calculates healthcare expenses based on family composition
   * @param {Array} familyComposition - Array of family members
   * @param {number} locationMultiplier - Multiplier based on location
   * @returns {Object} Healthcare expenses total and breakdown
   */
  function calculateHealthcareExpenses(familyComposition, locationMultiplier) {
    let total = 0;
    const breakdown = {
      infant: 0,
      child: 0,
      teen: 0,
      adult: 0,
      middle_age: 0,
      senior: 0
    };
    
    familyComposition.forEach(member => {
      const age = member.age;
      let healthcareCost = 0;
      let category = '';
      
      if (age <= 2) {
        healthcareCost = HEALTHCARE_COSTS.INFANT;
        category = 'infant';
      } else if (age <= 12) {
        healthcareCost = HEALTHCARE_COSTS.CHILD;
        category = 'child';
      } else if (age <= 19) {
        healthcareCost = HEALTHCARE_COSTS.TEEN;
        category = 'teen';
      } else if (age <= 45) {
        healthcareCost = HEALTHCARE_COSTS.ADULT;
        category = 'adult';
      } else if (age <= 60) {
        healthcareCost = HEALTHCARE_COSTS.MIDDLE_AGE;
        category = 'middle_age';
      } else {
        healthcareCost = HEALTHCARE_COSTS.SENIOR;
        category = 'senior';
      }
      
      healthcareCost *= locationMultiplier;
      total += healthcareCost;
      breakdown[category] += healthcareCost;
    });
    
    return {
      total: total,
      breakdown: breakdown
    };
  }
  
  /**
   * Calculates food expenses with family scaling factors
   * @param {Array} familyComposition - Array of family members
   * @param {number} locationMultiplier - Location based adjustment
   * @returns {Object} Food expenses total and breakdown
   */
  function calculateFoodExpenses(familyComposition, locationMultiplier) {
    let rawTotal = 0;
    const breakdown = {
      infant: 0,
      child: 0,
      teen: 0,
      adult: 0
    };
    
    familyComposition.forEach(member => {
      const age = member.age;
      let foodCost = 0;
      let category = '';
      
      if (age <= 2) {
        foodCost = FOOD_COSTS.INFANT;
        category = 'infant';
      } else if (age <= 12) {
        foodCost = FOOD_COSTS.CHILD;
        category = 'child';
      } else if (age <= 19) {
        foodCost = FOOD_COSTS.TEEN;
        category = 'teen';
      } else {
        foodCost = FOOD_COSTS.ADULT;
        category = 'adult';
      }
      
      foodCost *= locationMultiplier;
      rawTotal += foodCost;
      breakdown[category] += foodCost;
    });
    
    // Apply economies of scale for larger families
    const familySize = familyComposition.length;
    const scalingFactor = familySize <= 1 ? 1 : 
                           familySize <= 2 ? 0.9 :
                           familySize <= 3 ? 0.85 :
                           familySize <= 4 ? 0.8 :
                           familySize <= 5 ? 0.75 : 
                           0.7;
    
    const total = rawTotal * scalingFactor;
    
    // Scale each category
    Object.keys(breakdown).forEach(key => {
      breakdown[key] *= scalingFactor;
    });
    
    return {
      total: total,
      breakdown: breakdown,
      scalingFactor: scalingFactor
    };
  }
  
  /**
   * Calculates housing requirements based on family size and composition
   * @param {Array} familyComposition - Array of family members
   * @param {number} baseHousingCost - Base housing cost
   * @param {number} locationMultiplier - Location multiplier
   * @returns {Object} Housing costs and requirements
   */
  function calculateHousingRequirements(familyComposition, baseHousingCost, locationMultiplier) {
    // Count different age groups
    const adults = familyComposition.filter(m => m.age >= 18).length;
    const teens = familyComposition.filter(m => m.age >= 13 && m.age < 18).length;
    const children = familyComposition.filter(m => m.age < 13).length;
    
    // Calculate bedrooms needed (Indian context)
    let bedrooms = 1; // Minimum 1 bedroom
    
    if (adults > 1) {
      bedrooms += Math.ceil((adults - 1) / 2); // Primary couple + additional adults
    }
    
    if (teens > 0) {
      bedrooms += Math.ceil(teens / 2); // Teens may share rooms
    }
    
    if (children > 0) {
      bedrooms += Math.ceil(children / 3); // Young children can share rooms
    }
    
    // Adjust housing cost based on bedrooms needed
    const housingAdjustment = 1 + (bedrooms - 1) * 0.15; // +15% per additional bedroom
    const adjustedHousingCost = baseHousingCost * housingAdjustment * locationMultiplier;
    
    return {
      total: adjustedHousingCost,
      bedrooms: bedrooms,
      housingAdjustment: housingAdjustment
    };
  }
  
  /**
   * Calculates transport expenses based on family composition
   * @param {Array} familyComposition - Array of family members
   * @param {number} baseTransportCost - Base transport cost
   * @param {number} locationMultiplier - Location multiplier
   * @returns {Object} Transport costs and breakdown
   */
  function calculateTransportExpenses(familyComposition, baseTransportCost, locationMultiplier) {
    let total = baseTransportCost * locationMultiplier; // Base household transport
    
    const breakdown = {
      household: baseTransportCost * locationMultiplier,
      school: 0,
      college: 0,
      work: 0
    };
    
    // Additional transport for family members
    const workingAdults = familyComposition.filter(m => 
      m.age >= 18 && m.age <= 65 && m.relationship !== "self"
    ).length;
    
    const schoolChildren = familyComposition.filter(m => 
      m.relationship === "child" && m.age >= 5 && m.age < 18
    ).length;
    
    const collegeStudents = familyComposition.filter(m => 
      m.relationship === "child" && m.age >= 18 && m.age <= 25
    ).length;
    
    // Calculate additional transport costs
    const workTransport = baseTransportCost * 0.6 * workingAdults * locationMultiplier;
    const schoolTransport = baseTransportCost * 0.3 * schoolChildren * locationMultiplier;
    const collegeTransport = baseTransportCost * 0.5 * collegeStudents * locationMultiplier;
    
    total += workTransport + schoolTransport + collegeTransport;
    breakdown.work = workTransport;
    breakdown.school = schoolTransport;
    breakdown.college = collegeTransport;
    
    return {
      total: total,
      breakdown: breakdown
    };
  }
  
  /**
   * Integrates all family expense calculations
   * @param {Object} userData - User data with family composition
   * @param {Object} baseExpenses - Base expense amounts
   * @returns {Object} Comprehensive family-adjusted expenses
   */
  function calculateFamilyExpenses(userData, baseExpenses) {
    const familyComposition = userData.familyComposition;
    const locationMultiplier = getLocationMultiplier(userData.locationTier);
    
    // Calculate each expense category
    const education = calculateEducationExpenses(familyComposition, locationMultiplier);
    const healthcare = calculateHealthcareExpenses(familyComposition, locationMultiplier);
    const food = calculateFoodExpenses(familyComposition, locationMultiplier);
    const housing = calculateHousingRequirements(
      familyComposition, 
      baseExpenses.HOUSING, 
      locationMultiplier
    );
    const transport = calculateTransportExpenses(
      familyComposition,
      baseExpenses.TRANSPORT,
      locationMultiplier
    );
    
    // Personal and household expenses scale with family size
    const familySize = familyComposition.length;
    const personal = baseExpenses.PERSONAL * familySize * 0.8 * locationMultiplier; // 20% economies of scale
    const household = baseExpenses.HOUSEHOLD * (1 + (familySize - 1) * 0.2) * locationMultiplier;
    const utilities = baseExpenses.UTILITIES * (1 + (familySize - 1) * 0.15) * locationMultiplier;
    
    return {
      education: education.total,
      education_breakdown: education.breakdown,
      healthcare: healthcare.total,
      healthcare_breakdown: healthcare.breakdown,
      food: food.total,
      food_breakdown: food.breakdown,
      housing: housing.total,
      housing_breakdown: housing,
      transport: transport.total,
      transport_breakdown: transport.breakdown,
      personal: personal,
      household: household,
      utilities: utilities,
      total_essentials: education.total + healthcare.total + food.total + 
                        housing.total + transport.total + personal + 
                        household + utilities
    };
  }
  
  // Helper function for location multiplier
  function getLocationMultiplier(locationTier) {
    // Use the global LOCATION_MULTIPLIERS if available, otherwise use defaults
    if (typeof LOCATION_MULTIPLIERS !== 'undefined') {
      return LOCATION_MULTIPLIERS[locationTier] || 0.7;
    } else {
      // Provide default multipliers if global not available
      const defaultMultipliers = {
        'METRO': 1.0,
        'TIER_2': 0.7,
        'TIER_3': 0.5
      };
      return defaultMultipliers[locationTier] || 0.7;
    }
  }
  
  // Export the functions
// Replace module.exports with this global object 
window.FamilyExpenseCalculator = {
    calculateFamilyExpenses,
    calculateEducationExpenses,
    calculateHealthcareExpenses,
    calculateFoodExpenses,
    calculateHousingRequirements,
    calculateTransportExpenses
  };
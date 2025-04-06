
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

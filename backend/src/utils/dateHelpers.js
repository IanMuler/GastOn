/**
 * Date helper utilities for expense tracking
 * 
 * Provides consistent date formatting and manipulation functions
 * for expense-related operations, especially weekly views
 */

/**
 * Format date to YYYY-MM-DD string
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
function formatDateToString(date) {
  if (!(date instanceof Date) || isNaN(date)) {
    throw new Error('Invalid date provided');
  }
  
  return date.toISOString().split('T')[0];
}

/**
 * Parse date string to Date object
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {Date} Date object
 */
function parseDateString(dateString) {
  if (typeof dateString !== 'string') {
    throw new Error('Date string must be a string');
  }
  
  const date = new Date(dateString + 'T00:00:00');
  if (isNaN(date)) {
    throw new Error('Invalid date string format. Expected YYYY-MM-DD');
  }
  
  return date;
}

/**
 * Get start and end dates of the week containing the given date
 * @param {string|Date} inputDate - Date string or Date object
 * @returns {Object} Object with weekStart and weekEnd date strings
 */
function getWeekDates(inputDate) {
  let date;
  
  if (typeof inputDate === 'string') {
    date = parseDateString(inputDate);
  } else if (inputDate instanceof Date) {
    date = new Date(inputDate);
  } else {
    date = new Date(); // Default to current date
  }
  
  // Get Monday as week start (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = date.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Handle Sunday
  
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() + mondayOffset);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  return {
    weekStart: formatDateToString(weekStart),
    weekEnd: formatDateToString(weekEnd),
    dates: generateWeekDates(weekStart),
  };
}

/**
 * Generate array of 7 date strings for a week starting from Monday
 * @param {Date} mondayDate - Monday date of the week
 * @returns {Array<string>} Array of date strings [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
 */
function generateWeekDates(mondayDate) {
  const dates = [];
  
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(mondayDate);
    currentDate.setDate(mondayDate.getDate() + i);
    dates.push(formatDateToString(currentDate));
  }
  
  return dates;
}

/**
 * Get current week dates
 * @returns {Object} Current week start, end, and dates array
 */
function getCurrentWeekDates() {
  return getWeekDates(new Date());
}

/**
 * Check if a date is within a specific week
 * @param {string} dateString - Date to check (YYYY-MM-DD)
 * @param {string} weekStartDate - Week start date (YYYY-MM-DD)
 * @returns {boolean} True if date is within the week
 */
function isDateInWeek(dateString, weekStartDate) {
  const date = parseDateString(dateString);
  const weekStart = parseDateString(weekStartDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  return date >= weekStart && date <= weekEnd;
}

/**
 * Get month start and end dates
 * @param {string|Date} inputDate - Date string or Date object
 * @returns {Object} Object with monthStart and monthEnd date strings
 */
function getMonthDates(inputDate) {
  let date;
  
  if (typeof inputDate === 'string') {
    date = parseDateString(inputDate);
  } else if (inputDate instanceof Date) {
    date = new Date(inputDate);
  } else {
    date = new Date();
  }
  
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  
  return {
    monthStart: formatDateToString(monthStart),
    monthEnd: formatDateToString(monthEnd),
  };
}

/**
 * Validate date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {boolean} True if range is valid
 */
function isValidDateRange(startDate, endDate) {
  try {
    const start = parseDateString(startDate);
    const end = parseDateString(endDate);
    return start <= end;
  } catch (error) {
    return false;
  }
}

/**
 * Get date range validation for API endpoints
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @param {number} maxDays - Maximum allowed days in range (default: 365)
 * @returns {Object} Validation result with errors if any
 */
function validateDateRange(startDate, endDate, maxDays = 365) {
  const errors = [];
  
  try {
    const start = parseDateString(startDate);
    const end = parseDateString(endDate);
    
    if (start > end) {
      errors.push('Start date must be before or equal to end date');
    }
    
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (daysDiff > maxDays) {
      errors.push(`Date range cannot exceed ${maxDays} days`);
    }
    
    // Check if dates are not too far in the future
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    if (start > today) {
      errors.push('Start date cannot be in the future');
    }
    
  } catch (error) {
    errors.push('Invalid date format. Use YYYY-MM-DD');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  formatDateToString,
  parseDateString,
  getWeekDates,
  generateWeekDates,
  getCurrentWeekDates,
  isDateInWeek,
  getMonthDates,
  isValidDateRange,
  validateDateRange,
};
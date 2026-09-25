const { EXPIRY_THRESHOLDS, MIN_TRANSIT_BUFFER_MINUTES } = require('../config/constants');

/**
 * Calculates remaining minutes until usable window expires
 * @param {Date|string} usableUntil 
 * @param {Date} [currentTime=new Date()]
 * @returns {number} remaining minutes (negative if expired)
 */
const getRemainingMinutes = (usableUntil, currentTime = new Date()) => {
  const expiry = new Date(usableUntil).getTime();
  const now = new Date(currentTime).getTime();
  return Math.floor((expiry - now) / (1000 * 60));
};

/**
 * Classifies food safety into SAFE, WARNING, CRITICAL, EXPIRED
 * @param {Date|string} usableUntil 
 * @param {Date} [currentTime=new Date()]
 * @returns {'SAFE'|'WARNING'|'CRITICAL'|'EXPIRED'}
 */
const classifyExpiryStatus = (usableUntil, currentTime = new Date()) => {
  const remainingMinutes = getRemainingMinutes(usableUntil, currentTime);

  if (remainingMinutes <= EXPIRY_THRESHOLDS.CRITICAL_MINUTES) {
    return 'EXPIRED';
  } else if (remainingMinutes < EXPIRY_THRESHOLDS.WARNING_MINUTES) {
    return 'CRITICAL';
  } else if (remainingMinutes <= EXPIRY_THRESHOLDS.SAFE_MINUTES) {
    return 'WARNING';
  } else {
    return 'SAFE';
  }
};

/**
 * Evaluates whether pickup and delivery can complete within the remaining usable window
 * @param {Date|string} usableUntil 
 * @param {number} estimatedTravelMinutes 
 * @returns {boolean} true if feasible with safety buffer
 */
const isDeliveryFeasible = (usableUntil, estimatedTravelMinutes) => {
  const remainingMinutes = getRemainingMinutes(usableUntil);
  const totalRequiredTime = estimatedTravelMinutes + MIN_TRANSIT_BUFFER_MINUTES;
  return remainingMinutes >= totalRequiredTime;
};

/**
 * Human readable format for remaining time, e.g. "1h 42m" or "25m"
 * @param {number} minutes 
 * @returns {string}
 */
const formatRemainingTime = (minutes) => {
  if (minutes <= 0) return 'Expired';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins}m`;
};

module.exports = {
  getRemainingMinutes,
  classifyExpiryStatus,
  isDeliveryFeasible,
  formatRemainingTime
};

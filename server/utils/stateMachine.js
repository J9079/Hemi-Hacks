const { DONATION_STATUS, VALID_STATUS_TRANSITIONS } = require('../config/constants');

/**
 * Validates whether transition from current status to next status is permitted
 * @param {string} currentStatus 
 * @param {string} nextStatus 
 * @returns {boolean}
 */
const canTransition = (currentStatus, nextStatus) => {
  if (!currentStatus || !nextStatus) return false;
  if (currentStatus === nextStatus) return true; // Idempotent no-op

  const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus];
  if (!allowedTransitions) return false;

  return allowedTransitions.includes(nextStatus);
};

/**
 * Validates transition and throws descriptive error if invalid
 * @param {string} currentStatus 
 * @param {string} nextStatus 
 */
const assertValidTransition = (currentStatus, nextStatus) => {
  if (!canTransition(currentStatus, nextStatus)) {
    const error = new Error(
      `Invalid donation status transition: cannot move from '${currentStatus}' to '${nextStatus}'.`
    );
    error.status = 400;
    throw error;
  }
};

/**
 * Append entry to status history
 * @param {Array} historyArray 
 * @param {string} nextStatus 
 * @param {string} userId 
 * @param {string} note 
 * @returns {Array} updated status history
 */
const appendStatusHistory = (historyArray, nextStatus, userId, note = '') => {
  const updated = Array.isArray(historyArray) ? [...historyArray] : [];
  updated.push({
    status: nextStatus,
    timestamp: new Date(),
    updatedBy: userId,
    note
  });
  return updated;
};

module.exports = {
  canTransition,
  assertValidTransition,
  appendStatusHistory
};

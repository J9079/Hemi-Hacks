module.exports = {
  ROLES: {
    DONOR: 'DONOR',
    NGO: 'NGO',
    DRIVER: 'DRIVER',
    ADMIN: 'ADMIN'
  },

  DONATION_STATUS: {
    POSTED: 'POSTED',
    MATCHED: 'MATCHED',
    DRIVER_ASSIGNED: 'DRIVER_ASSIGNED',
    PICKUP_STARTED: 'PICKUP_STARTED',
    PICKED_UP: 'PICKED_UP',
    IN_TRANSIT: 'IN_TRANSIT',
    DELIVERED: 'DELIVERED',
    REJECTED: 'REJECTED',
    CANCELLED: 'CANCELLED',
    EXPIRED: 'EXPIRED'
  },

  // State machine transition validation rules
  VALID_STATUS_TRANSITIONS: {
    POSTED: ['MATCHED', 'CANCELLED', 'EXPIRED'],
    MATCHED: ['DRIVER_ASSIGNED', 'REJECTED', 'CANCELLED', 'EXPIRED'],
    DRIVER_ASSIGNED: ['PICKUP_STARTED', 'CANCELLED'],
    PICKUP_STARTED: ['PICKED_UP', 'CANCELLED'],
    PICKED_UP: ['IN_TRANSIT', 'CANCELLED'],
    IN_TRANSIT: ['DELIVERED', 'CANCELLED'],
    DELIVERED: [], // Terminal state
    REJECTED: ['MATCHED', 'CANCELLED', 'EXPIRED'], // Can be re-matched
    CANCELLED: [], // Terminal state
    EXPIRED: []    // Terminal state
  },

  // Configurable weights for matching engine (sum = 1.0)
  MATCHING_WEIGHTS: {
    DISTANCE: 0.30,
    CAPACITY: 0.25,
    NEED: 0.20,
    FOOD_COMPATIBILITY: 0.15,
    EXPIRY_SAFETY: 0.10
  },

  // Food expiry window classifications (in minutes)
  EXPIRY_THRESHOLDS: {
    SAFE_MINUTES: 120,    // > 2 hours
    WARNING_MINUTES: 30,  // 30 - 120 minutes
    CRITICAL_MINUTES: 0   // < 30 minutes
  },

  // Minimum required buffer time for pickup & transit feasibility (in minutes)
  MIN_TRANSIT_BUFFER_MINUTES: 20,

  // Environmental and hunger relief impact multipliers
  IMPACT_CONFIG: {
    MEAL_WEIGHT_KG: 0.42,       // 1 meal approx 420 grams
    CO2E_FACTOR_PER_KG: 2.5     // kg of CO2e avoided per kg food rescued
  },

  // Default coordinates centered in Ajmer, Rajasthan
  DEFAULT_CENTER: {
    latitude: 26.4499,
    longitude: 74.6399,
    city: 'Ajmer, Rajasthan'
  }
};

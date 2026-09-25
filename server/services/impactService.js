const { IMPACT_CONFIG } = require('../config/constants');

/**
 * Normalizes different donation units into weight in kilograms
 * @param {number} quantity 
 * @param {string} unit 
 * @returns {number} weight in kilograms
 */
const normalizeToKg = (quantity, unit = 'kg') => {
  const q = Number(quantity) || 0;
  switch ((unit || '').toLowerCase()) {
    case 'kg':
      return q;
    case 'meals':
      return Math.round(q * IMPACT_CONFIG.MEAL_WEIGHT_KG * 100) / 100;
    case 'packets':
    case 'trays':
      return Math.round(q * 0.5 * 100) / 100; // ~0.5 kg per packet/tray
    case 'liters':
      return q; // 1L ~ 1kg for soups/curries/water
    default:
      return q;
  }
};

/**
 * Calculates impact metrics: weight rescued, meals rescued, and CO2e emissions avoided
 * @param {number} quantity 
 * @param {string} unit 
 * @returns {{ foodRescuedKg: number, mealsRescued: number, co2eAvoidedKg: number, isEstimate: boolean }}
 */
const calculateImpact = (quantity, unit = 'kg') => {
  const foodRescuedKg = normalizeToKg(quantity, unit);
  
  // mealsRescued = foodWeight / configurableMealWeight
  const mealsRescued = Math.round(foodRescuedKg / IMPACT_CONFIG.MEAL_WEIGHT_KG);

  // co2eAvoided = foodWeight * configurableEmissionFactor
  const co2eAvoidedKg = Math.round(foodRescuedKg * IMPACT_CONFIG.CO2E_FACTOR_PER_KG * 100) / 100;

  return {
    foodRescuedKg,
    mealsRescued,
    co2eAvoidedKg,
    isEstimate: true,
    calculationDetails: {
      mealFactorKg: IMPACT_CONFIG.MEAL_WEIGHT_KG,
      co2eFactor: IMPACT_CONFIG.CO2E_FACTOR_PER_KG,
      disclaimer: 'Calculated using standardized UN FAO & EPA food waste loss prevention emission coefficients.'
    }
  };
};

module.exports = {
  normalizeToKg,
  calculateImpact
};

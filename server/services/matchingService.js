const NGOProfile = require('../models/NGOProfile');
const Match = require('../models/Match');
const Donation = require('../models/Donation');
const { calculateHaversineDistance, calculateEstimatedTravelTime } = require('../utils/distance');
const { getRemainingMinutes, isDeliveryFeasible } = require('../utils/expiryHelper');
const { MATCHING_WEIGHTS, DONATION_STATUS } = require('../config/constants');

const MAX_RADIUS_KM = 25; // 25 km rescue radius

/**
 * Calculates weighted match score for an NGO given a donation
 */
const evaluateNgoCandidate = (donation, ngoProfile) => {
  // 1. Distance Calculation
  const distance = calculateHaversineDistance(
    donation.latitude,
    donation.longitude,
    ngoProfile.latitude,
    ngoProfile.longitude
  );

  // 2. Feasibility Check: travel time vs remaining food life
  const estimatedTravelMinutes = calculateEstimatedTravelTime(distance);
  const remainingMinutes = getRemainingMinutes(donation.usableUntil);
  const feasible = isDeliveryFeasible(donation.usableUntil, estimatedTravelMinutes);

  if (!feasible || distance > MAX_RADIUS_KM) {
    return {
      ngoId: ngoProfile.userId,
      organizationName: ngoProfile.organizationName,
      address: ngoProfile.address,
      distance,
      estimatedTravelMinutes,
      feasible: false,
      rejectionReason: !feasible 
        ? `Usable time (${remainingMinutes}m) insufficient for pickup & delivery (${estimatedTravelMinutes + 20}m required).`
        : `Distance (${distance}km) exceeds max operational radius (${MAX_RADIUS_KM}km).`,
      scores: {
        distanceScore: 0,
        capacityScore: 0,
        needScore: 0,
        foodCompatibilityScore: 0,
        expirySafetyScore: 0,
        finalScore: 0
      }
    };
  }

  // 3. Distance Score (0 to 100) - closer gets higher score
  const distanceScore = Math.max(0, Math.round((1 - distance / MAX_RADIUS_KM) * 100));

  // 4. Capacity Score (0 to 100)
  let capacityScore = 0;
  if (ngoProfile.availableCapacity >= donation.quantity) {
    capacityScore = 100;
  } else if (ngoProfile.availableCapacity > 0) {
    capacityScore = Math.round((ngoProfile.availableCapacity / donation.quantity) * 100);
  }

  // 5. Need Score (0 to 100)
  const needMap = { Critical: 100, High: 80, Medium: 50, Low: 25 };
  const needScore = needMap[ngoProfile.currentNeeds] || 50;

  // 6. Food Compatibility Score (0 to 100)
  let foodCompatibilityScore = 40; // Default baseline
  if (Array.isArray(ngoProfile.foodPreferences)) {
    const prefersAll = ngoProfile.foodPreferences.some(p => p.toLowerCase().includes('all') || p.toLowerCase().includes('any'));
    const exactMatch = ngoProfile.foodPreferences.some(p => 
      p.toLowerCase().trim() === (donation.category || '').toLowerCase().trim()
    );
    if (exactMatch) {
      foodCompatibilityScore = 100;
    } else if (prefersAll) {
      foodCompatibilityScore = 80;
    } else {
      foodCompatibilityScore = 30;
    }
  }

  // 7. Expiry Safety Score (0 to 100)
  let expirySafetyScore = 50;
  if (remainingMinutes > 180) {
    expirySafetyScore = 100;
  } else if (remainingMinutes > 60) {
    expirySafetyScore = 75;
  } else {
    expirySafetyScore = 40;
  }

  // 8. Weighted Composite Final Score
  const w = MATCHING_WEIGHTS;
  const rawFinalScore = 
    (w.DISTANCE * distanceScore) +
    (w.CAPACITY * capacityScore) +
    (w.NEED * needScore) +
    (w.FOOD_COMPATIBILITY * foodCompatibilityScore) +
    (w.EXPIRY_SAFETY * expirySafetyScore);

  const finalScore = Math.round(rawFinalScore * 10) / 10;

  return {
    ngoId: ngoProfile.userId,
    organizationName: ngoProfile.organizationName,
    address: ngoProfile.address,
    latitude: ngoProfile.latitude,
    longitude: ngoProfile.longitude,
    distance,
    estimatedTravelMinutes,
    availableCapacity: ngoProfile.availableCapacity,
    currentNeeds: ngoProfile.currentNeeds,
    feasible: true,
    scores: {
      distanceScore,
      capacityScore,
      needScore,
      foodCompatibilityScore,
      expirySafetyScore,
      finalScore
    }
  };
};

/**
 * Finds and assigns the best-fit NGO for a donation
 * @param {string} donationId 
 * @param {object} [customWeights] 
 * @returns {Promise<object>} Match result
 */
const findBestMatchForDonation = async (donationId, customWeights = null) => {
  const donation = await Donation.findById(donationId).populate('donorId', 'name email phone');
  if (!donation) {
    throw new Error('Donation not found');
  }

  // Fetch all verified NGOs with available capacity
  const ngos = await NGOProfile.find({
    verificationStatus: 'Verified',
    availableCapacity: { $gt: 0 }
  }).populate('userId', 'name email phone');

  if (!ngos || ngos.length === 0) {
    return {
      success: false,
      message: 'No verified NGOs currently available with capacity.',
      candidates: []
    };
  }

  // Evaluate each candidate
  const candidates = ngos.map(ngo => evaluateNgoCandidate(donation, ngo));

  // Filter feasible candidates and sort by final score descending
  const feasibleCandidates = candidates
    .filter(c => c.feasible)
    .sort((a, b) => b.scores.finalScore - a.scores.finalScore);

  if (feasibleCandidates.length === 0) {
    return {
      success: false,
      message: 'No suitable NGO found within safe distance and expiry buffer window.',
      candidates
    };
  }

  const bestMatch = feasibleCandidates[0];

  // Persist Match record
  const matchRecord = await Match.create({
    donationId: donation._id,
    ngoId: bestMatch.ngoId,
    distance: bestMatch.distance,
    capacityScore: bestMatch.scores.capacityScore,
    needScore: bestMatch.scores.needScore,
    foodCompatibilityScore: bestMatch.scores.foodCompatibilityScore,
    expirySafetyScore: bestMatch.scores.expirySafetyScore,
    finalScore: bestMatch.scores.finalScore,
    status: 'ACCEPTED' // Auto-accepted for dispatch workflow
  });

  // Update Donation status to MATCHED and assign matchedNgoId
  donation.status = DONATION_STATUS.MATCHED;
  donation.matchedNgoId = bestMatch.ngoId;
  donation.statusHistory.push({
    status: DONATION_STATUS.MATCHED,
    timestamp: new Date(),
    note: `Automated match found: ${bestMatch.organizationName} (Score: ${bestMatch.scores.finalScore}/100, Dist: ${bestMatch.distance}km)`
  });
  await donation.save();

  return {
    success: true,
    match: matchRecord,
    selectedNgo: bestMatch,
    candidates
  };
};

module.exports = {
  evaluateNgoCandidate,
  findBestMatchForDonation
};

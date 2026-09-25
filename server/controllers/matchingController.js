const Donation = require('../models/Donation');
const NGOProfile = require('../models/NGOProfile');
const Match = require('../models/Match');
const { evaluateNgoCandidate, findBestMatchForDonation } = require('../services/matchingService');
const { MATCHING_WEIGHTS } = require('../config/constants');

/**
 * Trigger matching algorithm for a specific donation
 */
const runMatching = async (req, res, next) => {
  try {
    const { donationId } = req.params;
    const result = await findBestMatchForDonation(donationId);

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get comprehensive score breakdown of all candidate NGOs for a donation
 */
const getMatchingBreakdown = async (req, res, next) => {
  try {
    const { donationId } = req.params;
    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found.' });
    }

    const ngos = await NGOProfile.find({ verificationStatus: 'Verified' }).populate('userId', 'name email phone');

    const candidates = ngos.map(ngo => evaluateNgoCandidate(donation, ngo));

    // Existing active match record if any
    const existingMatch = await Match.findOne({ donationId }).populate('ngoId', 'name email phone');

    res.json({
      success: true,
      donationId,
      matchingWeights: MATCHING_WEIGHTS,
      existingMatch,
      candidates: candidates.sort((a, b) => b.scores.finalScore - a.scores.finalScore)
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  runMatching,
  getMatchingBreakdown
};

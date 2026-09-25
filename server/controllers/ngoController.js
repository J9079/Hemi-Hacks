const NGOProfile = require('../models/NGOProfile');
const Donation = require('../models/Donation');
const Match = require('../models/Match');
const { DONATION_STATUS } = require('../config/constants');
const { sendNotification } = require('../services/notificationService');
const { findBestMatchForDonation } = require('../services/matchingService');

/**
 * Get all NGOs
 */
const getAllNGOs = async (req, res, next) => {
  try {
    const ngos = await NGOProfile.find().populate('userId', 'name email phone');
    res.json({ success: true, count: ngos.length, ngos });
  } catch (err) {
    next(err);
  }
};

/**
 * Get single NGO by user ID or profile ID
 */
const getNGOById = async (req, res, next) => {
  try {
    const ngo = await NGOProfile.findOne({
      $or: [{ _id: req.params.id }, { userId: req.params.id }]
    }).populate('userId', 'name email phone');

    if (!ngo) {
      return res.status(404).json({ success: false, message: 'NGO not found.' });
    }

    const recentDonations = await Donation.find({ matchedNgoId: ngo.userId._id })
      .populate('donorId', 'name email phone')
      .populate('assignedDriverId', 'name phone')
      .sort({ updatedAt: -1 })
      .limit(10);

    res.json({ success: true, ngo, recentDonations });
  } catch (err) {
    next(err);
  }
};

/**
 * Update NGO Capacity
 */
const updateCapacity = async (req, res, next) => {
  try {
    const { capacity, availableCapacity } = req.body;
    const ngo = await NGOProfile.findOne({
      $or: [{ _id: req.params.id }, { userId: req.user._id }]
    });

    if (!ngo) {
      return res.status(404).json({ success: false, message: 'NGO profile not found.' });
    }

    if (capacity !== undefined) ngo.capacity = Math.max(0, Number(capacity));
    if (availableCapacity !== undefined) ngo.availableCapacity = Math.max(0, Number(availableCapacity));

    await ngo.save();

    res.json({
      success: true,
      message: 'NGO capacity updated successfully.',
      ngo
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update NGO Food Preferences and Current Needs
 */
const updateNeeds = async (req, res, next) => {
  try {
    const { currentNeeds, foodPreferences } = req.body;
    const ngo = await NGOProfile.findOne({
      $or: [{ _id: req.params.id }, { userId: req.user._id }]
    });

    if (!ngo) {
      return res.status(404).json({ success: false, message: 'NGO profile not found.' });
    }

    if (currentNeeds) ngo.currentNeeds = currentNeeds;
    if (foodPreferences) ngo.foodPreferences = foodPreferences;

    await ngo.save();

    res.json({
      success: true,
      message: 'Shelter needs and food preferences updated.',
      ngo
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Accept matched donation
 */
const acceptDonation = async (req, res, next) => {
  try {
    const { donationId } = req.params;
    const donation = await Donation.findById(donationId).populate('donorId', 'name email phone');
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found.' });
    }

    // Verify status is MATCHED
    if (donation.status !== DONATION_STATUS.MATCHED) {
      return res.status(400).json({
        success: false,
        message: `Donation cannot be accepted in status ${donation.status}.`
      });
    }

    // Update match record
    await Match.findOneAndUpdate(
      { donationId, ngoId: req.user._id },
      { status: 'ACCEPTED' }
    );

    donation.statusHistory.push({
      status: DONATION_STATUS.MATCHED,
      timestamp: new Date(),
      note: `Shelter accepted the donation: Ready for driver dispatch.`,
      updatedBy: req.user._id
    });
    await donation.save();

    // Broadcast to drivers
    await sendNotification(req.io, {
      type: 'DRIVER_ASSIGNED',
      title: 'Food Pickup Ready for Dispatch',
      message: `Pickup confirmed by shelter for ${donation.foodName}. Drivers can accept now.`,
      relatedDonationId: donation._id,
      role: 'DRIVER'
    });

    res.json({
      success: true,
      message: 'Donation accepted by shelter. Driver dispatch open.',
      donation
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Reject matched donation and trigger re-matching
 */
const rejectDonation = async (req, res, next) => {
  try {
    const { donationId } = req.params;
    const { reason } = req.body;
    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found.' });
    }

    // Update match record
    await Match.findOneAndUpdate(
      { donationId, ngoId: req.user._id },
      { status: 'REJECTED' }
    );

    donation.status = DONATION_STATUS.REJECTED;
    donation.matchedNgoId = null;
    donation.statusHistory.push({
      status: DONATION_STATUS.REJECTED,
      timestamp: new Date(),
      note: `Shelter declined donation. Reason: ${reason || 'Capacity limit reached'}. Re-routing...`,
      updatedBy: req.user._id
    });
    await donation.save();

    // Automatically re-run matching to select the next best available NGO!
    const reMatch = await findBestMatchForDonation(donation._id);

    res.json({
      success: true,
      message: 'Donation rejected and automatically re-routed to next best recipient shelter.',
      reMatchResult: reMatch
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllNGOs,
  getNGOById,
  updateCapacity,
  updateNeeds,
  acceptDonation,
  rejectDonation
};

const Donation = require('../models/Donation');
const User = require('../models/User');
const NGOProfile = require('../models/NGOProfile');
const DriverProfile = require('../models/DriverProfile');
const { DONATION_STATUS } = require('../config/constants');
const { findBestMatchForDonation } = require('../services/matchingService');
const { sendNotification } = require('../services/notificationService');
const { assertValidTransition, appendStatusHistory } = require('../utils/stateMachine');
const { getRemainingMinutes } = require('../utils/expiryHelper');

/**
 * Post a new surplus food donation and automatically run the matching engine
 */
const createDonation = async (req, res, next) => {
  try {
    const {
      foodName,
      category,
      description,
      quantity,
      unit,
      preparedAt,
      usableUntil,
      pickupAddress,
      latitude,
      longitude,
      foodSafetyInfo,
      photo
    } = req.body;

    // Validation
    if (!foodName || !quantity || !usableUntil || !pickupAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please provide food name, quantity, usable until time, and pickup address.'
      });
    }

    if (Number(quantity) <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be greater than zero.' });
    }

    const remainingMinutes = getRemainingMinutes(usableUntil);
    if (remainingMinutes <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Usable until time must be in the future.'
      });
    }

    const donorId = req.user._id;

    // Create donation with POSTED status
    const donation = await Donation.create({
      donorId,
      foodName,
      category: category || 'Cooked Food',
      description: description || '',
      quantity: Number(quantity),
      unit: unit || 'kg',
      preparedAt: preparedAt || new Date(),
      usableUntil: new Date(usableUntil),
      pickupAddress,
      latitude: Number(latitude) || req.user.location?.latitude || 26.4499,
      longitude: Number(longitude) || req.user.location?.longitude || 74.6399,
      foodSafetyInfo: foodSafetyInfo || 'Maintained under hygienic conditions.',
      photo: photo || '',
      status: DONATION_STATUS.POSTED
    });

    // Notify role:ADMIN that new food has been posted
    await sendNotification(req.io, {
      type: 'DONATION_CREATED',
      title: 'New Surplus Food Posted',
      message: `${req.user.name} posted ${donation.quantity} ${donation.unit} of ${donation.foodName}.`,
      relatedDonationId: donation._id,
      role: 'ADMIN'
    });

    // Automatic Step 5 & 6: Execute Matching Engine immediately
    const matchResult = await findBestMatchForDonation(donation._id);

    let updatedDonation = donation;
    if (matchResult.success && matchResult.selectedNgo) {
      // Reload updated donation
      updatedDonation = await Donation.findById(donation._id)
        .populate('donorId', 'name email phone location')
        .populate('matchedNgoId', 'name email phone location');

      // Send real-time notification to the matched NGO
      await sendNotification(req.io, {
        userId: matchResult.selectedNgo.ngoId,
        type: 'MATCH_FOUND',
        title: 'New Matched Surplus Food Available!',
        message: `${updatedDonation.quantity} ${updatedDonation.unit} of ${updatedDonation.foodName} matched from ${req.user.name} (${matchResult.selectedNgo.distance} km away).`,
        relatedDonationId: donation._id,
        role: 'NGO'
      });

      // Send real-time notification to the donor
      await sendNotification(req.io, {
        userId: donorId,
        type: 'MATCH_FOUND',
        title: 'Donation Matched with Shelter!',
        message: `Your donation "${donation.foodName}" was matched with ${matchResult.selectedNgo.organizationName} (Score: ${matchResult.selectedNgo.scores.finalScore}/100).`,
        relatedDonationId: donation._id,
        role: 'DONOR'
      });

      // Broadcast available pickup request to available drivers
      await sendNotification(req.io, {
        type: 'DRIVER_ASSIGNED',
        title: 'Rescue Dispatch Request Available',
        message: `New pickup available: ${donation.foodName} (${donation.quantity} ${donation.unit}) in ${donation.pickupAddress}.`,
        relatedDonationId: donation._id,
        role: 'DRIVER'
      });
    }

    res.status(201).json({
      success: true,
      donation: updatedDonation,
      matchResult
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all donations with optional filters
 */
const getDonations = async (req, res, next) => {
  try {
    const { status, category, donorId, matchedNgoId, assignedDriverId, search } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (donorId) filter.donorId = donorId;
    if (matchedNgoId) filter.matchedNgoId = matchedNgoId;
    if (assignedDriverId) filter.assignedDriverId = assignedDriverId;
    if (search) {
      filter.$or = [
        { foodName: { $regex: search, $options: 'i' } },
        { pickupAddress: { $regex: search, $options: 'i' } }
      ];
    }

    // Role-specific scoping if not admin
    if (req.user) {
      if (req.user.role === 'DONOR') {
        filter.donorId = req.user._id;
      } else if (req.user.role === 'NGO') {
        // NGOs see their matched donations or open donations
        if (!status && !matchedNgoId) {
          filter.$or = [{ matchedNgoId: req.user._id }, { status: DONATION_STATUS.POSTED }];
        }
      }
    }

    const donations = await Donation.find(filter)
      .populate('donorId', 'name email phone location')
      .populate('matchedNgoId', 'name email phone location')
      .populate('assignedDriverId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: donations.length,
      donations
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get a single donation by ID
 */
const getDonationById = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donorId', 'name email phone location')
      .populate('matchedNgoId', 'name email phone location')
      .populate('assignedDriverId', 'name email phone');

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found.' });
    }

    let donorProfile = null;
    let ngoProfile = null;
    let driverProfile = null;

    if (donation.donorId) {
      donorProfile = await DonorProfile.findOne({ userId: donation.donorId._id });
    }
    if (donation.matchedNgoId) {
      ngoProfile = await NGOProfile.findOne({ userId: donation.matchedNgoId._id });
    }
    if (donation.assignedDriverId) {
      driverProfile = await DriverProfile.findOne({ userId: donation.assignedDriverId._id });
    }

    res.json({
      success: true,
      donation,
      profiles: {
        donor: donorProfile,
        ngo: ngoProfile,
        driver: driverProfile
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Cancel a donation
 */
const cancelDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found.' });
    }

    assertValidTransition(donation.status, DONATION_STATUS.CANCELLED);

    donation.status = DONATION_STATUS.CANCELLED;
    donation.statusHistory = appendStatusHistory(
      donation.statusHistory,
      DONATION_STATUS.CANCELLED,
      req.user._id,
      req.body.reason || 'Cancelled by user'
    );
    await donation.save();

    await sendNotification(req.io, {
      type: 'GENERAL',
      title: 'Donation Cancelled',
      message: `Donation "${donation.foodName}" has been cancelled.`,
      relatedDonationId: donation._id
    });

    res.json({
      success: true,
      message: 'Donation successfully cancelled.',
      donation
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createDonation,
  getDonations,
  getDonationById,
  cancelDonation
};

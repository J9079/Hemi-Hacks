const Donation = require('../models/Donation');
const User = require('../models/User');
const NGOProfile = require('../models/NGOProfile');
const DriverProfile = require('../models/DriverProfile');
const Match = require('../models/Match');
const { DONATION_STATUS } = require('../config/constants');
const { findBestMatchForDonation } = require('../services/matchingService');
const { sendNotification } = require('../services/notificationService');
const { assertValidTransition, appendStatusHistory } = require('../utils/stateMachine');
const { getRemainingMinutes } = require('../utils/expiryHelper');
const { calculateHaversineDistance } = require('../utils/distance');

/**
 * Post a new surplus food donation and run matching engine or direct shelter delivery
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
      photo,
      matchingMode = 'AUTOMATIC',
      targetNgoId
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

    // Check if donor directly selected a target NGO
    let targetNgoUser = null;
    let targetNgoProfile = null;
    if (matchingMode === 'MANUAL' && targetNgoId) {
      targetNgoUser = await User.findById(targetNgoId);
      if (targetNgoUser) {
        targetNgoProfile = await NGOProfile.findOne({ userId: targetNgoId });
      } else {
        targetNgoProfile = await NGOProfile.findById(targetNgoId).populate('userId');
        if (targetNgoProfile && targetNgoProfile.userId) {
          targetNgoUser = targetNgoProfile.userId;
        }
      }
    }

    const isManualMatch = matchingMode === 'MANUAL' && targetNgoUser;

    // Create donation record
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
      matchingMode: isManualMatch ? 'MANUAL' : 'AUTOMATIC',
      matchedNgoId: isManualMatch ? targetNgoUser._id : null,
      status: isManualMatch ? DONATION_STATUS.MATCHED : DONATION_STATUS.POSTED
    });

    // Notify role:ADMIN that new food has been posted
    await sendNotification(req.io, {
      type: 'DONATION_CREATED',
      title: 'New Surplus Food Posted',
      message: `${req.user.name} posted ${donation.quantity} ${donation.unit} of ${donation.foodName}.`,
      relatedDonationId: donation._id,
      role: 'ADMIN'
    });

    // If Food Donor manually selected the destination NGO
    if (isManualMatch) {
      const dist = targetNgoProfile
        ? calculateHaversineDistance(
            donation.latitude,
            donation.longitude,
            targetNgoProfile.latitude,
            targetNgoProfile.longitude
          )
        : 0;

      const manualMatch = await Match.create({
        donationId: donation._id,
        ngoId: targetNgoUser._id,
        distance: Math.round(dist * 10) / 10,
        capacityScore: 100,
        needScore: 100,
        foodCompatibilityScore: 100,
        expirySafetyScore: 100,
        finalScore: 100,
        status: 'PENDING'
      });

      donation.statusHistory.push({
        status: DONATION_STATUS.MATCHED,
        timestamp: new Date(),
        note: `Donor directly routed rescue to shelter: ${targetNgoProfile?.organizationName || targetNgoUser.name} (${Math.round(dist * 10) / 10} km away)`,
        updatedBy: donorId
      });
      await donation.save();

      // Send real-time notification to the selected NGO
      await sendNotification(req.io, {
        userId: targetNgoUser._id,
        type: 'MATCH_FOUND',
        title: 'Direct Surplus Food Donation Received!',
        message: `${req.user.name} directly sent you ${donation.quantity} ${donation.unit} of ${donation.foodName}.`,
        relatedDonationId: donation._id,
        role: 'NGO'
      });

      // Send real-time notification to the donor
      await sendNotification(req.io, {
        userId: donorId,
        type: 'MATCH_FOUND',
        title: 'Donation Sent to Selected Shelter!',
        message: `Your donation "${donation.foodName}" was directly sent to ${targetNgoProfile?.organizationName || targetNgoUser.name}.`,
        relatedDonationId: donation._id,
        role: 'DONOR'
      });

      // Broadcast available pickup request to available drivers
      await sendNotification(req.io, {
        type: 'DRIVER_ASSIGNED',
        title: 'Rescue Dispatch Request Available',
        message: `New pickup available for ${targetNgoProfile?.organizationName || targetNgoUser.name}: ${donation.foodName} (${donation.quantity} ${donation.unit}).`,
        relatedDonationId: donation._id,
        role: 'DRIVER'
      });

      const updatedDonation = await Donation.findById(donation._id)
        .populate('donorId', 'name email phone location')
        .populate('matchedNgoId', 'name email phone location');

      return res.status(201).json({
        success: true,
        donation: updatedDonation,
        matchResult: {
          success: true,
          match: manualMatch,
          selectedNgo: {
            ngoId: targetNgoUser._id,
            organizationName: targetNgoProfile?.organizationName || targetNgoUser.name,
            address: targetNgoProfile?.address || '',
            distance: Math.round(dist * 10) / 10,
            scores: { finalScore: 100 }
          }
        }
      });
    }

    // Default Automatic Flow: Execute Multi-Factor Matching Engine
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

/**
 * Update an existing donation (PUT /api/donations/:id)
 */
const updateDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found.' });
    }

    // Only owner or admin can edit
    if (donation.donorId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'You do not have permission to edit this donation.' });
    }

    // Can only edit if status is POSTED or MATCHED (not yet dispatched with driver)
    if (!['POSTED', 'MATCHED'].includes(donation.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot edit donation in '${donation.status}' state once volunteer driver is assigned.`
      });
    }

    const {
      foodName,
      category,
      quantity,
      unit,
      description,
      preparedAt,
      usableUntil,
      pickupAddress,
      latitude,
      longitude,
      foodSafetyInfo,
      photo
    } = req.body;

    if (foodName !== undefined) donation.foodName = foodName;
    if (category !== undefined) donation.category = category;
    if (quantity !== undefined) {
      if (Number(quantity) <= 0) {
        return res.status(400).json({ success: false, message: 'Quantity must be greater than zero.' });
      }
      donation.quantity = Number(quantity);
    }
    if (unit !== undefined) donation.unit = unit;
    if (description !== undefined) donation.description = description;
    if (preparedAt !== undefined) donation.preparedAt = new Date(preparedAt);
    if (usableUntil !== undefined) {
      const remainingMinutes = getRemainingMinutes(usableUntil);
      if (remainingMinutes <= 0) {
        return res.status(400).json({ success: false, message: 'Usable until time must be in the future.' });
      }
      donation.usableUntil = new Date(usableUntil);
    }
    if (pickupAddress !== undefined) donation.pickupAddress = pickupAddress;
    if (latitude !== undefined) donation.latitude = Number(latitude);
    if (longitude !== undefined) donation.longitude = Number(longitude);
    if (foodSafetyInfo !== undefined) donation.foodSafetyInfo = foodSafetyInfo;
    if (photo !== undefined) donation.photo = photo;

    donation.statusHistory.push({
      status: donation.status,
      timestamp: new Date(),
      note: 'Donation details updated by donor',
      updatedBy: req.user._id
    });

    await donation.save();

    // Re-evaluate matching if quantity, usable time or location changed
    const matchResult = await findBestMatchForDonation(donation._id);

    const updated = await Donation.findById(donation._id)
      .populate('donorId', 'name email phone location')
      .populate('matchedNgoId', 'name email phone location');

    res.json({
      success: true,
      message: 'Donation updated successfully.',
      donation: updated,
      matchResult
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete an existing donation (DELETE /api/donations/:id)
 */
const deleteDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found.' });
    }

    // Only owner or admin can delete
    if (donation.donorId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'You do not have permission to delete this donation.' });
    }

    // Prevent deletion if actively on route
    if (['PICKUP_STARTED', 'PICKED_UP', 'IN_TRANSIT'].includes(donation.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete donation while volunteer driver is currently in transit.'
      });
    }

    // Remove associated matches
    const Match = require('../models/Match');
    await Match.deleteMany({ donationId: donation._id });

    // Delete donation
    await Donation.findByIdAndDelete(donation._id);

    res.json({
      success: true,
      message: 'Donation deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createDonation,
  getDonations,
  getDonationById,
  updateDonation,
  deleteDonation,
  cancelDonation
};


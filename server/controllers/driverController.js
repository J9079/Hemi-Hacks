const DriverProfile = require('../models/DriverProfile');
const Donation = require('../models/Donation');
const Delivery = require('../models/Delivery');
const DonorProfile = require('../models/DonorProfile');
const NGOProfile = require('../models/NGOProfile');
const { DONATION_STATUS } = require('../config/constants');
const { sendNotification } = require('../services/notificationService');
const RoutingService = require('../services/routingService');
const { assertValidTransition, appendStatusHistory } = require('../utils/stateMachine');
const { getRemainingMinutes } = require('../utils/expiryHelper');

/**
 * Get all available drivers
 */
const getAvailableDrivers = async (req, res, next) => {
  try {
    const drivers = await DriverProfile.find({
      availabilityStatus: 'Available',
      verificationStatus: 'Verified'
    }).populate('userId', 'name email phone');

    res.json({ success: true, count: drivers.length, drivers });
  } catch (err) {
    next(err);
  }
};

/**
 * Get pending pickup requests available for drivers
 */
const getPickupRequests = async (req, res, next) => {
  try {
    const requests = await Donation.find({
      status: DONATION_STATUS.MATCHED,
      matchedNgoId: { $ne: null }
    })
      .populate('donorId', 'name email phone location')
      .populate('matchedNgoId', 'name email phone location')
      .sort({ createdAt: -1 });

    // Format with detailed route and expiry calculations
    const formatted = await Promise.all(
      requests.map(async (d) => {
        const remainingMinutes = getRemainingMinutes(d.usableUntil);
        const donorProf = await DonorProfile.findOne({ userId: d.donorId._id });
        const ngoProf = await NGOProfile.findOne({ userId: d.matchedNgoId._id });

        const donorCoord = {
          address: d.pickupAddress,
          latitude: d.latitude,
          longitude: d.longitude
        };

        const ngoCoord = {
          address: ngoProf ? ngoProf.address : 'Ajmer Shelter',
          latitude: ngoProf ? ngoProf.latitude : 26.4520,
          longitude: ngoProf ? ngoProf.longitude : 74.6360
        };

        const route = await RoutingService.calculateRoute(donorCoord, ngoCoord);

        return {
          donation: d,
          donorProfile: donorProf,
          ngoProfile: ngoProf,
          distanceKm: route.distanceKm,
          estimatedMinutes: route.estimatedMinutes,
          remainingMinutes,
          isUrgent: remainingMinutes < 60
        };
      })
    );

    res.json({ success: true, count: formatted.length, requests: formatted });
  } catch (err) {
    next(err);
  }
};

/**
 * Accept a pickup request
 */
const acceptPickupRequest = async (req, res, next) => {
  try {
    const { id: donationId } = req.params;
    const driverId = req.user._id;

    const donation = await Donation.findById(donationId)
      .populate('donorId', 'name email phone location')
      .populate('matchedNgoId', 'name email phone location');

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found.' });
    }

    if (donation.status !== DONATION_STATUS.MATCHED) {
      return res.status(400).json({
        success: false,
        message: `Pickup cannot be accepted: Donation is in '${donation.status}' state.`
      });
    }

    // Verify expiry
    const remainingMinutes = getRemainingMinutes(donation.usableUntil);
    if (remainingMinutes <= 0) {
      donation.status = DONATION_STATUS.EXPIRED;
      await donation.save();
      return res.status(400).json({
        success: false,
        message: 'This food donation has expired and cannot be accepted.'
      });
    }

    // Validate state transition
    assertValidTransition(donation.status, DONATION_STATUS.DRIVER_ASSIGNED);

    // Update donation
    donation.status = DONATION_STATUS.DRIVER_ASSIGNED;
    donation.assignedDriverId = driverId;
    donation.statusHistory = appendStatusHistory(
      donation.statusHistory,
      DONATION_STATUS.DRIVER_ASSIGNED,
      driverId,
      `Volunteer / Driver ${req.user.name} accepted the rescue request.`
    );
    await donation.save();

    // Update driver profile availability
    await DriverProfile.findOneAndUpdate(
      { userId: driverId },
      { availabilityStatus: 'On Delivery' }
    );

    // Fetch NGO details for route
    const ngoProf = await NGOProfile.findOne({ userId: donation.matchedNgoId._id });
    const donorCoord = {
      address: donation.pickupAddress,
      latitude: donation.latitude,
      longitude: donation.longitude
    };
    const ngoCoord = {
      address: ngoProf ? ngoProf.address : 'Ajmer Shelter',
      latitude: ngoProf ? ngoProf.latitude : 26.4520,
      longitude: ngoProf ? ngoProf.longitude : 74.6360
    };

    const route = await RoutingService.calculateRoute(donorCoord, ngoCoord);

    // Create or update Delivery record
    const delivery = await Delivery.create({
      donationId: donation._id,
      driverId,
      donorId: donation.donorId._id,
      ngoId: donation.matchedNgoId._id,
      pickupLocation: donorCoord,
      deliveryLocation: ngoCoord,
      distance: route.distanceKm,
      estimatedTime: route.estimatedMinutes,
      status: 'ASSIGNED',
      routeCoordinates: route.waypoints
    });

    // Notify donor
    await sendNotification(req.io, {
      userId: donation.donorId._id,
      type: 'DRIVER_ASSIGNED',
      title: 'Volunteer Driver Assigned!',
      message: `${req.user.name} has accepted pickup for your donation "${donation.foodName}". ETA: ~${route.estimatedMinutes} mins.`,
      relatedDonationId: donation._id,
      role: 'DONOR'
    });

    // Notify NGO
    await sendNotification(req.io, {
      userId: donation.matchedNgoId._id,
      type: 'DRIVER_ASSIGNED',
      title: 'Food Rescue En Route Soon',
      message: `Driver ${req.user.name} is picking up ${donation.quantity} ${donation.unit} of ${donation.foodName}.`,
      relatedDonationId: donation._id,
      role: 'NGO'
    });

    res.json({
      success: true,
      message: 'Pickup request accepted successfully! Route initialized.',
      donation,
      delivery,
      route
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get active delivery for the current driver
 */
const getActiveDelivery = async (req, res, next) => {
  try {
    const delivery = await Delivery.findOne({
      driverId: req.user._id,
      status: { $in: ['ASSIGNED', 'PICKUP_STARTED', 'PICKED_UP', 'IN_TRANSIT'] }
    })
      .populate({
        path: 'donationId',
        populate: [
          { path: 'donorId', select: 'name phone email' },
          { path: 'matchedNgoId', select: 'name phone email' }
        ]
      })
      .populate('donorId', 'name phone')
      .populate('ngoId', 'name phone');

    res.json({
      success: true,
      delivery
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update driver availability status
 */
const updateAvailability = async (req, res, next) => {
  try {
    const { status } = req.body;
    const profile = await DriverProfile.findOneAndUpdate(
      { userId: req.user._id },
      { availabilityStatus: status },
      { new: true }
    );
    res.json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};

/**
 * Update driver real-time GPS location (PUT /api/drivers/location)
 */
const updateDriverLocation = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude required.' });
    }

    const profile = await DriverProfile.findOneAndUpdate(
      { userId: req.user._id },
      {
        currentLocation: {
          latitude: Number(latitude),
          longitude: Number(longitude),
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    res.json({ success: true, currentLocation: profile?.currentLocation });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAvailableDrivers,
  getPickupRequests,
  acceptPickupRequest,
  getActiveDelivery,
  updateAvailability,
  updateDriverLocation
};


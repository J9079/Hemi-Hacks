const Delivery = require('../models/Delivery');
const Donation = require('../models/Donation');
const NGOProfile = require('../models/NGOProfile');
const DriverProfile = require('../models/DriverProfile');
const { DONATION_STATUS } = require('../config/constants');
const { assertValidTransition, appendStatusHistory } = require('../utils/stateMachine');
const { sendNotification } = require('../services/notificationService');
const { calculateImpact } = require('../services/impactService');

/**
 * Get delivery details by ID
 */
const getDeliveryById = async (req, res, next) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate('donationId')
      .populate('driverId', 'name phone email')
      .populate('donorId', 'name phone email location')
      .populate('ngoId', 'name phone email location');

    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found.' });
    }

    res.json({ success: true, delivery });
  } catch (err) {
    next(err);
  }
};

/**
 * Update delivery status through the delivery state machine
 */
const updateDeliveryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const delivery = await Delivery.findById(id).populate('donationId');
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery record not found.' });
    }

    const donation = await Donation.findById(delivery.donationId._id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Associated donation not found.' });
    }

    // Map delivery action to target donation status
    let nextDonationStatus = status;

    // Validate state machine transition on donation
    assertValidTransition(donation.status, nextDonationStatus);

    donation.status = nextDonationStatus;
    donation.statusHistory = appendStatusHistory(
      donation.statusHistory,
      nextDonationStatus,
      req.user._id,
      note || `Status progressed to ${nextDonationStatus}`
    );

    // Update delivery record timestamps and status
    delivery.status = nextDonationStatus;
    if (nextDonationStatus === DONATION_STATUS.PICKED_UP && !delivery.pickupTime) {
      delivery.pickupTime = new Date();
    }

    let impactSummary = null;

    // Handling DELIVERED terminal status
    if (nextDonationStatus === DONATION_STATUS.DELIVERED) {
      delivery.deliveryTime = new Date();

      // Step 18: Update NGO capacity
      const ngoProfile = await NGOProfile.findOne({ userId: delivery.ngoId });
      if (ngoProfile) {
        // Reduce available capacity safely (min 0)
        ngoProfile.availableCapacity = Math.max(0, ngoProfile.availableCapacity - donation.quantity);
        await ngoProfile.save();
      }

      // Free driver up and increment count
      await DriverProfile.findOneAndUpdate(
        { userId: delivery.driverId },
        {
          availabilityStatus: 'Available',
          $inc: { totalDeliveriesCompleted: 1 }
        }
      );

      // Compute impact statistics
      impactSummary = calculateImpact(donation.quantity, donation.unit);

      // Notify Donor
      await sendNotification(req.io, {
        userId: delivery.donorId,
        type: 'DELIVERY_COMPLETED',
        title: 'Food Rescue Delivered Successfully!',
        message: `Your donation "${donation.foodName}" has been safely received at the shelter. You rescued ~${impactSummary.mealsRescued} meals!`,
        relatedDonationId: donation._id,
        role: 'DONOR'
      });

      // Notify NGO
      await sendNotification(req.io, {
        userId: delivery.ngoId,
        type: 'DELIVERY_COMPLETED',
        title: 'Surplus Food Received',
        message: `${donation.quantity} ${donation.unit} of ${donation.foodName} has arrived at your facility.`,
        relatedDonationId: donation._id,
        role: 'NGO'
      });

      // Notify Driver
      await sendNotification(req.io, {
        userId: delivery.driverId,
        type: 'DELIVERY_COMPLETED',
        title: 'Mission Complete!',
        message: `Thank you for delivering ${donation.foodName}. Another life touched.`,
        relatedDonationId: donation._id,
        role: 'DRIVER'
      });
    } else if (nextDonationStatus === DONATION_STATUS.PICKUP_STARTED) {
      await sendNotification(req.io, {
        userId: delivery.donorId,
        type: 'PICKUP_STARTED',
        title: 'Driver En Route for Pickup',
        message: `The driver has started heading to your location for pickup.`,
        relatedDonationId: donation._id
      });
    } else if (nextDonationStatus === DONATION_STATUS.PICKED_UP) {
      await sendNotification(req.io, {
        userId: delivery.donorId,
        type: 'FOOD_PICKED_UP',
        title: 'Food Picked Up',
        message: `Your food has been picked up from your location.`,
        relatedDonationId: donation._id
      });
    } else if (nextDonationStatus === DONATION_STATUS.IN_TRANSIT) {
      await sendNotification(req.io, {
        userId: delivery.ngoId,
        type: 'DELIVERY_STARTED',
        title: 'Food In Transit to Shelter',
        message: `The driver is now on the road heading to your shelter.`,
        relatedDonationId: donation._id
      });
    }

    await donation.save();
    await delivery.save();

    res.json({
      success: true,
      message: `Delivery status transitioned to ${nextDonationStatus}`,
      delivery,
      donation,
      impactSummary
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDeliveryById,
  updateDeliveryStatus
};

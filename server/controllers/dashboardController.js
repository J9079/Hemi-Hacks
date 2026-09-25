const Donation = require('../models/Donation');
const Delivery = require('../models/Delivery');
const User = require('../models/User');
const NGOProfile = require('../models/NGOProfile');
const DonorProfile = require('../models/DonorProfile');
const DriverProfile = require('../models/DriverProfile');
const { DONATION_STATUS, ROLES } = require('../config/constants');
const { calculateImpact } = require('../services/impactService');

/**
 * Admin Comprehensive Dashboard
 */
const getAdminDashboard = async (req, res, next) => {
  try {
    const [
      totalDonations,
      activeDonations,
      matchedDonations,
      completedDeliveries,
      expiredDonations,
      totalDonors,
      totalNGOs,
      totalDrivers,
      allDonations,
      recentDeliveries
    ] = await Promise.all([
      Donation.countDocuments(),
      Donation.countDocuments({
        status: {
          $in: [
            DONATION_STATUS.POSTED,
            DONATION_STATUS.MATCHED,
            DONATION_STATUS.DRIVER_ASSIGNED,
            DONATION_STATUS.PICKUP_STARTED,
            DONATION_STATUS.PICKED_UP,
            DONATION_STATUS.IN_TRANSIT
          ]
        }
      }),
      Donation.countDocuments({ status: DONATION_STATUS.MATCHED }),
      Donation.countDocuments({ status: DONATION_STATUS.DELIVERED }),
      Donation.countDocuments({ status: DONATION_STATUS.EXPIRED }),
      User.countDocuments({ role: ROLES.DONOR }),
      User.countDocuments({ role: ROLES.NGO }),
      User.countDocuments({ role: ROLES.DRIVER }),
      Donation.find().select('category quantity unit status createdAt pickupAddress latitude longitude'),
      Delivery.find()
        .populate('donationId')
        .populate('driverId', 'name')
        .populate('donorId', 'name')
        .populate('ngoId', 'name')
        .sort({ updatedAt: -1 })
        .limit(8)
    ]);

    // Calculate aggregated impact across all completed deliveries
    let totalKgRescued = 0;
    let totalMealsRescued = 0;
    let totalCo2eAvoided = 0;

    // Category breakdown
    const categoryMap = {};
    // Timeline breakdown
    const dayMap = {};

    allDonations.forEach((d) => {
      // Category count
      categoryMap[d.category] = (categoryMap[d.category] || 0) + 1;

      if (d.status === DONATION_STATUS.DELIVERED) {
        const impact = calculateImpact(d.quantity, d.unit);
        totalKgRescued += impact.foodRescuedKg;
        totalMealsRescued += impact.mealsRescued;
        totalCo2eAvoided += impact.co2eAvoidedKg;

        const day = new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dayMap[day] = (dayMap[day] || 0) + impact.foodRescuedKg;
      }
    });

    const categoryBreakdown = Object.keys(categoryMap).map((k) => ({
      name: k,
      count: categoryMap[k]
    }));

    const rescuedTimeline = Object.keys(dayMap).map((k) => ({
      date: k,
      kgRescued: Math.round(dayMap[k] * 10) / 10
    }));

    const completionRate = totalDonations > 0 ? Math.round((completedDeliveries / totalDonations) * 100) : 0;

    res.json({
      success: true,
      stats: {
        totalDonations,
        activeDonations,
        matchedDonations,
        completedDeliveries,
        expiredDonations,
        totalFoodRescuedKg: Math.round(totalKgRescued),
        totalMealsRescued,
        totalCo2eAvoidedKg: Math.round(totalCo2eAvoided),
        totalDonors,
        totalNGOs,
        totalDrivers,
        completionRate
      },
      categoryBreakdown,
      rescuedTimeline,
      recentDeliveries
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Donor Specific Dashboard
 */
const getDonorDashboard = async (req, res, next) => {
  try {
    const donorId = req.user._id;

    const [donations, donorProfile] = await Promise.all([
      Donation.find({ donorId })
        .populate('matchedNgoId', 'name phone')
        .populate('assignedDriverId', 'name phone')
        .sort({ createdAt: -1 }),
      DonorProfile.findOne({ userId: donorId })
    ]);

    let foodRescuedKg = 0;
    let mealsRescued = 0;
    let completedPickups = 0;
    let activeDonationsCount = 0;

    donations.forEach((d) => {
      if (d.status === DONATION_STATUS.DELIVERED) {
        completedPickups++;
        const imp = calculateImpact(d.quantity, d.unit);
        foodRescuedKg += imp.foodRescuedKg;
        mealsRescued += imp.mealsRescued;
      } else if (
        [
          DONATION_STATUS.POSTED,
          DONATION_STATUS.MATCHED,
          DONATION_STATUS.DRIVER_ASSIGNED,
          DONATION_STATUS.PICKUP_STARTED,
          DONATION_STATUS.PICKED_UP,
          DONATION_STATUS.IN_TRANSIT
        ].includes(d.status)
      ) {
        activeDonationsCount++;
      }
    });

    res.json({
      success: true,
      stats: {
        totalDonations: donations.length,
        activeDonations: activeDonationsCount,
        foodRescuedKg: Math.round(foodRescuedKg),
        mealsRescued,
        completedPickups
      },
      donorProfile,
      recentDonations: donations
    });
  } catch (err) {
    next(err);
  }
};

/**
 * NGO Specific Dashboard
 */
const getNgoDashboard = async (req, res, next) => {
  try {
    const ngoId = req.user._id;

    const [ngoProfile, matchedDonations] = await Promise.all([
      NGOProfile.findOne({ userId: ngoId }),
      Donation.find({ matchedNgoId: ngoId })
        .populate('donorId', 'name phone location')
        .populate('assignedDriverId', 'name phone')
        .sort({ createdAt: -1 })
    ]);

    let incomingMealsToday = 0;
    let totalReceivedMeals = 0;

    matchedDonations.forEach((d) => {
      const imp = calculateImpact(d.quantity, d.unit);
      if (d.status === DONATION_STATUS.DELIVERED) {
        totalReceivedMeals += imp.mealsRescued;
      } else if (
        [
          DONATION_STATUS.MATCHED,
          DONATION_STATUS.DRIVER_ASSIGNED,
          DONATION_STATUS.PICKUP_STARTED,
          DONATION_STATUS.PICKED_UP,
          DONATION_STATUS.IN_TRANSIT
        ].includes(d.status)
      ) {
        incomingMealsToday += imp.mealsRescued;
      }
    });

    res.json({
      success: true,
      ngoProfile,
      stats: {
        totalCapacity: ngoProfile ? ngoProfile.capacity : 100,
        availableCapacity: ngoProfile ? ngoProfile.availableCapacity : 0,
        incomingMealsToday,
        totalReceivedMeals
      },
      donations: matchedDonations
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Driver Specific Dashboard
 */
const getDriverDashboard = async (req, res, next) => {
  try {
    const driverId = req.user._id;

    const [profile, activeDelivery, completedDeliveries] = await Promise.all([
      DriverProfile.findOne({ userId: driverId }),
      Delivery.findOne({
        driverId,
        status: { $in: ['ASSIGNED', 'PICKUP_STARTED', 'PICKED_UP', 'IN_TRANSIT'] }
      })
        .populate('donationId')
        .populate('donorId', 'name phone')
        .populate('ngoId', 'name phone'),
      Delivery.find({ driverId, status: 'DELIVERED' })
        .populate('donationId')
        .sort({ deliveryTime: -1 })
        .limit(5)
    ]);

    const openRequestsCount = await Donation.countDocuments({
      status: DONATION_STATUS.MATCHED
    });

    res.json({
      success: true,
      profile,
      activeDelivery,
      completedDeliveries,
      openRequestsCount
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Public Community Stats for Landing Page (Unauthenticated)
 */
const getPublicStats = async (req, res, next) => {
  try {
    const [
      totalDonations,
      completedDeliveries,
      totalNGOs,
      allDeliveredDonations
    ] = await Promise.all([
      Donation.countDocuments(),
      Donation.countDocuments({ status: DONATION_STATUS.DELIVERED }),
      User.countDocuments({ role: ROLES.NGO }),
      Donation.find({ status: DONATION_STATUS.DELIVERED }).select('quantity unit')
    ]);

    let totalKgRescued = 0;
    let totalMealsRescued = 0;
    allDeliveredDonations.forEach((d) => {
      const impact = calculateImpact(d.quantity, d.unit);
      totalKgRescued += impact.foodRescuedKg;
      totalMealsRescued += impact.mealsRescued;
    });

    res.json({
      success: true,
      stats: {
        totalMealsRescued,
        totalFoodRescuedKg: Math.round(totalKgRescued),
        totalDonations,
        totalNGOs,
        completedDeliveries
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAdminDashboard,
  getDonorDashboard,
  getNgoDashboard,
  getDriverDashboard,
  getPublicStats
};


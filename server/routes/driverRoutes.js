const express = require('express');
const router = express.Router();
const {
  getAvailableDrivers,
  getPickupRequests,
  acceptPickupRequest,
  getActiveDelivery,
  updateAvailability,
  updateDriverLocation
} = require('../controllers/driverController');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

router.get('/available', protect, getAvailableDrivers);
router.get('/requests', protect, authorize(ROLES.DRIVER, ROLES.ADMIN), getPickupRequests);
router.post('/requests/:id/accept', protect, authorize(ROLES.DRIVER, ROLES.ADMIN), acceptPickupRequest);
router.get('/active', protect, authorize(ROLES.DRIVER, ROLES.ADMIN), getActiveDelivery);
router.put('/availability', protect, authorize(ROLES.DRIVER, ROLES.ADMIN), updateAvailability);
router.put('/location', protect, authorize(ROLES.DRIVER, ROLES.ADMIN), updateDriverLocation);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getDonorDashboard,
  getNgoDashboard,
  getDriverDashboard
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

router.get('/admin', protect, authorize(ROLES.ADMIN), getAdminDashboard);
router.get('/donor', protect, authorize(ROLES.DONOR, ROLES.ADMIN), getDonorDashboard);
router.get('/ngo', protect, authorize(ROLES.NGO, ROLES.ADMIN), getNgoDashboard);
router.get('/driver', protect, authorize(ROLES.DRIVER, ROLES.ADMIN), getDriverDashboard);

module.exports = router;

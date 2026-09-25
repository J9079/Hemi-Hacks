const express = require('express');
const router = express.Router();
const {
  createDonation,
  getDonations,
  getDonationById,
  updateDonation,
  deleteDonation,
  cancelDonation
} = require('../controllers/donationController');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

router.post('/', protect, authorize(ROLES.DONOR, ROLES.ADMIN), createDonation);
router.get('/', protect, getDonations);
router.get('/:id', protect, getDonationById);
router.put('/:id', protect, authorize(ROLES.DONOR, ROLES.ADMIN), updateDonation);
router.delete('/:id', protect, authorize(ROLES.DONOR, ROLES.ADMIN), deleteDonation);
router.put('/:id/cancel', protect, cancelDonation);

module.exports = router;

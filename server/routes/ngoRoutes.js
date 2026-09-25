const express = require('express');
const router = express.Router();
const {
  getAllNGOs,
  getNGOById,
  updateCapacity,
  updateNeeds,
  acceptDonation,
  rejectDonation
} = require('../controllers/ngoController');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

router.get('/', protect, getAllNGOs);
router.get('/:id', protect, getNGOById);
router.put('/:id/capacity', protect, authorize(ROLES.NGO, ROLES.ADMIN), updateCapacity);
router.put('/:id/needs', protect, authorize(ROLES.NGO, ROLES.ADMIN), updateNeeds);
router.post('/donations/:donationId/accept', protect, authorize(ROLES.NGO, ROLES.ADMIN), acceptDonation);
router.post('/donations/:donationId/reject', protect, authorize(ROLES.NGO, ROLES.ADMIN), rejectDonation);

module.exports = router;

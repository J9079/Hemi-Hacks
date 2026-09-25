const express = require('express');
const router = express.Router();
const { getDeliveryById, updateDeliveryStatus } = require('../controllers/deliveryController');
const { protect } = require('../middleware/auth');

router.get('/:id', protect, getDeliveryById);
router.put('/:id/status', protect, updateDeliveryStatus);

module.exports = router;

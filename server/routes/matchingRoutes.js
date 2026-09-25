const express = require('express');
const router = express.Router();
const { runMatching, getMatchingBreakdown } = require('../controllers/matchingController');
const { protect } = require('../middleware/auth');

router.post('/:donationId', protect, runMatching);
router.get('/:donationId', protect, getMatchingBreakdown);

module.exports = router;

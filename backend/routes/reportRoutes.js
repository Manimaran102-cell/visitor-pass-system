const express = require('express');
const { getSummary } = require('../controllers/reportController');
const { getAllActivity } = require('../controllers/visitorController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/summary', protect, authorize('admin', 'receptionist'), getSummary);
router.get('/activity', protect, authorize('admin'), getAllActivity);

module.exports = router;

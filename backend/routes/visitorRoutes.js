const express = require('express');
const {
  createVisitRequest,
  getVisitRequests,
  getVisitRequest,
  approveRequest,
  rejectRequest,
  checkInVisitor,
  checkOutVisitor,
  cancelRequest,
  getActivityHistory,
} = require('../controllers/visitorController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getVisitRequests);
router.get('/:id', getVisitRequest);
router.get('/:id/activity', getActivityHistory);

router.post('/', authorize('receptionist', 'admin'), createVisitRequest);

router.patch('/:id/approve', authorize('employee', 'admin'), approveRequest);
router.patch('/:id/reject', authorize('employee', 'admin'), rejectRequest);

router.patch('/:id/checkin', authorize('receptionist', 'admin'), checkInVisitor);
router.patch('/:id/checkout', authorize('receptionist', 'admin'), checkOutVisitor);
router.patch('/:id/cancel', authorize('receptionist', 'admin'), cancelRequest);

module.exports = router;

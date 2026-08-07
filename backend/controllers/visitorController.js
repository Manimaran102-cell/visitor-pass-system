const VisitRequest = require('../models/VisitRequest');
const ActivityLog = require('../models/ActivityLog');
const Employee = require('../models/Employee');
const { startOfDay, endOfDay, isTimeInPast } = require('../utils/dateUtils');

const logActivity = (visitRequestId, action, performedBy, remarks) =>
  ActivityLog.create({ visitRequest: visitRequestId, action, performedBy, remarks });

// ---------------------------------------------------------------------------
// POST /api/visitors  (Receptionist) - Register a new visitor request
// Enforces Rules 1, 2, 3, 4, 5
// ---------------------------------------------------------------------------
const createVisitRequest = async (req, res) => {
  try {
    const {
      visitorName,
      visitorPhone,
      visitorEmail,
      visitorCompany,
      idProofType,
      idProofNumber,
      employeeToVisit,
      purpose,
      visitDate,
      expectedArrivalTime,
    } = req.body;

    if (!visitorName || !visitorPhone || !employeeToVisit || !purpose || !visitDate || !expectedArrivalTime) {
      return res.status(400).json({
        message: 'visitorName, visitorPhone, employeeToVisit, purpose, visitDate, and expectedArrivalTime are required',
      });
    }

    const employee = await Employee.findById(employeeToVisit);
    if (!employee || !employee.isActive) {
      return res.status(404).json({ message: 'Selected employee not found or inactive' });
    }

    const now = new Date();
    const parsedVisitDate = startOfDay(visitDate);
    const today = startOfDay(now);

    // Rule 3: Visit date cannot be earlier than the current date
    if (parsedVisitDate.getTime() < today.getTime()) {
      return res.status(400).json({ message: 'Rule violation: visit date cannot be earlier than the current date' });
    }

    // Rule 4: For today's registrations, expected arrival time cannot be earlier than current time
    if (parsedVisitDate.getTime() === today.getTime() && isTimeInPast(expectedArrivalTime, now)) {
      return res.status(400).json({
        message: "Rule violation: expected arrival time cannot be earlier than the current time for today's registration",
      });
    }

    // Rule 1: A visitor cannot have more than one active visit at the same time
    // "Active" = pending, approved, or checked_in (not yet checked out/rejected/cancelled)
    const activeVisit = await VisitRequest.findOne({
      visitorPhone,
      status: { $in: VisitRequest.ACTIVE_STATUSES },
    });
    if (activeVisit) {
      return res.status(409).json({
        message: 'Rule violation: this visitor already has an active visit in progress',
      });
    }

    // Rule 2: Duplicate visitor registration for the same visitor on the same date not allowed
    const duplicate = await VisitRequest.findOne({
      visitorPhone,
      visitDate: { $gte: startOfDay(visitDate), $lte: endOfDay(visitDate) },
      status: { $ne: 'cancelled' },
    });
    if (duplicate) {
      return res.status(409).json({
        message: 'Rule violation: this visitor is already registered for this date',
      });
    }

    // Rule 5: An employee cannot have more than three pending visitor requests awaiting approval
    const pendingCount = await VisitRequest.countDocuments({ employeeToVisit, status: 'pending' });
    if (pendingCount >= 3) {
      return res.status(409).json({
        message: 'Rule violation: this employee already has 3 pending requests awaiting approval',
      });
    }

    const visitRequest = await VisitRequest.create({
      visitorName,
      visitorPhone,
      visitorEmail,
      visitorCompany,
      idProofType,
      idProofNumber,
      employeeToVisit,
      purpose,
      visitDate: parsedVisitDate,
      expectedArrivalTime,
      createdBy: req.user._id,
    });

    await logActivity(visitRequest._id, 'Created', req.user._id, 'Visitor request registered');

    const populated = await visitRequest.populate('employeeToVisit', 'name department');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create visit request', error: err.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/visitors  - list with search/filter, role-scoped
// ---------------------------------------------------------------------------
const getVisitRequests = async (req, res) => {
  const { visitorName, employeeName, visitDate, status, from, to, excludeCancelled } = req.query;
  const filter = {};

  if (visitorName) filter.visitorName = { $regex: visitorName, $options: 'i' };
  if (status) filter.status = status;
  if (visitDate) {
    filter.visitDate = { $gte: startOfDay(visitDate), $lte: endOfDay(visitDate) };
  } else if (from || to) {
    filter.visitDate = {};
    if (from) filter.visitDate.$gte = startOfDay(from);
    if (to) filter.visitDate.$lte = endOfDay(to);
  }
  // Rule 10: cancelled visits excluded from "active" list views when requested
  if (excludeCancelled === 'true') filter.status = { ...(filter.status ? { $eq: filter.status } : {}), $ne: 'cancelled' };

  // Role scoping: employees only see requests directed at them
  if (req.user.role === 'employee') {
    if (!req.user.employeeProfile) return res.json([]);
    filter.employeeToVisit = req.user.employeeProfile;
  }

  let query = VisitRequest.find(filter)
    .populate('employeeToVisit', 'name department designation')
    .populate('createdBy', 'name')
    .populate('decidedBy', 'name')
    .sort('-createdAt');

  const results = await query;

  const filtered = employeeName
    ? results.filter((r) => r.employeeToVisit?.name?.toLowerCase().includes(employeeName.toLowerCase()))
    : results;

  res.json(filtered);
};

// GET /api/visitors/:id
const getVisitRequest = async (req, res) => {
  const visit = await VisitRequest.findById(req.params.id)
    .populate('employeeToVisit', 'name department designation')
    .populate('createdBy decidedBy checkedInBy checkedOutBy cancelledBy', 'name role');
  if (!visit) return res.status(404).json({ message: 'Visit request not found' });
  res.json(visit);
};

// ---------------------------------------------------------------------------
// PATCH /api/visitors/:id/approve  (Employee)
// ---------------------------------------------------------------------------
const approveRequest = async (req, res) => {
  const visit = await VisitRequest.findById(req.params.id);
  if (!visit) return res.status(404).json({ message: 'Visit request not found' });

  if (req.user.role === 'employee' && String(visit.employeeToVisit) !== String(req.user.employeeProfile)) {
    return res.status(403).json({ message: 'You can only act on requests addressed to you' });
  }
  if (visit.status !== 'pending') {
    return res.status(409).json({ message: `Cannot approve a request with status "${visit.status}"` });
  }

  visit.status = 'approved';
  visit.decidedBy = req.user._id;
  if (req.body.remarks) visit.remarks = req.body.remarks;
  await visit.save();
  await logActivity(visit._id, 'Approved', req.user._id, req.body.remarks);

  res.json(visit);
};

// ---------------------------------------------------------------------------
// PATCH /api/visitors/:id/reject  (Employee)
// ---------------------------------------------------------------------------
const rejectRequest = async (req, res) => {
  const visit = await VisitRequest.findById(req.params.id);
  if (!visit) return res.status(404).json({ message: 'Visit request not found' });

  if (req.user.role === 'employee' && String(visit.employeeToVisit) !== String(req.user.employeeProfile)) {
    return res.status(403).json({ message: 'You can only act on requests addressed to you' });
  }
  if (visit.status !== 'pending') {
    return res.status(409).json({ message: `Cannot reject a request with status "${visit.status}"` });
  }

  visit.status = 'rejected';
  visit.decidedBy = req.user._id;
  if (req.body.remarks) visit.remarks = req.body.remarks;
  await visit.save();
  await logActivity(visit._id, 'Rejected', req.user._id, req.body.remarks);

  res.json(visit);
};

// ---------------------------------------------------------------------------
// PATCH /api/visitors/:id/checkin  (Receptionist)
// Enforces Rules 6, 7, 9
// ---------------------------------------------------------------------------
const checkInVisitor = async (req, res) => {
  const visit = await VisitRequest.findById(req.params.id);
  if (!visit) return res.status(404).json({ message: 'Visit request not found' });

  // Rule 9: Rejected visitor requests cannot be checked in
  if (visit.status === 'rejected') {
    return res.status(409).json({ message: 'Rule violation: rejected requests cannot be checked in' });
  }
  // Rule 7: A visitor who is already checked in cannot be checked in again until checked out
  if (visit.status === 'checked_in') {
    return res.status(409).json({ message: 'Rule violation: visitor is already checked in' });
  }
  // Rule 6: Visitors can only be checked in after approval
  if (visit.status !== 'approved') {
    return res.status(409).json({ message: 'Rule violation: visitor must be approved before check-in' });
  }

  visit.status = 'checked_in';
  visit.checkInTime = new Date();
  visit.checkedInBy = req.user._id;
  await visit.save();
  await logActivity(visit._id, 'Checked In', req.user._id);

  res.json(visit);
};

// ---------------------------------------------------------------------------
// PATCH /api/visitors/:id/checkout  (Receptionist)
// Enforces Rule 8
// ---------------------------------------------------------------------------
const checkOutVisitor = async (req, res) => {
  const visit = await VisitRequest.findById(req.params.id);
  if (!visit) return res.status(404).json({ message: 'Visit request not found' });

  if (visit.status !== 'checked_in') {
    return res.status(409).json({ message: 'Rule violation: only checked-in visitors can be checked out' });
  }

  const checkOutTime = new Date();
  // Rule 8: Check-out time must always be later than check-in time
  if (checkOutTime.getTime() <= visit.checkInTime.getTime()) {
    return res.status(409).json({ message: 'Rule violation: check-out time must be later than check-in time' });
  }

  visit.status = 'checked_out';
  visit.checkOutTime = checkOutTime;
  visit.checkedOutBy = req.user._id;
  await visit.save();
  await logActivity(visit._id, 'Checked Out', req.user._id);

  res.json(visit);
};

// ---------------------------------------------------------------------------
// PATCH /api/visitors/:id/cancel  (Receptionist/Admin)
// ---------------------------------------------------------------------------
const cancelRequest = async (req, res) => {
  const visit = await VisitRequest.findById(req.params.id);
  if (!visit) return res.status(404).json({ message: 'Visit request not found' });

  if (['checked_out', 'cancelled'].includes(visit.status)) {
    return res.status(409).json({ message: `Cannot cancel a request with status "${visit.status}"` });
  }

  visit.status = 'cancelled';
  visit.cancelledBy = req.user._id;
  if (req.body.remarks) visit.remarks = req.body.remarks;
  await visit.save();
  await logActivity(visit._id, 'Cancelled', req.user._id, req.body.remarks);

  res.json(visit);
};

// GET /api/visitors/:id/activity
const getActivityHistory = async (req, res) => {
  const history = await ActivityLog.find({ visitRequest: req.params.id })
    .populate('performedBy', 'name role')
    .sort('-createdAt');
  res.json(history);
};

// GET /api/activity - global activity feed (Admin)
const getAllActivity = async (req, res) => {
  const { from, to, action } = req.query;
  const filter = {};
  if (action) filter.action = action;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = startOfDay(from);
    if (to) filter.createdAt.$lte = endOfDay(to);
  }
  const history = await ActivityLog.find(filter)
    .populate('performedBy', 'name role')
    .populate({ path: 'visitRequest', select: 'visitorName employeeToVisit', populate: { path: 'employeeToVisit', select: 'name' } })
    .sort('-createdAt')
    .limit(500);
  res.json(history);
};

module.exports = {
  createVisitRequest,
  getVisitRequests,
  getVisitRequest,
  approveRequest,
  rejectRequest,
  checkInVisitor,
  checkOutVisitor,
  cancelRequest,
  getActivityHistory,
  getAllActivity,
};

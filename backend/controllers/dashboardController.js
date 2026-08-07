const VisitRequest = require('../models/VisitRequest');
const Employee = require('../models/Employee');
const User = require('../models/User');
const { startOfDay, endOfDay } = require('../utils/dateUtils');

// GET /api/dashboard
const getDashboard = async (req, res) => {
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);

  if (req.user.role === 'admin') {
    const [totalEmployees, totalActiveUsers, todaysVisitors, currentlyInside, pendingRequests, totalVisitorsAllTime] =
      await Promise.all([
        Employee.countDocuments({ isActive: true }),
        User.countDocuments({ isActive: true }),
        VisitRequest.countDocuments({ visitDate: { $gte: todayStart, $lte: todayEnd }, status: { $ne: 'cancelled' } }),
        VisitRequest.countDocuments({ status: 'checked_in' }),
        VisitRequest.countDocuments({ status: 'pending' }),
        VisitRequest.countDocuments({}),
      ]);
    return res.json({
      role: 'admin',
      totalEmployees,
      totalActiveUsers,
      todaysVisitors,
      currentlyInside,
      pendingRequests,
      totalVisitorsAllTime,
    });
  }

  if (req.user.role === 'receptionist') {
    const [todaysVisitors, currentlyInside, pendingApproval, checkedOutToday, scheduledUpcoming] = await Promise.all([
      VisitRequest.countDocuments({ visitDate: { $gte: todayStart, $lte: todayEnd }, status: { $ne: 'cancelled' } }),
      VisitRequest.countDocuments({ status: 'checked_in' }),
      VisitRequest.countDocuments({ status: 'pending' }),
      VisitRequest.countDocuments({ status: 'checked_out', checkOutTime: { $gte: todayStart, $lte: todayEnd } }),
      VisitRequest.countDocuments({ visitDate: { $gt: todayEnd }, status: { $in: ['pending', 'approved'] } }),
    ]);
    return res.json({
      role: 'receptionist',
      todaysVisitors,
      currentlyInside,
      pendingApproval,
      checkedOutToday,
      scheduledUpcoming,
    });
  }

  if (req.user.role === 'employee') {
    if (!req.user.employeeProfile) {
      return res.json({ role: 'employee', pendingRequests: 0, approvedToday: 0, scheduledVisitors: 0, totalVisitsHosted: 0 });
    }
    const employeeToVisit = req.user.employeeProfile;
    const [pendingRequests, approvedToday, scheduledVisitors, totalVisitsHosted] = await Promise.all([
      VisitRequest.countDocuments({ employeeToVisit, status: 'pending' }),
      VisitRequest.countDocuments({
        employeeToVisit,
        status: { $in: ['approved', 'checked_in', 'checked_out'] },
        updatedAt: { $gte: todayStart, $lte: todayEnd },
      }),
      VisitRequest.countDocuments({ employeeToVisit, visitDate: { $gte: todayStart }, status: { $in: ['pending', 'approved'] } }),
      VisitRequest.countDocuments({ employeeToVisit, status: { $ne: 'cancelled' } }),
    ]);
    return res.json({ role: 'employee', pendingRequests, approvedToday, scheduledVisitors, totalVisitsHosted });
  }

  res.status(400).json({ message: 'Unknown role' });
};

module.exports = { getDashboard };

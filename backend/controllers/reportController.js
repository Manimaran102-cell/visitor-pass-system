const VisitRequest = require('../models/VisitRequest');
const { startOfDay, endOfDay } = require('../utils/dateUtils');

// GET /api/reports/summary?range=today|week|custom&from=&to=
const getSummary = async (req, res) => {
  const { range = 'today', from, to } = req.query;
  const now = new Date();
  let rangeStart, rangeEnd;

  if (range === 'today') {
    rangeStart = startOfDay(now);
    rangeEnd = endOfDay(now);
  } else if (range === 'week') {
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((day + 6) % 7));
    rangeStart = startOfDay(monday);
    rangeEnd = endOfDay(now);
  } else {
    if (!from || !to) return res.status(400).json({ message: 'from and to are required for a custom range' });
    rangeStart = startOfDay(from);
    rangeEnd = endOfDay(to);
  }

  const filter = { visitDate: { $gte: rangeStart, $lte: rangeEnd } };

  const [total, byStatus, byDepartmentRaw] = await Promise.all([
    VisitRequest.countDocuments(filter),
    VisitRequest.aggregate([{ $match: filter }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    VisitRequest.aggregate([
      { $match: filter },
      { $lookup: { from: 'employees', localField: 'employeeToVisit', foreignField: '_id', as: 'employee' } },
      { $unwind: '$employee' },
      { $group: { _id: '$employee.department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  const statusBreakdown = byStatus.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {});

  res.json({
    range,
    from: rangeStart,
    to: rangeEnd,
    totalVisits: total,
    statusBreakdown,
    byDepartment: byDepartmentRaw.map((d) => ({ department: d._id, count: d.count })),
  });
};

module.exports = { getSummary };

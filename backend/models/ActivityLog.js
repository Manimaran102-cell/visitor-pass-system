const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    visitRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'VisitRequest', required: true },
    action: {
      type: String,
      enum: ['Created', 'Approved', 'Rejected', 'Checked In', 'Checked Out', 'Cancelled'],
      required: true,
    },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    remarks: { type: String, trim: true },
  },
  { timestamps: true } // createdAt serves as the "Date & Time" of the action
);

activityLogSchema.index({ visitRequest: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);

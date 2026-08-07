const mongoose = require('mongoose');

const visitRequestSchema = new mongoose.Schema(
  {
    // Visitor details
    visitorName: { type: String, required: true, trim: true },
    visitorPhone: { type: String, required: true, trim: true },
    visitorEmail: { type: String, trim: true, lowercase: true },
    visitorCompany: { type: String, trim: true },
    idProofType: { type: String, trim: true },
    idProofNumber: { type: String, trim: true },

    // Visit details
    employeeToVisit: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    purpose: { type: String, required: true, trim: true },
    visitDate: { type: Date, required: true }, // date-only (midnight)
    expectedArrivalTime: { type: String, required: true }, // "HH:mm" 24hr

    // Workflow status
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'checked_in', 'checked_out', 'cancelled'],
      default: 'pending',
    },

    remarks: { type: String, trim: true }, // employee remarks on approve/reject
    checkInTime: { type: Date },
    checkOutTime: { type: Date },

    // Audit
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // receptionist
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // employee who approved/rejected
    checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    checkedOutBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Helpful indexes for search/filter and duplicate checks
visitRequestSchema.index({ visitorPhone: 1, visitDate: 1 });
visitRequestSchema.index({ status: 1 });
visitRequestSchema.index({ employeeToVisit: 1, status: 1 });
visitRequestSchema.index({ visitDate: 1 });

// "Active" statuses = still occupying a visitor slot (Rule 1 & 10)
visitRequestSchema.statics.ACTIVE_STATUSES = ['pending', 'approved', 'checked_in'];

module.exports = mongoose.model('VisitRequest', visitRequestSchema);

const mongoose = require('mongoose');

const LeaveSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['Sick', 'Casual', 'Annual', 'Unpaid'],
      required: [true, 'Leave type is required'],
    },
    fromDate: {
      type: Date,
      required: [true, 'From date is required'],
    },
    toDate: {
      type: Date,
      required: [true, 'To date is required'],
    },
    reason: {
      type: String,
      required: [true, 'Reason for leave is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Leave', LeaveSchema);

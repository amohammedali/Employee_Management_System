const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    date: {
      type: String, // Stored as 'YYYY-MM-DD'
      required: true,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for unique attendance per employee per day
AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);

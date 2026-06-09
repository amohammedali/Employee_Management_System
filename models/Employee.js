const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Employee name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    dob: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department assignment is required'],
    },
    role: {
      type: String,
      required: [true, 'Corporate role/designation is required'],
      trim: true,
    },
    salary: {
      type: Number,
      required: [true, 'Salary is required'],
      min: [0, 'Salary cannot be negative'],
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'On Leave'],
      default: 'Active',
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Employee', EmployeeSchema);

const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// Helper to get local date string YYYY-MM-DD
const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    Self mark daily attendance
// @route   POST /api/attendance/mark
// @access  Private (Employee only)
const markAttendance = async (req, res) => {
  try {
    if (req.user.role !== 'employee' || !req.user.employeeId) {
      return res.status(400).json({ success: false, message: 'Only registered employees can check in' });
    }

    const employeeId = req.user.employeeId._id;
    const todayStr = getLocalDateString();

    // Check if already checked in today
    const existingRecord = await Attendance.findOne({ employeeId, date: todayStr });
    if (existingRecord) {
      return res.status(400).json({
        success: false,
        message: `You have already checked in today (${todayStr}) as ${existingRecord.status}`,
      });
    }

    // Determine status (Late if after 9:30 AM local time)
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // 9:30 AM threshold
    let status = 'Present';
    if (hours > 9 || (hours === 9 && minutes > 30)) {
      status = 'Late';
    }

    const attendance = await Attendance.create({
      employeeId,
      date: todayStr,
      status,
    });

    res.status(201).json({
      success: true,
      message: `Checked in successfully as ${status}`,
      data: attendance,
    });
  } catch (error) {
    console.error('markAttendance error:', error);
    res.status(500).json({ success: false, message: 'Server error marking attendance' });
  }
};

// @desc    Admin manually record or overwrite attendance
// @route   POST /api/attendance/admin/mark
// @access  Private (Admin only)
const adminMarkAttendance = async (req, res) => {
  try {
    const { employeeId, date, status } = req.body;

    if (!employeeId || !date || !status) {
      return res.status(400).json({ success: false, message: 'Please provide employeeId, date (YYYY-MM-DD), and status' });
    }

    // Verify employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(400).json({ success: false, message: 'Employee not found' });
    }

    // Find and update, or create if doesn't exist
    const attendance = await Attendance.findOneAndUpdate(
      { employeeId, date },
      { status },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Attendance record saved successfully',
      data: attendance,
    });
  } catch (error) {
    console.error('adminMarkAttendance error:', error);
    res.status(500).json({ success: false, message: 'Server error recording attendance' });
  }
};

// @desc    Get attendance history
// @route   GET /api/attendance
// @access  Private
const getAttendanceHistory = async (req, res) => {
  try {
    // If admin: return all logs (can filter by date and search)
    if (req.user.role === 'admin') {
      const { date, search } = req.query;
      let matchQuery = {};

      if (date) {
        matchQuery.date = date;
      }

      let employeeIds = [];
      if (search) {
        const matchingEmployees = await Employee.find({
          name: { $regex: search, $options: 'i' },
        }).select('_id');
        employeeIds = matchingEmployees.map((e) => e._id);
        matchQuery.employeeId = { $in: employeeIds };
      }

      const logs = await Attendance.find(matchQuery)
        .populate({
          path: 'employeeId',
          select: 'name email role department',
          populate: { path: 'department', select: 'name' },
        })
        .sort({ date: -1, createdAt: -1 });

      return res.status(200).json({ success: true, count: logs.length, data: logs });
    }

    // If standard employee: return their own logs
    const logs = await Attendance.find({ employeeId: req.user.employeeId._id })
      .populate({
        path: 'employeeId',
        select: 'name department',
        populate: { path: 'department', select: 'name' },
      })
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    console.error('getAttendanceHistory error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching attendance logs' });
  }
};

module.exports = {
  markAttendance,
  adminMarkAttendance,
  getAttendanceHistory,
};

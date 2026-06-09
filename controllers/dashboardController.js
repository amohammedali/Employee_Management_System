const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');

// Helper to get local date string YYYY-MM-DD
const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getStats = async (req, res) => {
  try {
    const todayStr = getLocalDateString();

    // 1. ADMIN DASHBOARD STATS
    if (req.user.role === 'admin') {
      // General Counts
      const totalEmployees = await Employee.countDocuments({ status: { $ne: 'Inactive' } });
      const activeEmployees = await Employee.countDocuments({ status: 'Active' });
      const onLeaveEmployees = await Employee.countDocuments({ status: 'On Leave' });
      const totalDepartments = await Department.countDocuments();

      // Department breakdown (Headcount per department for Chart.js)
      const depts = await Department.find();
      const departmentBreakdown = await Promise.all(
        depts.map(async (d) => {
          const count = await Employee.countDocuments({ department: d._id, status: { $ne: 'Inactive' } });
          return {
            name: d.name,
            count,
          };
        })
      );

      // Attendance Summary for Today
      const presentCount = await Attendance.countDocuments({ date: todayStr, status: 'Present' });
      const lateCount = await Attendance.countDocuments({ date: todayStr, status: 'Late' });
      const totalCheckedIn = presentCount + lateCount;
      const absentCount = Math.max(0, activeEmployees - totalCheckedIn);

      // Leave Summary
      const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
      const approvedLeaves = await Leave.countDocuments({ status: 'Approved' });

      // Recent Activity Log (Combine latest employees, leaves and check-ins)
      const latestEmployees = await Employee.find()
        .populate('department', 'name')
        .sort({ createdAt: -1 })
        .limit(3);
      
      const latestLeaves = await Leave.find()
        .populate('employeeId', 'name')
        .sort({ createdAt: -1 })
        .limit(3);

      const latestAttendance = await Attendance.find({ date: todayStr })
        .populate('employeeId', 'name')
        .sort({ createdAt: -1 })
        .limit(3);

      // Formulate unified activity logs
      const activities = [];

      latestEmployees.forEach((emp) => {
        activities.push({
          type: 'employee',
          message: `New employee ${emp.name} joined as ${emp.role}`,
          time: emp.createdAt,
        });
      });

      latestLeaves.forEach((lv) => {
        activities.push({
          type: 'leave',
          message: `${lv.employeeId ? lv.employeeId.name : 'Employee'} requested ${lv.type} leave (${lv.status})`,
          time: lv.createdAt,
        });
      });

      latestAttendance.forEach((att) => {
        activities.push({
          type: 'attendance',
          message: `${att.employeeId ? att.employeeId.name : 'Employee'} checked in today: ${att.status}`,
          time: att.createdAt,
        });
      });

      // Sort activities by time descending
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));

      return res.status(200).json({
        success: true,
        role: 'admin',
        stats: {
          totalEmployees,
          activeEmployees,
          onLeaveEmployees,
          totalDepartments,
          attendance: {
            present: presentCount,
            late: lateCount,
            absent: absentCount,
            rate: totalEmployees > 0 ? Math.round((totalCheckedIn / totalEmployees) * 100) : 0,
          },
          leaves: {
            pending: pendingLeaves,
            approved: approvedLeaves,
          },
          departmentBreakdown,
          activities: activities.slice(0, 5),
        },
      });
    }

    // 2. EMPLOYEE DASHBOARD STATS
    if (req.user.role === 'employee' && req.user.employeeId) {
      const employeeId = req.user.employeeId._id;

      // Personal profile + Department
      const profile = await Employee.findById(employeeId).populate('department');

      // Today's attendance status
      const todayAttendance = await Attendance.findOne({ employeeId, date: todayStr });

      // Leave Stats
      const personalPendingLeaves = await Leave.countDocuments({ employeeId, status: 'Pending' });
      const personalApprovedLeaves = await Leave.countDocuments({ employeeId, status: 'Approved' });

      // Personal Attendance Rate (percentage of check-ins)
      const totalCheckIns = await Attendance.countDocuments({ employeeId });
      const totalPresent = await Attendance.countDocuments({ employeeId, status: 'Present' });
      const totalLate = await Attendance.countDocuments({ employeeId, status: 'Late' });

      // Coworkers
      let coworkers = [];
      if (profile.department) {
        coworkers = await Employee.find({
          department: profile.department._id,
          _id: { $ne: employeeId },
          status: 'Active',
        })
          .select('name role email')
          .limit(5);
      }

      // Personal Activities
      const personalLeaves = await Leave.find({ employeeId }).sort({ createdAt: -1 }).limit(3);
      const personalCheckins = await Attendance.find({ employeeId }).sort({ createdAt: -1 }).limit(3);

      const activities = [];

      personalLeaves.forEach((lv) => {
        activities.push({
          type: 'leave',
          message: `Your ${lv.type} leave request from ${lv.fromDate.toISOString().split('T')[0]} is ${lv.status}`,
          time: lv.createdAt,
        });
      });

      personalCheckins.forEach((att) => {
        activities.push({
          type: 'attendance',
          message: `You marked attendance on ${att.date}: ${att.status}`,
          time: att.createdAt,
        });
      });

      activities.sort((a, b) => new Date(b.time) - new Date(a.time));

      return res.status(200).json({
        success: true,
        role: 'employee',
        stats: {
          profile,
          attendance: {
            today: todayAttendance ? todayAttendance.status : 'Not Checked In',
            time: todayAttendance ? todayAttendance.createdAt : null,
            totalCheckIns,
            totalPresent,
            totalLate,
          },
          leaves: {
            pending: personalPendingLeaves,
            approved: personalApprovedLeaves,
          },
          coworkers,
          activities: activities.slice(0, 5),
        },
      });
    }

    res.status(400).json({ success: false, message: 'Invalid stats request' });
  } catch (error) {
    console.error('getStats error:', error);
    res.status(500).json({ success: false, message: 'Server error loading dashboard statistics' });
  }
};

module.exports = {
  getStats,
};

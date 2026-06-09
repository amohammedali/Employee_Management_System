const Leave = require('../models/Leave');
const Employee = require('../models/Employee');

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private (Employee only)
const applyLeave = async (req, res) => {
  try {
    if (req.user.role !== 'employee' || !req.user.employeeId) {
      return res.status(400).json({ success: false, message: 'Only registered employees can apply for leaves' });
    }

    const { type, fromDate, toDate, reason } = req.body;
    const employeeId = req.user.employeeId._id;

    if (!type || !fromDate || !toDate || !reason) {
      return res.status(400).json({ success: false, message: 'Please specify leave type, fromDate, toDate, and reason' });
    }

    const start = new Date(fromDate);
    const end = new Date(toDate);

    if (start > end) {
      return res.status(400).json({ success: false, message: 'From date cannot be after to date' });
    }

    // Check for overlapping leaves
    const overlap = await Leave.findOne({
      employeeId,
      status: { $in: ['Pending', 'Approved'] },
      $or: [
        { fromDate: { $lte: end }, toDate: { $gte: start } },
      ],
    });

    if (overlap) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active leave request (Pending or Approved) overlapping this period',
      });
    }

    const leave = await Leave.create({
      employeeId,
      type,
      fromDate: start,
      toDate: end,
      reason,
    });

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      data: leave,
    });
  } catch (error) {
    console.error('applyLeave error:', error);
    res.status(500).json({ success: false, message: 'Server error applying for leave' });
  }
};

// @desc    Get all leave requests
// @route   GET /api/leaves
// @access  Private
const getLeaves = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    // Filter by status if specified
    if (status && status !== 'all') {
      query.status = status;
    }

    // If Admin: Return all leave requests
    if (req.user.role === 'admin') {
      const leaves = await Leave.find(query)
        .populate({
          path: 'employeeId',
          select: 'name email role department',
          populate: { path: 'department', select: 'name' },
        })
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: leaves.length,
        data: leaves,
      });
    }

    // If Employee: Return their own leaves
    query.employeeId = req.user.employeeId._id;
    const leaves = await Leave.find(query)
      .populate('employeeId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    console.error('getLeaves error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching leaves list' });
  }
};

// @desc    Approve or reject leave request
// @route   PUT /api/leaves/:id/status
// @access  Private (Admin only)
const updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Please provide valid status (Approved or Rejected)' });
    }

    let leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({ success: false, message: `Leave request has already been ${leave.status.toLowerCase()}` });
    }

    leave.status = status;
    await leave.save();

    // If approved, dynamically update Employee status to 'On Leave' if the leave interval includes today
    if (status === 'Approved') {
      const today = new Date();
      today.setHours(0,0,0,0);
      const from = new Date(leave.fromDate);
      from.setHours(0,0,0,0);
      const to = new Date(leave.toDate);
      to.setHours(0,0,0,0);

      if (today >= from && today <= to) {
        await Employee.findByIdAndUpdate(leave.employeeId, { status: 'On Leave' });
      }
    }

    res.status(200).json({
      success: true,
      message: `Leave request status updated to ${status}`,
      data: leave,
    });
  } catch (error) {
    console.error('updateLeaveStatus error:', error);
    res.status(500).json({ success: false, message: 'Server error updating leave request' });
  }
};

module.exports = {
  applyLeave,
  getLeaves,
  updateLeaveStatus,
};

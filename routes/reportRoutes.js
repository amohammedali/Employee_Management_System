const express = require('express');
const router = express.Router();
const { getPayrollReport, getAttendanceReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Protect all report routes and restrict to admin
router.use(protect);
router.use(authorize('admin'));

router.route('/payroll').get(getPayrollReport);
router.route('/attendance').get(getAttendanceReport);

module.exports = router;

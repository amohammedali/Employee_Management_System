const express = require('express');
const router = express.Router();
const {
  markAttendance,
  adminMarkAttendance,
  getAttendanceHistory,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAttendanceHistory);
router.post('/mark', markAttendance);
router.post('/admin/mark', authorize('admin'), adminMarkAttendance);

module.exports = router;

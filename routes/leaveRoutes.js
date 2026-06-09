const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getLeaves,
  updateLeaveStatus,
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getLeaves)
  .post(applyLeave);

router.route('/:id/status')
  .put(authorize('admin'), updateLeaveStatus);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All employee routes are protected
router.use(protect);

// CRUD routes
router.route('/')
  .get(authorize('admin'), getEmployees)
  .post(authorize('admin'), createEmployee);

router.route('/:id')
  .get(getEmployeeById) // Internal protection inside controller verifies if employee owns the id or is admin
  .put(authorize('admin'), updateEmployee)
  .delete(authorize('admin'), deleteEmployee);

module.exports = router;

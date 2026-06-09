const Employee = require('../models/Employee');
const User = require('../models/User');
const Department = require('../models/Department');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private (Admin only)
const getEmployees = async (req, res) => {
  try {
    const { department, status, search } = req.query;
    let query = {};

    // Filter by department
    if (department && department !== 'all') {
      query.department = department;
    }

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Search by name, email, or role
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
      ];
    }

    const employees = await Employee.find(query)
      .populate('department', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    console.error('getEmployees error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching employees list' });
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('department');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Security check: Employee can only see their own profile, Admins can see any profile
    if (req.user.role === 'employee' && req.user.employeeId.toString() !== employee._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this profile' });
    }

    const user = await User.findOne({ employeeId: employee._id });
    const empData = employee.toObject();
    empData.username = user ? user.username : null;

    res.status(200).json({
      success: true,
      data: empData,
    });
  } catch (error) {
    console.error('getEmployeeById error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching employee profile' });
  }
};

// @desc    Create new employee & generate system user account
// @route   POST /api/employees
// @access  Private (Admin only)
  const createEmployee = async (req, res) => {
  try {
    const { name, email, phone, dob, department, role, salary, status, joinDate, loginUsername, loginPassword } = req.body;

    if (!loginUsername || !loginPassword) {
      return res.status(400).json({ success: false, message: 'Login username and password must be provided manually' });
    }

    // Check if email already exists
    const employeeExists = await Employee.findOne({ email: email.toLowerCase().trim() });
    if (employeeExists) {
      return res.status(400).json({ success: false, message: 'Employee with this email already exists' });
    }

    // Check if username is already taken
    const usernameTaken = await User.findOne({ username: loginUsername.toLowerCase().trim() });
    if (usernameTaken) {
      return res.status(400).json({ success: false, message: 'Login username is already taken' });
    }

    // Verify department exists
    const dept = await Department.findById(department);
    if (!dept) {
      return res.status(400).json({ success: false, message: 'Assigned department does not exist' });
    }

    // Create Employee record
    const employee = await Employee.create({
      name,
      email: email.toLowerCase().trim(),
      phone,
      dob,
      department,
      role,
      salary,
      status: status || 'Active',
      joinDate: joinDate || Date.now(),
    });

    const user = await User.create({
      username: loginUsername.toLowerCase().trim(),
      password: loginPassword,
      role: 'employee',
      employeeId: employee._id,
    });

    res.status(201).json({
      success: true,
      data: employee,
      createdAccount: {
        username: user.username,
      },
    });
  } catch (error) {
    console.error('createEmployee error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error creating employee' });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (Admin only)
const updateEmployee = async (req, res) => {
  try {
    const { name, email, phone, dob, department, role, salary, status, joinDate } = req.body;

    let employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Verify department if updated
    if (department) {
      const dept = await Department.findById(department);
      if (!dept) {
        return res.status(400).json({ success: false, message: 'Assigned department does not exist' });
      }
    }

    // Update Employee record
    employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, dob, department, role, salary, status, joinDate },
      { new: true, runValidators: true }
    ).populate('department', 'name');

    // Sync status with User schema if user becomes Inactive (optional feature)
    if (status === 'Inactive') {
      // Could suspend user account here if desired
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error('updateEmployee error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error updating employee' });
  }
};

// @desc    Delete employee & corresponding user credentials
// @route   DELETE /api/employees/:id
// @access  Private (Admin only)
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Remove user account first
    await User.findOneAndDelete({ employeeId: employee._id });

    // Handle department reference if they were a manager
    await Department.updateMany(
      { manager: employee._id },
      { $set: { manager: null } }
    );

    // Delete the Employee document itself
    await Employee.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Employee and associated system user account deleted successfully',
    });
  } catch (error) {
    console.error('deleteEmployee error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting employee' });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};

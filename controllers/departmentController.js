const Department = require('../models/Department');
const Employee = require('../models/Employee');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().populate('manager', 'name email role');

    // Attach employee counts per department dynamically
    const data = await Promise.all(
      departments.map(async (dept) => {
        const headcount = await Employee.countDocuments({ department: dept._id });
        return {
          ...dept.toObject(),
          headcount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error('getDepartments error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching departments' });
  }
};

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Private
const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id).populate('manager', 'name email');

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const headcount = await Employee.countDocuments({ department: department._id });

    res.status(200).json({
      success: true,
      data: {
        ...department.toObject(),
        headcount,
      },
    });
  } catch (error) {
    console.error('getDepartmentById error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching department details' });
  }
};

// @desc    Create new department
// @route   POST /api/departments
// @access  Private (Admin only)
const createDepartment = async (req, res) => {
  try {
    const { name, manager, description } = req.body;

    // Check if name exists
    const deptExists = await Department.findOne({ name: name.trim() });
    if (deptExists) {
      return res.status(400).json({ success: false, message: 'Department name already exists' });
    }

    // Verify manager exists if specified
    if (manager) {
      const emp = await Employee.findById(manager);
      if (!emp) {
        return res.status(400).json({ success: false, message: 'Specified manager employee not found' });
      }
    }

    const department = await Department.create({
      name: name.trim(),
      manager: manager || null,
      description,
    });

    res.status(201).json({
      success: true,
      data: department,
    });
  } catch (error) {
    console.error('createDepartment error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error creating department' });
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (Admin only)
const updateDepartment = async (req, res) => {
  try {
    const { name, manager, description } = req.body;

    let department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    // Verify manager exists if updated
    if (manager) {
      const emp = await Employee.findById(manager);
      if (!emp) {
        return res.status(400).json({ success: false, message: 'Specified manager employee not found' });
      }
    }

    // Update
    department = await Department.findByIdAndUpdate(
      req.params.id,
      { name: name ? name.trim() : department.name, manager: manager || null, description },
      { new: true, runValidators: true }
    ).populate('manager', 'name email');

    res.status(200).json({
      success: true,
      data: department,
    });
  } catch (error) {
    console.error('updateDepartment error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error updating department' });
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private (Admin only)
const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    // Check if there are active employees assigned to this department
    const employeeCount = await Employee.countDocuments({ department: department._id });
    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department. There are ${employeeCount} employees currently assigned to it. Please reassign them first.`,
      });
    }

    await Department.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully',
    });
  } catch (error) {
    console.error('deleteDepartment error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting department' });
  }
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};

const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');

// @desc    Generate Payroll Report (CSV)
// @route   GET /api/reports/payroll
// @access  Private/Admin
const getPayrollReport = async (req, res) => {
  try {
    const employees = await Employee.find({ status: 'Active' }).populate('department', 'name');
    
    // CSV Header
    let csvData = 'Employee ID,Name,Email,Department,Role,Join Date,Annual Salary,Monthly Base Salary\n';
    
    employees.forEach(emp => {
      const deptName = emp.department ? emp.department.name : 'N/A';
      const annualSalary = emp.salary || 0;
      const monthlySalary = (annualSalary / 12).toFixed(2);
      const joinDate = new Date(emp.joinDate).toLocaleDateString();
      
      // Escape fields with quotes to handle commas
      csvData += `"${emp._id}","${emp.name}","${emp.email}","${deptName}","${emp.role}","${joinDate}","${annualSalary}","${monthlySalary}"\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('payroll_report.csv');
    return res.status(200).send(csvData);
  } catch (error) {
    console.error('Error generating payroll report:', error);
    res.status(500).json({ success: false, message: 'Server error generating payroll report' });
  }
};

// @desc    Generate Attendance Summary Report (CSV)
// @route   GET /api/reports/attendance?month=YYYY-MM
// @access  Private/Admin
const getAttendanceReport = async (req, res) => {
  try {
    const { month } = req.query; // Expected format: "2026-05"
    if (!month) {
      return res.status(400).json({ success: false, message: 'Month parameter (YYYY-MM) is required' });
    }

    const query = { date: { $regex: `^${month}` } };
    
    const records = await Attendance.find(query).populate({
      path: 'employeeId',
      select: 'name department',
      populate: { path: 'department', select: 'name' }
    }).sort({ date: 1 });

    // CSV Header
    let csvData = 'Date,Employee ID,Name,Department,Status\n';

    records.forEach(record => {
      const emp = record.employeeId;
      if (emp) {
        const deptName = emp.department ? emp.department.name : 'N/A';
        csvData += `"${record.date}","${emp._id}","${emp.name}","${deptName}","${record.status}"\n`;
      }
    });

    res.header('Content-Type', 'text/csv');
    res.attachment(`attendance_report_${month}.csv`);
    return res.status(200).send(csvData);
  } catch (error) {
    console.error('Error generating attendance report:', error);
    res.status(500).json({ success: false, message: 'Server error generating attendance report' });
  }
};

module.exports = {
  getPayrollReport,
  getAttendanceReport
};

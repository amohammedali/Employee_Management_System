require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Import Schemas for Seeding
const User = require('./models/User');
const Employee = require('./models/Employee');
const Department = require('./models/Department');
const Attendance = require('./models/Attendance');
const Leave = require('./models/Leave');

// Connect to Database
connectDB();

const app = express();

// Standard Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

// Serve Static Frontend Assets
app.use(express.static(path.join(__dirname, 'public')));

// Mount API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// SPA Fallback: Any direct URL navigation that doesn't match an API route
// gets redirected to serve the core index.html (hash router will handle it)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Helper functions for random generation
const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'William', 'Elizabeth', 'David', 'Jessica', 'Richard', 'Emily', 'Joseph', 'Amanda', 'Charles', 'Ashley', 'Thomas', 'Melissa', 'Christopher', 'Deborah', 'Daniel', 'Stephanie'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
const rolesList = ['Software Engineer', 'Senior Software Engineer', 'QA Engineer', 'Product Manager', 'HR Specialist', 'HR Manager', 'Sales Representative', 'Account Executive', 'Sales Manager', 'DevOps Engineer', 'Data Analyst', 'Marketing Specialist'];
const statuses = ['Active', 'Inactive', 'On Leave'];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Seed Initial Data function
const seedInitialData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already populated. Skipping database seeding.');
      return;
    }

    console.log('Seeding initial data...');

    // 1. Create Default Departments
    const engineering = await Department.create({ name: 'Engineering', description: 'Software development, product engineering, QA, and devops team.' });
    const hr = await Department.create({ name: 'Human Resources', description: 'Talent acquisition, employee welfare, operations, and policy management.' });
    const sales = await Department.create({ name: 'Sales', description: 'Account management, business development, and client relations.' });
    const marketing = await Department.create({ name: 'Marketing', description: 'Brand management, advertising, social media, and market research.' });
    const finance = await Department.create({ name: 'Finance', description: 'Accounting, financial planning, payroll processing, and audits.' });
    const itSupport = await Department.create({ name: 'IT Support', description: 'Technical infrastructure, helpdesk, and network security.' });
    const legal = await Department.create({ name: 'Legal', description: 'Corporate law, compliance, contracts, and legal counsel.' });
    const operations = await Department.create({ name: 'Operations', description: 'Supply chain, logistics, facilities, and day-to-day corporate operations.' });

    const allDepartments = [engineering, hr, sales, marketing, finance, itSupport, legal, operations];
    console.log('Seeded 8 departments successfully.');

    // 2. Create Core Employees
    const alice = await Employee.create({ name: 'Alice Cooper', email: 'alice@company.com', phone: '+1 (555) 019-2834', dob: new Date('1992-05-15'), department: engineering._id, role: 'Senior Software Engineer', salary: 95000, status: 'Active', joinDate: new Date('2023-01-10') });
    const bob = await Employee.create({ name: 'Bob Marley', email: 'bob@company.com', phone: '+1 (555) 014-9988', dob: new Date('1988-11-23'), department: hr._id, role: 'HR Manager', salary: 75000, status: 'Active', joinDate: new Date('2022-06-15') });
    const charlie = await Employee.create({ name: 'Charlie Chaplin', email: 'charlie@company.com', phone: '+1 (555) 012-4433', dob: new Date('1995-02-02'), department: sales._id, role: 'Account Representative', salary: 62000, status: 'Active', joinDate: new Date('2024-03-01') });

    engineering.manager = alice._id; await engineering.save();
    hr.manager = bob._id; await hr.save();
    sales.manager = charlie._id; await sales.save();

    // 3. Create 50 Additional Random Employees
    const employees = [];
    for (let i = 0; i < 50; i++) {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      employees.push({
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Date.now()}${i}@company.com`,
        phone: `+1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
        dob: getRandomDate(new Date(1970, 0, 1), new Date(2000, 0, 1)),
        department: getRandomElement(allDepartments)._id,
        role: getRandomElement(rolesList),
        salary: Math.floor(40000 + Math.random() * 80000),
        status: getRandomElement(statuses),
        joinDate: getRandomDate(new Date(2015, 0, 1), new Date())
      });
    }
    const insertedEmployees = await Employee.insertMany(employees);
    console.log('Seeded employees successfully (including 50 random records).');

    // Assign random managers to departments that don't have one
    for (const dept of allDepartments) {
      if (!dept.manager) {
        const emp = insertedEmployees.find(e => e.department.toString() === dept._id.toString());
        if (emp) {
          dept.manager = emp._id;
          await dept.save();
        }
      }
    }
    console.log('Assigned managers to all departments.');

    // 4. Create System User Accounts
    await User.create({ username: 'admin', password: 'admin123', role: 'admin', employeeId: null });
    await User.create({ username: 'alice', password: 'Welcome123', role: 'employee', employeeId: alice._id });
    await User.create({ username: 'bob', password: 'Welcome123', role: 'employee', employeeId: bob._id });
    await User.create({ username: 'charlie', password: 'Welcome123', role: 'employee', employeeId: charlie._id });
    console.log('Seeded core user accounts successfully.');

    // 5. Create Attendance Records
    const todayStr = new Date().toISOString().split('T')[0];
    await Attendance.create({ employeeId: alice._id, date: todayStr, status: 'Present' });
    await Attendance.create({ employeeId: charlie._id, date: todayStr, status: 'Late' });

    const attendances = insertedEmployees.map((emp, index) => ({
      employeeId: emp._id,
      date: todayStr,
      status: index < 25 ? 'Present' : 'Absent'
    }));
    await Attendance.insertMany(attendances);
    console.log('Seeded check-ins successfully.');

    // 6. Create Leave Requests
    await Leave.create({ employeeId: bob._id, type: 'Annual', fromDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), toDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), reason: 'Family vacation and personal downtime', status: 'Pending' });

    const leaveTypes = ['Sick', 'Casual', 'Annual', 'Unpaid'];
    const leaveStatuses = ['Pending', 'Approved', 'Rejected'];
    const leaveReasons = ['Medical appointment', 'Family vacation', 'Personal errands', 'Feeling unwell', 'Attending a wedding', 'Home maintenance'];
    
    const randomLeaves = [];
    for (let i = 0; i < 15; i++) {
      const emp = getRandomElement(insertedEmployees);
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() + Math.floor(Math.random() * 10));
      const toDate = new Date(fromDate);
      toDate.setDate(fromDate.getDate() + Math.floor(Math.random() * 5) + 1);
      
      randomLeaves.push({
        employeeId: emp._id, type: getRandomElement(leaveTypes), status: getRandomElement(leaveStatuses), reason: getRandomElement(leaveReasons), fromDate, toDate
      });
    }
    await Leave.insertMany(randomLeaves);

    console.log('Seeded default and random leave requests successfully.');
    console.log('\x1b[32m%s\x1b[0m', 'Database seeding process completed successfully!');
    console.log('\x1b[33m%s\x1b[0m', 'Seeded Admin Account: username="admin", password="admin123"');
    console.log('\x1b[33m%s\x1b[0m', 'Seeded Employee Account: username="alice", password="Welcome123"');
  } catch (error) {
    console.error('Error during seeding database:', error.message);
  }
};

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`\x1b[32m%s\x1b[0m`, `EMS Express Server is running on port ${PORT}`);
  await seedInitialData();
});

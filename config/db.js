const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/employee_management_system');
    console.log(`\x1b[36m%s\x1b[0m`, `MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`\x1b[31m%s\x1b[0m`, `MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

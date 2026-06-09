# 💎 AuraEMS - Organization Resource Planner

A modern, highly interactive Employee Management System built with a sleek Glassmorphism UI aesthetic. This system empowers organizations to seamlessly manage their staff, track daily attendance, handle leave requests, and generate real-time payroll reports.

## ✨ Key Features

- **Premium Interface**: A dynamic, fully responsive frontend utilizing authentic Glassmorphism styling, vibrant gradients, and tactile micro-animations.
- **Department & Staff Organization**: Track employees across multiple departments, including manager assignments and real-time headcounts.
- **Attendance Logging**: Log daily check-ins for employees to track 'Present', 'Absent', or 'Late' statuses.
- **Leave Management Workflows**: Employees can submit leave requests (Annual, Sick, Casual, Unpaid) which can be reviewed, approved, or rejected by administrators.
- **Data Export & Reporting**: One-click direct downloads for comprehensive Payroll Registers and Monthly Attendance Logs in CSV format.
- **Automated Database Seeding**: Starts with a robust built-in seed mechanism. On the first run, it automatically populates the database with 8 distinct departments, over 50 fully-fleshed out employees, user login credentials, and historical logs.

## 🚀 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, Premium Custom CSS
- **Architecture**: Single Page Application (SPA) with Hash-based Routing

## 📋 Prerequisites

Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/en/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (Running locally on default port `27017`)

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/amohammedali/Employee_Management_System.git
   cd Employee_Management_System
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory (or rename `.env.example` if it exists) and add your environment variables:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/employee_management
   JWT_SECRET=supersecret_jwt_key_here
   ```

4. **Run the Application**
   ```bash
   npm run dev
   ```
   *Note: If the MongoDB database is empty, the server will automatically seed the database with departments, over 50 employees, and their respective user accounts.*

## 🔐 Demo Credentials

To access the system locally, you can use the following default credentials that are generated during the database seeding process:

| Role | Username | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin` | `admin123` |
| **Standard Employee** | `alice` | `Welcome123` |

## 📁 Project Structure

```text
├── config/              # Database connection configuration
├── controllers/         # Core business logic for APIs
├── middleware/          # JWT authentication middleware
├── models/              # Mongoose database schemas
├── public/              # Frontend assets (HTML, CSS, JS Views)
├── routes/              # Express API route definitions
└── server.js            # Main application entry point & seeder
```


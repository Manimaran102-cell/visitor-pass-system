// Seeds the database with one account per role so you can log in immediately.
// Run with: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Employee = require('../models/Employee');

const run = async () => {
  await connectDB();

  console.log('Clearing existing Users and Employees...');
  await User.deleteMany({});
  await Employee.deleteMany({});

  console.log('Creating employee profile...');
  const employee = await Employee.create({
    name: 'John Employee',
    email: 'john.employee@company.com',
    phone: '9000000001',
    department: 'Engineering',
    designation: 'Software Engineer',
  });

  console.log('Creating user accounts...');
  const admin = await User.create({
    name: 'Alice Admin',
    email: 'admin@company.com',
    password: 'Admin@123',
    role: 'admin',
  });

  const receptionist = await User.create({
    name: 'Rita Receptionist',
    email: 'receptionist@company.com',
    password: 'Reception@123',
    role: 'receptionist',
  });

  const employeeUser = await User.create({
    name: employee.name,
    email: employee.email,
    password: 'Employee@123',
    role: 'employee',
    employeeProfile: employee._id,
  });

  employee.linkedUser = employeeUser._id;
  await employee.save();

  console.log('\nSeed complete. Login credentials:');
  console.log('----------------------------------');
  console.log(`Admin:        ${admin.email} / Admin@123`);
  console.log(`Receptionist: ${receptionist.email} / Reception@123`);
  console.log(`Employee:     ${employeeUser.email} / Employee@123`);
  console.log('----------------------------------');

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

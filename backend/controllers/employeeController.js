const Employee = require('../models/Employee');

// GET /api/employees
const getEmployees = async (req, res) => {
  const { search, department, isActive } = req.query;
  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { department: { $regex: search, $options: 'i' } },
    ];
  }
  if (department) filter.department = department;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const employees = await Employee.find(filter).sort('name');
  res.json(employees);
};

// GET /api/employees/:id
const getEmployee = async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) return res.status(404).json({ message: 'Employee not found' });
  res.json(employee);
};

// POST /api/employees
const createEmployee = async (req, res) => {
  try {
    const { name, email, phone, department, designation } = req.body;
    if (!name || !email || !phone || !department || !designation) {
      return res.status(400).json({ message: 'All employee fields are required' });
    }
    const existing = await Employee.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'An employee with this email already exists' });

    const employee = await Employee.create({ name, email, phone, department, designation });
    res.status(201).json(employee);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create employee', error: err.message });
  }
};

// PATCH /api/employees/:id
const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const fields = ['name', 'email', 'phone', 'department', 'designation', 'isActive'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) employee[f] = req.body[f];
    });

    await employee.save();
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update employee', error: err.message });
  }
};

// DELETE /api/employees/:id
const deleteEmployee = async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) return res.status(404).json({ message: 'Employee not found' });
  await employee.deleteOne();
  res.json({ message: 'Employee deleted' });
};

module.exports = { getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee };

const express = require('express');
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getEmployees);
router.get('/:id', getEmployee);

router.post('/', authorize('admin'), createEmployee);
router.patch('/:id', authorize('admin'), updateEmployee);
router.delete('/:id', authorize('admin'), deleteEmployee);

module.exports = router;

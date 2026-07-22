const express = require('express');
const router = express.Router();
const c = require('./hr.controller');

// Stats
router.get('/stats', c.getStats);

// Employees
router.get('/employees', c.getAllEmployees);
router.post('/employees', c.createEmployee);
router.get('/employees/:id', c.getEmployeeById);
router.patch('/employees/:id', c.updateEmployee);

// Leave Requests
router.get('/leaves', c.getAllLeaves);
router.post('/employees/:employeeId/leave', c.submitLeave);
router.patch('/leaves/:id/review', c.reviewLeave);

module.exports = router;

const hrService = require('./hr.service');

const getAllEmployees = async (req, res, next) => {
  try {
    const employees = await hrService.getAllEmployees(req.query);
    res.json({ success: true, data: employees });
  } catch (error) { next(error); }
};

const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await hrService.getEmployeeById(req.params.id);
    res.json({ success: true, data: employee });
  } catch (error) { next(error); }
};

const createEmployee = async (req, res, next) => {
  try {
    const employee = await hrService.createEmployee(req.body);
    res.status(201).json({ success: true, data: employee });
  } catch (error) { next(error); }
};

const updateEmployee = async (req, res, next) => {
  try {
    const employee = await hrService.updateEmployee(req.params.id, req.body);
    res.json({ success: true, data: employee });
  } catch (error) { next(error); }
};

const getAllLeaves = async (req, res, next) => {
  try {
    const leaves = await hrService.getAllLeaves(req.query);
    res.json({ success: true, data: leaves });
  } catch (error) { next(error); }
};

const submitLeave = async (req, res, next) => {
  try {
    const leave = await hrService.submitLeave(req.params.employeeId, req.body);
    res.status(201).json({ success: true, data: leave });
  } catch (error) { next(error); }
};

const reviewLeave = async (req, res, next) => {
  try {
    const leave = await hrService.reviewLeave(req.params.id, req.body);
    res.json({ success: true, data: leave });
  } catch (error) { next(error); }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await hrService.getStats();
    res.json({ success: true, data: stats });
  } catch (error) { next(error); }
};

module.exports = { getAllEmployees, getEmployeeById, createEmployee, updateEmployee, getAllLeaves, submitLeave, reviewLeave, getStats };

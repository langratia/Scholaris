const { Router } = require('express');
const {
  getRegisters,
  createRegister,
  updateRegisterStatus,
  getApplications,
  createApplication,
  updateApplicationStatus,
} = require('./admissions.controller');

const router = Router();

// Admission Registers
router.get('/registers', getRegisters);
router.post('/registers', createRegister);
router.patch('/registers/:id/status', updateRegisterStatus);

// Applications
router.get('/applications', getApplications);
router.post('/applications', createApplication);
router.patch('/applications/:id/status', updateApplicationStatus);

module.exports = router;

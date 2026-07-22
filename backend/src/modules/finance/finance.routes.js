const { Router } = require('express');
const {
  getFeeTerms,
  createFeeTerm,
  getStudentFees,
  assignFee,
  recordPayment,
  updateFeeStatus,
  getFinanceSummary,
} = require('./finance.controller');

const router = Router();

// Summary metrics
router.get('/summary', getFinanceSummary);

// Fee Terms
router.get('/terms', getFeeTerms);
router.post('/terms', createFeeTerm);

// Student Invoices & Payments
router.get('/fees', getStudentFees);
router.post('/fees/assign', assignFee);
router.post('/fees/:id/pay', recordPayment);
router.patch('/fees/:id/status', updateFeeStatus);

module.exports = router;

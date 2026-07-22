const { FeeTermService, StudentFeeService } = require('./finance.service');
const {
  createFeeTermSchema,
  assignFeeSchema,
  recordPaymentSchema,
  updateStatusSchema,
} = require('./finance.schema');

// --- FEE TERMS ---
const getFeeTerms = async (req, res, next) => {
  try {
    const terms = await FeeTermService.getAll();
    res.json(terms);
  } catch (err) {
    next(err);
  }
};

const createFeeTerm = async (req, res, next) => {
  try {
    const validData = createFeeTermSchema.parse(req.body);
    const existing = await FeeTermService.getByCode(validData.code);
    if (existing) {
      return res.status(400).json({ error: 'Fee Term code already exists' });
    }

    const term = await FeeTermService.create(validData);
    res.status(201).json(term);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: err.errors.map((e) => e.message).join(', ') });
    }
    next(err);
  }
};

// --- STUDENT FEES ---
const getStudentFees = async (req, res, next) => {
  try {
    const fees = await StudentFeeService.getAll();
    res.json(fees);
  } catch (err) {
    next(err);
  }
};

const assignFee = async (req, res, next) => {
  try {
    const validData = assignFeeSchema.parse(req.body);
    const fee = await StudentFeeService.assignFee(validData);
    res.status(201).json(fee);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: err.errors.map((e) => e.message).join(', ') });
    }
    next(err);
  }
};

const recordPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount } = recordPaymentSchema.parse(req.body);
    const fee = await StudentFeeService.recordPayment(parseInt(id), amount);
    res.json(fee);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: err.errors.map((e) => e.message).join(', ') });
    }
    next(err);
  }
};

const updateFeeStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = updateStatusSchema.parse(req.body);
    const fee = await StudentFeeService.updateStatus(parseInt(id), status);
    res.json(fee);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: err.errors.map((e) => e.message).join(', ') });
    }
    next(err);
  }
};

const getFinanceSummary = async (req, res, next) => {
  try {
    const metrics = await StudentFeeService.getSummaryMetrics();
    res.json(metrics);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getFeeTerms,
  createFeeTerm,
  getStudentFees,
  assignFee,
  recordPayment,
  updateFeeStatus,
  getFinanceSummary,
};

const { RegisterService, ApplicationService } = require('./admissions.service');
const {
  createRegisterSchema,
  createApplicationSchema,
  updateStatusSchema,
} = require('./admissions.schema');

// --- REGISTERS ---
const getRegisters = async (req, res, next) => {
  try {
    const registers = await RegisterService.getAll();
    res.json(registers);
  } catch (err) {
    next(err);
  }
};

const createRegister = async (req, res, next) => {
  try {
    const validData = createRegisterSchema.parse(req.body);
    const register = await RegisterService.create(validData);
    res.status(201).json(register);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: err.errors.map((e) => e.message).join(', ') });
    }
    next(err);
  }
};

const updateRegisterStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const register = await RegisterService.updateStatus(parseInt(id), status);
    res.json(register);
  } catch (err) {
    next(err);
  }
};

// --- APPLICATIONS ---
const getApplications = async (req, res, next) => {
  try {
    const { registerId } = req.query;
    const apps = registerId
      ? await ApplicationService.getByRegister(parseInt(registerId))
      : await ApplicationService.getAll();
    res.json(apps);
  } catch (err) {
    next(err);
  }
};

const createApplication = async (req, res, next) => {
  try {
    const validData = createApplicationSchema.parse(req.body);
    const application = await ApplicationService.create(validData);
    res.status(201).json(application);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: err.errors.map((e) => e.message).join(', ') });
    }
    next(err);
  }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = updateStatusSchema.parse(req.body);
    const application = await ApplicationService.updateStatus(parseInt(id), status);
    res.json(application);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: err.errors.map((e) => e.message).join(', ') });
    }
    next(err);
  }
};

const checkApplicationStatus = async (req, res, next) => {
  try {
    const { applicationNumber, email } = req.body;
    if (!applicationNumber || !email) {
      return res.status(400).json({ error: 'Application number and email are required' });
    }
    const status = await ApplicationService.checkStatus(applicationNumber, email);
    if (!status) {
      return res.status(404).json({ error: 'Application not found with those details' });
    }
    res.json(status);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getRegisters,
  createRegister,
  updateRegisterStatus,
  getApplications,
  createApplication,
  updateApplicationStatus,
  checkApplicationStatus,
};


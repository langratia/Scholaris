const { ClassroomService, PeriodService, SessionService } = require('./timetables.service');
const { classroomSchema, periodSchema, sessionSchema } = require('./timetables.schema');

// --- CLASSROOMS ---
const getClassrooms = async (req, res, next) => {
  try {
    const classrooms = await ClassroomService.getAll();
    res.json(classrooms);
  } catch (error) {
    next(error);
  }
};

const createClassroom = async (req, res, next) => {
  try {
    const validData = classroomSchema.parse(req.body);
    const existing = await ClassroomService.getByCode(validData.code);
    if (existing) {
      return res.status(400).json({ error: 'Classroom code already exists' });
    }
    const room = await ClassroomService.create(validData);
    res.status(201).json(room);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }
    next(error);
  }
};

// --- PERIODS ---
const getPeriods = async (req, res, next) => {
  try {
    const periods = await PeriodService.getAll();
    res.json(periods);
  } catch (error) {
    next(error);
  }
};

const createPeriod = async (req, res, next) => {
  try {
    const validData = periodSchema.parse(req.body);
    const period = await PeriodService.create(validData);
    res.status(201).json(period);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }
    next(error);
  }
};

// --- SESSIONS ---
const getSessions = async (req, res, next) => {
  try {
    const sessions = await SessionService.getAll();
    res.json(sessions);
  } catch (error) {
    next(error);
  }
};

const createSession = async (req, res, next) => {
  try {
    const validData = sessionSchema.parse(req.body);

    // Validate datetime sequence
    if (new Date(validData.startDatetime) >= new Date(validData.endDatetime)) {
      return res.status(400).json({ error: 'Session start time must be before end time' });
    }

    // Run overlap conflict check
    const conflictError = await SessionService.checkConflicts(validData);
    if (conflictError) {
      return res.status(400).json({ error: conflictError });
    }

    const session = await SessionService.create(validData);
    res.status(201).json(session);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }
    next(error);
  }
};

const updateSessionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['DRAFT', 'CONFIRMED', 'DONE', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid session status' });
    }
    const session = await SessionService.updateStatus(id, status);
    res.json(session);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClassrooms,
  createClassroom,
  getPeriods,
  createPeriod,
  getSessions,
  createSession,
  updateSessionStatus,
};

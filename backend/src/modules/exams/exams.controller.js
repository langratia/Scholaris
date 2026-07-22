const { ExamScheduleService, ExamResultService } = require('./exams.service');
const { scheduleSchema, bulkResultsSchema } = require('./exams.schema');

const getSchedules = async (req, res, next) => {
  try {
    const schedules = await ExamScheduleService.getAll();
    res.json(schedules);
  } catch (error) {
    next(error);
  }
};

const getScheduleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schedule = await ExamScheduleService.getById(id);
    if (!schedule) {
      return res.status(404).json({ error: 'Exam schedule not found' });
    }
    res.json(schedule);
  } catch (error) {
    next(error);
  }
};

const createSchedule = async (req, res, next) => {
  try {
    const validData = scheduleSchema.parse(req.body);
    const schedule = await ExamScheduleService.create(validData);
    res.status(201).json(schedule);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['SCHEDULED', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid exam status' });
    }
    const schedule = await ExamScheduleService.updateStatus(id, status);
    res.json(schedule);
  } catch (error) {
    next(error);
  }
};

const recordBulkResults = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { results } = req.body;
    const validData = bulkResultsSchema.parse({ examScheduleId: parseInt(id, 10), results });
    const updatedSchedule = await ExamResultService.bulkRecord(validData.examScheduleId, validData.results);
    res.json(updatedSchedule);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }
    next(error);
  }
};

const getResultsByStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const results = await ExamResultService.getByStudent(studentId);
    res.json(results);
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await ExamResultService.getStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSchedules,
  getScheduleById,
  createSchedule,
  updateStatus,
  recordBulkResults,
  getResultsByStudent,
  getStats,
};

const AttendanceService = require('./attendance.service');
const { sheetSchema, lineUpdateSchema } = require('./attendance.schema');

const getAttendanceSheets = async (req, res, next) => {
  try {
    const sheets = await AttendanceService.getAll();
    res.json(sheets);
  } catch (error) {
    next(error);
  }
};

const getAttendanceSheetById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sheet = await AttendanceService.getById(id);
    if (!sheet) {
      return res.status(404).json({ error: 'Attendance sheet not found' });
    }
    res.json(sheet);
  } catch (error) {
    next(error);
  }
};

const createAttendanceSheet = async (req, res, next) => {
  try {
    const validData = sheetSchema.parse(req.body);
    const sheet = await AttendanceService.create(validData);
    res.status(201).json(sheet);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }
    next(error);
  }
};

const updateSheetStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['DRAFT', 'IN_PROGRESS', 'SUBMITTED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid sheet status' });
    }
    const sheet = await AttendanceService.updateSheetStatus(id, status);
    res.json(sheet);
  } catch (error) {
    next(error);
  }
};

const updateAttendanceLine = async (req, res, next) => {
  try {
    const { lineId } = req.params;
    const { status, remark } = req.body;
    const validData = lineUpdateSchema.parse({ status, remark });
    const updatedLine = await AttendanceService.updateLine(lineId, validData.status, validData.remark);
    res.json(updatedLine);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }
    next(error);
  }
};

const getAttendanceStats = async (req, res, next) => {
  try {
    const stats = await AttendanceService.getStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAttendanceSheets,
  getAttendanceSheetById,
  createAttendanceSheet,
  updateSheetStatus,
  updateAttendanceLine,
  getAttendanceStats,
};

const express = require('express');
const router = express.Router();
const {
  getAttendanceSheets,
  getAttendanceSheetById,
  createAttendanceSheet,
  updateSheetStatus,
  updateAttendanceLine,
  getAttendanceStats,
} = require('./attendance.controller');

router.get('/stats', getAttendanceStats);
router.get('/sheets', getAttendanceSheets);
router.get('/sheets/:id', getAttendanceSheetById);
router.post('/sheets', createAttendanceSheet);
router.patch('/sheets/:id/status', updateSheetStatus);
router.patch('/lines/:lineId', updateAttendanceLine);

module.exports = router;


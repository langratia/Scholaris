const express = require('express');
const router = express.Router();
const {
  getClassrooms,
  createClassroom,
  getPeriods,
  createPeriod,
  getSessions,
  createSession,
  updateSessionStatus,
} = require('./timetables.controller');

// Classrooms
router.get('/classrooms', getClassrooms);
router.post('/classrooms', createClassroom);

// Periods
router.get('/periods', getPeriods);
router.post('/periods', createPeriod);

// Sessions
router.get('/sessions', getSessions);
router.post('/sessions', createSession);
router.patch('/sessions/:id/status', updateSessionStatus);

module.exports = router;

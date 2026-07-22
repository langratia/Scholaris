const express = require('express');
const router = express.Router();
const controller = require('./exams.controller');

router.get('/schedules', controller.getSchedules);
router.post('/schedules', controller.createSchedule);
router.get('/schedules/:id', controller.getScheduleById);
router.patch('/schedules/:id/status', controller.updateStatus);
router.post('/schedules/:id/results', controller.recordBulkResults);
router.get('/results/student/:studentId', controller.getResultsByStudent);
router.get('/stats', controller.getStats);

module.exports = router;

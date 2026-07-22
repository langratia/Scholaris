const express = require('express');
const router = express.Router();
const assignmentsController = require('./assignments.controller');

// --- Assignment Routes ---

// GET /api/assignments - Get all assignments (supports ?batchId=&courseId=&status= filters)
router.get('/', assignmentsController.getAllAssignments);

// GET /api/assignments/:id - Get assignment details with submissions
router.get('/:id', assignmentsController.getAssignmentById);

// POST /api/assignments - Create new assignment
router.post('/', assignmentsController.createAssignment);

// PATCH /api/assignments/:id/status - Update assignment status (ACTIVE / CLOSED)
router.patch('/:id/status', assignmentsController.updateAssignmentStatus);

// --- Submission Routes ---

// POST /api/assignments/:id/submit - Submit an assignment
router.post('/:id/submit', assignmentsController.submitAssignment);

// PATCH /api/assignments/submissions/:id/grade - Grade a submission
router.patch('/submissions/:id/grade', assignmentsController.gradeSubmission);

module.exports = router;

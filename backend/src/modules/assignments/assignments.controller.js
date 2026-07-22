const assignmentsService = require('./assignments.service');

// --- Assignments ---

const getAllAssignments = async (req, res, next) => {
  try {
    const filters = req.query;
    const assignments = await assignmentsService.getAllAssignments(filters);
    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    next(error);
  }
};

const getAssignmentById = async (req, res, next) => {
  try {
    const assignment = await assignmentsService.getAssignmentById(req.params.id);
    res.json({
      success: true,
      data: assignment
    });
  } catch (error) {
    next(error);
  }
};

const createAssignment = async (req, res, next) => {
  try {
    const assignment = await assignmentsService.createAssignment(req.body);
    res.status(201).json({
      success: true,
      data: assignment
    });
  } catch (error) {
    next(error);
  }
};

const updateAssignmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const assignment = await assignmentsService.updateAssignmentStatus(req.params.id, status);
    res.json({
      success: true,
      data: assignment
    });
  } catch (error) {
    next(error);
  }
};

// --- Submissions ---

const submitAssignment = async (req, res, next) => {
  try {
    const { id } = req.params; // assignmentId
    const { studentId } = req.user; // Assuming student ID is injected via auth middleware into req.user
    // Fallback if studentId is in body for testing/admin purposes
    const targetStudentId = req.body.studentId || studentId;

    if (!targetStudentId) {
      return res.status(400).json({ success: false, message: 'Student ID is required' });
    }

    const submission = await assignmentsService.submitAssignment(id, targetStudentId, req.body);
    res.status(201).json({
      success: true,
      data: submission
    });
  } catch (error) {
    next(error);
  }
};

const gradeSubmission = async (req, res, next) => {
  try {
    const { id } = req.params; // submissionId
    const submission = await assignmentsService.gradeSubmission(id, req.body);
    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignmentStatus,
  submitAssignment,
  gradeSubmission
};

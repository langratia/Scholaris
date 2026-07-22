const express = require('express');
const router = express.Router();
const {
  getStudents,
  createStudent,
  getStudentProfile,
  getCourses,
  createCourse,
  getDepartments,
  createDepartment,
  getFaculty,
  createFaculty,
  getBatches,
  createBatch,
  getSubjects,
  createSubject,
} = require('./core.controller');

// Students routes
router.get('/students', getStudents);
router.post('/students', createStudent);
router.get('/students/profile/:email', getStudentProfile);

// Courses routes
router.get('/courses', getCourses);
router.post('/courses', createCourse);

// Departments routes
router.get('/departments', getDepartments);
router.post('/departments', createDepartment);

// Faculty routes
router.get('/faculty', getFaculty);
router.post('/faculty', createFaculty);

// Intake Batches routes
router.get('/batches', getBatches);
router.post('/batches', createBatch);

// Subjects routes
router.get('/subjects', getSubjects);
router.post('/subjects', createSubject);

module.exports = router;

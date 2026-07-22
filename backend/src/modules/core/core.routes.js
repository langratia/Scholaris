const express = require('express');
const router = express.Router();
const {
  getStudents,
  createStudent,
  getCourses,
  createCourse,
  getDepartments,
  createDepartment,
  getFaculty,
  createFaculty,
} = require('./core.controller');

// Students routes
router.get('/students', getStudents);
router.post('/students', createStudent);

// Courses routes
router.get('/courses', getCourses);
router.post('/courses', createCourse);

// Departments routes
router.get('/departments', getDepartments);
router.post('/departments', createDepartment);

// Faculty routes
router.get('/faculty', getFaculty);
router.post('/faculty', createFaculty);

module.exports = router;

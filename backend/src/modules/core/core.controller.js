const prisma = require('../../config/db');

// --- STUDENTS ---
const getStudents = async (req, res, next) => {
  try {
    const students = await prisma.student.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(students);
  } catch (error) {
    next(error);
  }
};

const createStudent = async (req, res, next) => {
  try {
    const { name, email, grade } = req.body;
    if (!name || !email || !grade) {
      return res.status(400).json({ error: 'Name, email, and grade are required' });
    }

    const existing = await prisma.student.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const student = await prisma.student.create({
      data: { name, email, grade },
    });
    res.status(201).json(student);
  } catch (error) {
    next(error);
  }
};

// --- COURSES ---
const getCourses = async (req, res, next) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(courses);
  } catch (error) {
    next(error);
  }
};

const createCourse = async (req, res, next) => {
  try {
    const { title, code, instructor } = req.body;
    if (!title || !code || !instructor) {
      return res.status(400).json({ error: 'Title, code, and instructor are required' });
    }

    const existing = await prisma.course.findUnique({ where: { code } });
    if (existing) {
      return res.status(400).json({ error: 'Course code already exists' });
    }

    const course = await prisma.course.create({
      data: { title, code, instructor },
    });
    res.status(201).json(course);
  } catch (error) {
    next(error);
  }
};

// --- DEPARTMENTS ---
const getDepartments = async (req, res, next) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { faculties: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    res.json(departments);
  } catch (error) {
    next(error);
  }
};

const createDepartment = async (req, res, next) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) {
      return res.status(400).json({ error: 'Name and code are required' });
    }

    const existing = await prisma.department.findUnique({ where: { code } });
    if (existing) {
      return res.status(400).json({ error: 'Department code already exists' });
    }

    const department = await prisma.department.create({
      data: { name, code },
    });
    res.status(201).json(department);
  } catch (error) {
    next(error);
  }
};

// --- FACULTY ---
const getFaculty = async (req, res, next) => {
  try {
    const faculty = await prisma.faculty.findMany({
      include: {
        department: true,
      },
      orderBy: { lastName: 'asc' },
    });
    res.json(faculty);
  } catch (error) {
    next(error);
  }
};

const createFaculty = async (req, res, next) => {
  try {
    const { firstName, lastName, email, departmentId } = req.body;
    if (!firstName || !lastName || !email || !departmentId) {
      return res.status(400).json({ error: 'All faculty fields are required' });
    }

    const existing = await prisma.faculty.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const faculty = await prisma.faculty.create({
      data: {
        firstName,
        lastName,
        email,
        departmentId: parseInt(departmentId, 10),
      },
      include: {
        department: true,
      },
    });
    res.status(201).json(faculty);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  createStudent,
  getCourses,
  createCourse,
  getDepartments,
  createDepartment,
  getFaculty,
  createFaculty,
};

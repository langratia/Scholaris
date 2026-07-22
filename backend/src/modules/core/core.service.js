const prisma = require('../../config/db');

const StudentService = {
  getAll: () => prisma.student.findMany({ orderBy: { createdAt: 'desc' } }),
  getByEmail: (email) => prisma.student.findUnique({ where: { email } }),
  create: (data) => prisma.student.create({ data }),
};

const CourseService = {
  getAll: () => prisma.course.findMany({ orderBy: { createdAt: 'desc' } }),
  getByCode: (code) => prisma.course.findUnique({ where: { code } }),
  create: (data) => prisma.course.create({ data }),
};

const DepartmentService = {
  getAll: () => prisma.department.findMany({
    include: { _count: { select: { faculties: true } } },
    orderBy: { name: 'asc' },
  }),
  getByCode: (code) => prisma.department.findUnique({ where: { code } }),
  create: (data) => prisma.department.create({ data }),
};

const FacultyService = {
  getAll: () => prisma.faculty.findMany({
    include: { department: true },
    orderBy: { lastName: 'asc' },
  }),
  getByEmail: (email) => prisma.faculty.findUnique({ where: { email } }),
  create: (data) => prisma.faculty.create({
    data,
    include: { department: true },
  }),
};

module.exports = {
  StudentService,
  CourseService,
  DepartmentService,
  FacultyService,
};

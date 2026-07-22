const prisma = require('../../config/db');

const StudentService = {
  getAll: () => prisma.student.findMany({ orderBy: { createdAt: 'desc' } }),
  getByEmail: (email) => prisma.student.findUnique({ where: { email } }),
  create: (data) => prisma.student.create({ data }),
  update: (id, data) => prisma.student.update({ where: { id: parseInt(id, 10) }, data }),
  delete: (id) => prisma.student.delete({ where: { id: parseInt(id, 10) } }),

  getProfileByEmail: (email) => prisma.student.findUnique({
    where: { email },
    include: {
      intakeBatch: {
        include: {
          course: true,
          sessions: {
            include: {
              subject: true,
              classroom: true,
              faculty: true,
            },
            orderBy: { startDatetime: 'asc' },
          },
        },
      },
      studentFees: {
        include: { feeTerm: { include: { installments: true } } },
        orderBy: { createdAt: 'desc' },
      },
      attendanceLines: {
        include: {
          sheet: {
            include: { course: true, faculty: true },
          },
        },
        orderBy: { sheet: { date: 'desc' } },
      },
      examResults: {
        include: {
          examSchedule: {
            include: {
              course: true,
              subject: true,
              batch: true,
            },
          },
        },
        orderBy: { examSchedule: { date: 'desc' } },
      },
      assignmentSubmissions: {
        include: {
          assignment: {
            include: {
              course: true,
              subject: true,
              faculty: true,
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
      },
      bookBorrows: {
        include: {
          book: true,
        },
        orderBy: { issuedAt: 'desc' },
      },
    },
  }),
};

const CourseService = {
  getAll: () => prisma.course.findMany({ orderBy: { createdAt: 'desc' } }),
  getByCode: (code) => prisma.course.findUnique({ where: { code } }),
  create: (data) => prisma.course.create({ data }),
  update: (id, data) => prisma.course.update({ where: { id: parseInt(id, 10) }, data }),
  delete: (id) => prisma.course.delete({ where: { id: parseInt(id, 10) } }),
};

const DepartmentService = {
  getAll: () => prisma.department.findMany({
    include: { _count: { select: { faculties: true } } },
    orderBy: { name: 'asc' },
  }),
  getByCode: (code) => prisma.department.findUnique({ where: { code } }),
  create: (data) => prisma.department.create({ data }),
  update: (id, data) => prisma.department.update({ where: { id: parseInt(id, 10) }, data }),
  delete: (id) => prisma.department.delete({ where: { id: parseInt(id, 10) } }),
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
  update: (id, data) => prisma.faculty.update({
    where: { id: parseInt(id, 10) },
    data,
    include: { department: true },
  }),
  delete: (id) => prisma.faculty.delete({ where: { id: parseInt(id, 10) } }),
};

const BatchService = {
  getAll: () => prisma.intakeBatch.findMany({
    include: { course: true, _count: { select: { students: true } } },
    orderBy: { createdAt: 'desc' },
  }),
  getByCode: (code) => prisma.intakeBatch.findUnique({ where: { code } }),
  create: (data) => prisma.intakeBatch.create({
    data: {
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    },
    include: { course: true },
  }),
};

const SubjectService = {
  getAll: () => prisma.subject.findMany({
    include: { course: true, department: true },
    orderBy: { name: 'asc' },
  }),
  getByCode: (code) => prisma.subject.findUnique({ where: { code } }),
  create: (data) => prisma.subject.create({
    data,
    include: { course: true, department: true },
  }),
};

module.exports = {
  StudentService,
  CourseService,
  DepartmentService,
  FacultyService,
  BatchService,
  SubjectService,
};

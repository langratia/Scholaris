const prisma = require('../../config/db');

const ClassroomService = {
  getAll: () => prisma.classroom.findMany({ orderBy: { name: 'asc' } }),
  getByCode: (code) => prisma.classroom.findUnique({ where: { code } }),
  create: (data) => prisma.classroom.create({ data }),
};

const PeriodService = {
  getAll: () => prisma.period.findMany({ orderBy: { sequence: 'asc' } }),
  create: (data) => prisma.period.create({ data }),
};

const SessionService = {
  getAll: () => prisma.session.findMany({
    include: {
      course: true,
      batch: true,
      subject: true,
      faculty: true,
      classroom: true,
    },
    orderBy: { startDatetime: 'asc' },
  }),

  getById: (id) => prisma.session.findUnique({
    where: { id: parseInt(id, 10) },
    include: {
      course: true,
      batch: true,
      subject: true,
      faculty: true,
      classroom: true,
      attendanceSheets: true,
    },
  }),

  // Conflict detection for Faculty, Classroom, and Batch double-bookings
  checkConflicts: async (data, excludeId = null) => {
    const start = new Date(data.startDatetime);
    const end = new Date(data.endDatetime);

    const overlappingSessions = await prisma.session.findMany({
      where: {
        status: { not: 'CANCELLED' },
        ...(excludeId ? { id: { not: parseInt(excludeId, 10) } } : {}),
        AND: [
          { startDatetime: { lt: end } },
          { endDatetime: { gt: start } },
        ],
      },
      include: {
        faculty: true,
        classroom: true,
        batch: true,
      },
    });

    for (const session of overlappingSessions) {
      if (session.facultyId === data.facultyId) {
        return `Faculty collision: ${session.faculty.firstName} ${session.faculty.lastName} is already assigned to "${session.title}" (${session.startDatetime.toLocaleTimeString()} - ${session.endDatetime.toLocaleTimeString()})`;
      }
      if (session.classroomId === data.classroomId) {
        return `Classroom collision: Room "${session.classroom.name}" is already booked for "${session.title}" (${session.startDatetime.toLocaleTimeString()} - ${session.endDatetime.toLocaleTimeString()})`;
      }
      if (session.batchId === data.batchId) {
        return `Intake Batch collision: Batch "${session.batch.name}" is already scheduled for "${session.title}" (${session.startDatetime.toLocaleTimeString()} - ${session.endDatetime.toLocaleTimeString()})`;
      }
    }

    return null; // No conflicts
  },

  create: (data) => prisma.session.create({
    data: {
      ...data,
      startDatetime: new Date(data.startDatetime),
      endDatetime: new Date(data.endDatetime),
    },
    include: {
      course: true,
      batch: true,
      subject: true,
      faculty: true,
      classroom: true,
    },
  }),

  updateStatus: (id, status) => prisma.session.update({
    where: { id: parseInt(id, 10) },
    data: { status },
    include: {
      course: true,
      batch: true,
      subject: true,
      faculty: true,
      classroom: true,
    },
  }),
};

module.exports = {
  ClassroomService,
  PeriodService,
  SessionService,
};

const prisma = require('../../config/db');

const AttendanceService = {
  getAll: () => prisma.attendanceSheet.findMany({
    include: {
      course: true,
      batch: true,
      session: true,
      faculty: true,
      _count: { select: { lines: true } },
    },
    orderBy: { date: 'desc' },
  }),

  getById: (id) => prisma.attendanceSheet.findUnique({
    where: { id: parseInt(id, 10) },
    include: {
      course: true,
      batch: true,
      session: {
        include: { subject: true, classroom: true }
      },
      faculty: true,
      lines: {
        include: { student: true },
        orderBy: { student: { name: 'asc' } },
      },
    },
  }),

  create: async (data) => {
    const sheetCode = `ATT-${Date.now().toString().slice(-6)}`;
    const dateObj = new Date(data.date);

    // Fetch enrolled students in the batch, or all active students if none linked to batch specifically
    let students = await prisma.student.findMany({
      where: { intakeBatchId: data.batchId }
    });

    if (students.length === 0) {
      students = await prisma.student.findMany({ take: 20 });
    }

    return prisma.attendanceSheet.create({
      data: {
        sheetCode,
        date: dateObj,
        courseId: data.courseId,
        batchId: data.batchId,
        sessionId: data.sessionId || null,
        facultyId: data.facultyId,
        status: 'DRAFT',
        lines: {
          create: students.map(student => ({
            studentId: student.id,
            status: 'PRESENT',
          })),
        },
      },
      include: {
        course: true,
        batch: true,
        session: true,
        faculty: true,
        lines: { include: { student: true } },
      },
    });
  },

  updateSheetStatus: (id, status) => prisma.attendanceSheet.update({
    where: { id: parseInt(id, 10) },
    data: { status },
    include: {
      course: true,
      batch: true,
      faculty: true,
      lines: { include: { student: true } },
    },
  }),

  updateLine: (lineId, status, remark) => prisma.attendanceLine.update({
    where: { id: parseInt(lineId, 10) },
    data: {
      status,
      ...(remark !== undefined ? { remark } : {}),
    },
    include: { student: true },
  }),

  getStats: async () => {
    const [totalSheets, submittedSheets, totalLines, presentLines, lateLines] = await Promise.all([
      prisma.attendanceSheet.count(),
      prisma.attendanceSheet.count({ where: { status: 'SUBMITTED' } }),
      prisma.attendanceLine.count(),
      prisma.attendanceLine.count({ where: { status: 'PRESENT' } }),
      prisma.attendanceLine.count({ where: { status: 'LATE' } }),
    ]);

    const absentLines = totalLines - presentLines - lateLines;
    const attendanceRate = totalLines > 0 ? Math.round(((presentLines + lateLines) / totalLines) * 100) : 0;

    // Per-batch summary
    const batches = await prisma.intakeBatch.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        _count: { select: { attendanceSheets: true } },
      },
      take: 6,
    });

    return {
      totalSheets,
      submittedSheets,
      pendingSheets: totalSheets - submittedSheets,
      totalLines,
      presentLines,
      absentLines,
      lateLines,
      attendanceRate,
      batches,
    };
  },
};
module.exports = AttendanceService;

const prisma = require('../../config/db');

function calculateGrade(percentage) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
}

const ExamScheduleService = {
  getAll: () =>
    prisma.examSchedule.findMany({
      include: {
        course: { select: { id: true, title: true, code: true } },
        batch: { select: { id: true, name: true, code: true } },
        subject: { select: { id: true, name: true, code: true } },
        results: { include: { student: true } },
        _count: { select: { results: true } },
      },
      orderBy: { date: 'desc' },
    }),

  getById: (id) =>
    prisma.examSchedule.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        course: true,
        batch: { include: { students: true } },
        subject: true,
        results: {
          include: { student: true },
          orderBy: { student: { name: 'asc' } },
        },
      },
    }),

  create: async (data) => {
    const code = `EXAM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const schedule = await prisma.examSchedule.create({
      data: {
        ...data,
        code,
        date: new Date(data.date),
      },
      include: {
        course: true,
        batch: { include: { students: true } },
        subject: true,
        results: true,
      },
    });

    // Automatically create empty result placeholders for enrolled students in the batch
    if (schedule.batch && schedule.batch.students.length > 0) {
      const resultData = schedule.batch.students.map((student) => ({
        examScheduleId: schedule.id,
        studentId: student.id,
        marksObtained: 0,
        grade: 'F',
      }));
      await prisma.examResult.createMany({
        data: resultData,
      });
    }

    return prisma.examSchedule.findUnique({
      where: { id: schedule.id },
      include: {
        course: true,
        batch: { include: { students: true } },
        subject: true,
        results: { include: { student: true } },
      },
    });
  },

  updateStatus: (id, status) =>
    prisma.examSchedule.update({
      where: { id: parseInt(id, 10) },
      data: { status },
      include: { course: true, batch: true, subject: true },
    }),
};

const ExamResultService = {
  getBySchedule: (examScheduleId) =>
    prisma.examResult.findMany({
      where: { examScheduleId: parseInt(examScheduleId, 10) },
      include: { student: true },
      orderBy: { student: { name: 'asc' } },
    }),

  getByStudent: (studentId) =>
    prisma.examResult.findMany({
      where: { studentId: parseInt(studentId, 10) },
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
    }),

  bulkRecord: async (examScheduleId, resultsList) => {
    const exam = await prisma.examSchedule.findUnique({
      where: { id: parseInt(examScheduleId, 10) },
    });
    if (!exam) throw new Error('Exam schedule not found');

    const maxMarks = exam.maxMarks || 100;

    const updates = resultsList.map((res) => {
      const percentage = (res.marksObtained / maxMarks) * 100;
      const grade = calculateGrade(percentage);

      return prisma.examResult.upsert({
        where: {
          id: res.id || 0,
        },
        update: {
          marksObtained: res.marksObtained,
          grade,
          remarks: res.remarks || null,
        },
        create: {
          examScheduleId: exam.id,
          studentId: res.studentId,
          marksObtained: res.marksObtained,
          grade,
          remarks: res.remarks || null,
        },
      });
    });

    await prisma.$transaction(updates);

    // Auto-mark exam status as COMPLETED when marks are saved
    await prisma.examSchedule.update({
      where: { id: exam.id },
      data: { status: 'COMPLETED' },
    });

    return ExamScheduleService.getById(exam.id);
  },

  getStats: async () => {
    const totalSchedules = await prisma.examSchedule.count();
    const completedExams = await prisma.examSchedule.count({ where: { status: 'COMPLETED' } });
    const scheduledExams = await prisma.examSchedule.count({ where: { status: 'SCHEDULED' } });
    const totalResults = await prisma.examResult.count();
    
    const results = await prisma.examResult.findMany({
      include: { examSchedule: true },
    });

    let totalPercentageSum = 0;
    let passedCount = 0;

    results.forEach((r) => {
      const passMarks = r.examSchedule?.passMarks || 40;
      if (r.marksObtained >= passMarks) passedCount++;
      const maxMarks = r.examSchedule?.maxMarks || 100;
      totalPercentageSum += (r.marksObtained / maxMarks) * 100;
    });

    const averagePercentage = totalResults > 0 ? Math.round(totalPercentageSum / totalResults) : 0;
    const passRate = totalResults > 0 ? Math.round((passedCount / totalResults) * 100) : 0;

    return {
      totalSchedules,
      completedExams,
      scheduledExams,
      totalResults,
      averagePercentage,
      passRate,
    };
  },
};

module.exports = {
  ExamScheduleService,
  ExamResultService,
};

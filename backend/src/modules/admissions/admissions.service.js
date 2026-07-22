const prisma = require('../../config/db');

// --- ADMISSION REGISTERS ---
const RegisterService = {
  getAll: () =>
    prisma.admissionRegister.findMany({
      include: { _count: { select: { applications: true } } },
      orderBy: { createdAt: 'desc' },
    }),

  getById: (id) =>
    prisma.admissionRegister.findUnique({
      where: { id },
      include: { applications: true },
    }),

  create: (data) => prisma.admissionRegister.create({ data }),

  updateStatus: (id, status) =>
    prisma.admissionRegister.update({ where: { id }, data: { status } }),
};

// --- APPLICATIONS ---
const ApplicationService = {
  getAll: () =>
    prisma.application.findMany({
      include: { register: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    }),

  getByRegister: (registerId) =>
    prisma.application.findMany({
      where: { registerId },
      orderBy: { createdAt: 'desc' },
    }),

  getById: (id) =>
    prisma.application.findUnique({ where: { id } }),

  create: (data) => {
    const applicationNumber = `APP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    return prisma.application.create({ data: { ...data, applicationNumber } });
  },

  updateStatus: async (id, status) => {
    const application = await prisma.application.update({
      where: { id },
      data: { status },
    });

    // Auto-enroll when status is ADMISSION_CONFIRM
    if (status === 'ADMISSION_CONFIRM') {
      const fullName = [application.firstName, application.middleName, application.lastName]
        .filter(Boolean)
        .join(' ');

      const student = await prisma.student.create({
        data: {
          name: fullName,
          email: application.email,
          grade: application.targetCourse,
        },
      });

      // Link the student back to the application
      await prisma.application.update({
        where: { id },
        data: { enrolledStudentId: student.id },
      });
    }

    return application;
  },
};

module.exports = { RegisterService, ApplicationService };

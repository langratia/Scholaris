const prisma = require('../../config/db');

// --- FEE TERMS SERVICE ---
const FeeTermService = {
  getAll: () =>
    prisma.feeTerm.findMany({
      include: {
        installments: true,
        _count: { select: { studentFees: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),

  getById: (id) =>
    prisma.feeTerm.findUnique({
      where: { id },
      include: { installments: true },
    }),

  getByCode: (code) =>
    prisma.feeTerm.findUnique({ where: { code } }),

  create: (data) => {
    const { installments, ...termData } = data;
    return prisma.feeTerm.create({
      data: {
        ...termData,
        installments: {
          create: installments,
        },
      },
      include: { installments: true },
    });
  },
};

// --- STUDENT FEES SERVICE ---
const StudentFeeService = {
  getAll: () =>
    prisma.studentFee.findMany({
      include: {
        student: { select: { id: true, name: true, email: true, grade: true } },
        feeTerm: { select: { id: true, name: true, code: true, totalAmount: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),

  getById: (id) =>
    prisma.studentFee.findUnique({
      where: { id },
      include: {
        student: true,
        feeTerm: { include: { installments: true } },
      },
    }),

  assignFee: async (data) => {
    const feeTerm = await prisma.feeTerm.findUnique({ where: { id: data.feeTermId } });
    if (!feeTerm) throw new Error('Fee Term not found');

    const grossAmount = feeTerm.totalAmount;
    const discountAmount = (grossAmount * (data.discount || 0)) / 100;
    const netAmount = grossAmount - discountAmount;
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return prisma.studentFee.create({
      data: {
        invoiceNumber,
        studentId: data.studentId,
        feeTermId: data.feeTermId,
        grossAmount,
        discount: data.discount || 0,
        netAmount,
        paidAmount: 0,
        dueDate: new Date(data.dueDate),
        status: 'INVOICE_CREATED',
      },
      include: {
        student: true,
        feeTerm: true,
      },
    });
  },

  recordPayment: async (id, amount) => {
    const fee = await prisma.studentFee.findUnique({ where: { id } });
    if (!fee) throw new Error('Invoice not found');

    const newPaidAmount = fee.paidAmount + amount;
    const isFullyPaid = newPaidAmount >= fee.netAmount;
    const newStatus = isFullyPaid ? 'PAID' : fee.status;

    return prisma.studentFee.update({
      where: { id },
      data: {
        paidAmount: newPaidAmount,
        status: newStatus,
      },
      include: { student: true, feeTerm: true },
    });
  },

  updateStatus: (id, status) =>
    prisma.studentFee.update({
      where: { id },
      data: { status },
      include: { student: true, feeTerm: true },
    }),

  getSummaryMetrics: async () => {
    const fees = await prisma.studentFee.findMany();
    const totalBilled = fees.reduce((sum, f) => sum + f.netAmount, 0);
    const totalCollected = fees.reduce((sum, f) => sum + f.paidAmount, 0);
    const totalPending = totalBilled - totalCollected;
    const countPaid = fees.filter((f) => f.status === 'PAID').length;
    const countInvoiced = fees.length;

    return {
      totalBilled,
      totalCollected,
      totalPending,
      countPaid,
      countInvoiced,
    };
  },
};

module.exports = { FeeTermService, StudentFeeService };

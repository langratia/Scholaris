const { z } = require('zod');

const installmentSchema = z.object({
  name: z.string().min(1, 'Installment name is required'),
  percentage: z.number().min(0.01).max(100),
  dueDays: z.number().int().min(0).optional().default(30),
});

const createFeeTermSchema = z.object({
  name: z.string().min(1, 'Fee term name is required'),
  code: z.string().min(1, 'Fee term code is required'),
  description: z.string().optional(),
  totalAmount: z.number().positive('Total amount must be greater than 0'),
  installments: z
    .array(installmentSchema)
    .min(1, 'At least one installment structure is required')
    .refine(
      (items) => {
        const sum = items.reduce((acc, curr) => acc + curr.percentage, 0);
        return Math.abs(sum - 100) < 0.01;
      },
      { message: 'Installment percentages must sum up to exactly 100%' }
    ),
});

const assignFeeSchema = z.object({
  studentId: z.number().int().min(1, 'Student ID is required'),
  feeTermId: z.number().int().min(1, 'Fee Term ID is required'),
  discount: z.number().min(0).max(100).optional().default(0),
  dueDate: z.string().datetime({ message: 'Valid due date is required' }),
});

const recordPaymentSchema = z.object({
  amount: z.number().positive('Payment amount must be greater than 0'),
});

const updateStatusSchema = z.object({
  status: z.enum(['DRAFT', 'INVOICE_CREATED', 'PAID', 'CANCELLED']),
});

module.exports = {
  createFeeTermSchema,
  assignFeeSchema,
  recordPaymentSchema,
  updateStatusSchema,
};

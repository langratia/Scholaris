const { z } = require('zod');

const sheetSchema = z.object({
  date: z.string().min(1, "Date is required"),
  courseId: z.union([z.string(), z.number()]).transform(val => parseInt(val, 10)),
  batchId: z.union([z.string(), z.number()]).transform(val => parseInt(val, 10)),
  sessionId: z.union([z.string(), z.number()]).transform(val => parseInt(val, 10)).optional(),
  facultyId: z.union([z.string(), z.number()]).transform(val => parseInt(val, 10)),
});

const lineUpdateSchema = z.object({
  status: z.enum(["PRESENT", "ABSENT_EXCUSED", "ABSENT_UNEXCUSED", "LATE"]),
  remark: z.string().optional(),
});

module.exports = {
  sheetSchema,
  lineUpdateSchema,
};

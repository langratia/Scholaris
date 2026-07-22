const { z } = require('zod');

const scheduleSchema = z.object({
  title: z.string().min(1, 'Exam title is required'),
  type: z.enum(['MIDTERM', 'FINAL', 'QUIZ', 'ASSIGNMENT', 'PRACTICAL']).optional().default('FINAL'),
  courseId: z.union([z.string(), z.number()]).transform(val => parseInt(val, 10)),
  batchId: z.union([z.string(), z.number()]).transform(val => parseInt(val, 10)),
  subjectId: z.union([z.string(), z.number()]).transform(val => parseInt(val, 10)),
  maxMarks: z.union([z.string(), z.number()]).transform(val => parseFloat(val)).optional().default(100.0),
  passMarks: z.union([z.string(), z.number()]).transform(val => parseFloat(val)).optional().default(40.0),
  date: z.string().min(1, 'Exam date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  venue: z.string().optional(),
});

const bulkResultLineSchema = z.object({
  studentId: z.number().int(),
  marksObtained: z.number().min(0),
  remarks: z.string().optional(),
});

const bulkResultsSchema = z.object({
  examScheduleId: z.number().int(),
  results: z.array(bulkResultLineSchema),
});

module.exports = {
  scheduleSchema,
  bulkResultsSchema,
};

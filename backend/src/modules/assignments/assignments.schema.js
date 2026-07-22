const { z } = require('zod');

const createAssignmentSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    dueDate: z.string().transform((str) => new Date(str)),
    maxMarks: z.number().min(0).default(100.0),
    courseId: z.number().int().positive(),
    batchId: z.number().int().positive(),
    subjectId: z.number().int().positive(),
    facultyId: z.number().int().positive(),
  }),
});

const submitAssignmentSchema = z.object({
  body: z.object({
    content: z.string().optional(),
    fileUrl: z.string().url().optional().or(z.literal('')),
  }).refine((data) => data.content || data.fileUrl, {
    message: "Either content or fileUrl must be provided",
    path: ["content"]
  }),
});

const gradeSubmissionSchema = z.object({
  body: z.object({
    marksObtained: z.number().min(0),
    remarks: z.string().optional(),
  }),
});

module.exports = {
  createAssignmentSchema,
  submitAssignmentSchema,
  gradeSubmissionSchema,
};

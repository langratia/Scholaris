const { z } = require('zod');

const classroomSchema = z.object({
  name: z.string().min(1, "Classroom name is required"),
  code: z.string().min(1, "Classroom code is required"),
  capacity: z.union([z.string(), z.number()]).transform(val => parseInt(val, 10)).optional().default(30),
  building: z.string().optional(),
  facilities: z.string().optional(),
});

const periodSchema = z.object({
  name: z.string().min(1, "Period name is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  durationHours: z.union([z.string(), z.number()]).transform(val => parseFloat(val)).optional().default(1.0),
  sequence: z.union([z.string(), z.number()]).transform(val => parseInt(val, 10)).optional().default(1),
});

const sessionSchema = z.object({
  title: z.string().min(1, "Session title is required"),
  courseId: z.union([z.string(), z.number()]).transform(val => parseInt(val, 10)),
  batchId: z.union([z.string(), z.number()]).transform(val => parseInt(val, 10)),
  subjectId: z.union([z.string(), z.number()]).transform(val => parseInt(val, 10)),
  facultyId: z.union([z.string(), z.number()]).transform(val => parseInt(val, 10)),
  classroomId: z.union([z.string(), z.number()]).transform(val => parseInt(val, 10)),
  startDatetime: z.string().min(1, "Start datetime is required"),
  endDatetime: z.string().min(1, "End datetime is required"),
  status: z.enum(["DRAFT", "CONFIRMED", "DONE", "CANCELLED"]).optional().default("DRAFT"),
});

module.exports = {
  classroomSchema,
  periodSchema,
  sessionSchema,
};

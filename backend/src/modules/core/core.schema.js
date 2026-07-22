const { z } = require('zod');

const studentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  grade: z.string().min(1, "Grade is required"),
});

const courseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  code: z.string().min(1, "Course code is required"),
  instructor: z.string().min(1, "Instructor is required"),
});

const departmentSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  code: z.string().min(1, "Department code is required"),
});

const facultySchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email format"),
  departmentId: z.union([z.string(), z.number()]).transform(val => parseInt(val, 10)),
});

module.exports = {
  studentSchema,
  courseSchema,
  departmentSchema,
  facultySchema,
};

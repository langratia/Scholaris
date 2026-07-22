const { z } = require('zod');

const createRegisterSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  startDate: z.string().datetime({ message: 'Valid start date is required' }),
  endDate: z.string().datetime({ message: 'Valid end date is required' }),
  minCapacity: z.number().int().min(0).optional().default(0),
  maxCapacity: z.number().int().min(1, 'Max capacity must be at least 1'),
  targetCourse: z.string().min(1, 'Target course is required'),
});

const createApplicationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  birthDate: z.string().datetime({ message: 'Valid birth date is required' }),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  targetCourse: z.string().min(1, 'Target course is required'),
  previousInstitution: z.string().optional(),
  previousCourse: z.string().optional(),
  registerId: z.number().int().min(1, 'Admission register ID is required'),
});

const updateStatusSchema = z.object({
  status: z.enum(['DRAFT', 'SUBMITTED', 'CONFIRMED', 'ADMISSION_CONFIRM', 'DONE', 'REJECTED', 'CANCELLED']),
});

module.exports = {
  createRegisterSchema,
  createApplicationSchema,
  updateStatusSchema,
};

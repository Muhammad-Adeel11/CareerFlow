const { z } = require('zod');
const JobApplication = require('../models/JobApplication');

const createApplicationSchema = z.object({
  company: z.string().trim().min(1, 'Company is required').max(150),
  position: z.string().trim().min(1, 'Position is required').max(150),
  location: z.string().trim().max(150).optional().default(''),
  jobType: z.enum(JobApplication.JOB_TYPES).optional().default('Full-time'),
  status: z.enum(JobApplication.STATUSES).optional().default('Applied'),
  applicationDate: z.coerce.date({ errorMap: () => ({ message: 'A valid application date is required' }) }),
  salary: z.string().trim().max(100).optional().default(''),
  jobUrl: z
    .string()
    .trim()
    .max(500)
    .optional()
    .default('')
    .refine((val) => val === '' || /^https?:\/\/.+/i.test(val), { message: 'Job URL must be a valid URL' }),
  description: z.string().trim().max(5000).optional().default(''),
  notes: z.string().trim().max(5000).optional().default(''),
});

const updateApplicationSchema = createApplicationSchema.partial();

module.exports = { createApplicationSchema, updateApplicationSchema };

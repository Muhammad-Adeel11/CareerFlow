const { z } = require('zod');
const Interview = require('../models/Interview');

const createInterviewSchema = z.object({
  applicationId: z.string().min(1, 'Application is required'),
  interviewDate: z.coerce.date({ errorMap: () => ({ message: 'A valid interview date is required' }) }),
  interviewType: z.enum(Interview.INTERVIEW_TYPES).optional().default('Video'),
  interviewer: z.string().trim().max(150).optional().default(''),
  locationOrLink: z.string().trim().max(500).optional().default(''),
  status: z.enum(Interview.INTERVIEW_STATUSES).optional().default('Scheduled'),
  notes: z.string().trim().max(3000).optional().default(''),
});

const updateInterviewSchema = createInterviewSchema.partial().omit({ applicationId: true });

module.exports = { createInterviewSchema, updateInterviewSchema };

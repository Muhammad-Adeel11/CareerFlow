const mongoose = require('mongoose');

const JOB_TYPES = ['Remote', 'On-site', 'Hybrid', 'Full-time', 'Part-time', 'Internship', 'Contract'];
const STATUSES = ['Applied', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];

const jobApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: { type: String, required: [true, 'Company is required'], trim: true, maxlength: 150 },
    position: { type: String, required: [true, 'Position is required'], trim: true, maxlength: 150 },
    location: { type: String, trim: true, maxlength: 150, default: '' },
    jobType: { type: String, enum: JOB_TYPES, default: 'Full-time' },
    status: { type: String, enum: STATUSES, default: 'Applied' },
    applicationDate: { type: Date, required: [true, 'Application date is required'] },
    salary: { type: String, trim: true, maxlength: 100, default: '' },
    jobUrl: { type: String, trim: true, maxlength: 500, default: '' },
    description: { type: String, trim: true, maxlength: 5000, default: '' },
    notes: { type: String, trim: true, maxlength: 5000, default: '' },
  },
  { timestamps: true }
);

jobApplicationSchema.index({ userId: 1, status: 1 });
jobApplicationSchema.index({ userId: 1, applicationDate: -1 });
jobApplicationSchema.index({ company: 'text', position: 'text' });

jobApplicationSchema.statics.JOB_TYPES = JOB_TYPES;
jobApplicationSchema.statics.STATUSES = STATUSES;

module.exports = mongoose.model('JobApplication', jobApplicationSchema);

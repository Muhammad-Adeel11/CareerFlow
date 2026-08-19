const mongoose = require('mongoose');

const INTERVIEW_TYPES = ['Phone', 'Video', 'Technical', 'HR', 'On-site', 'Other'];
const INTERVIEW_STATUSES = ['Scheduled', 'Completed', 'Cancelled'];

const interviewSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobApplication',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    interviewDate: { type: Date, required: [true, 'Interview date is required'] },
    interviewType: { type: String, enum: INTERVIEW_TYPES, default: 'Video' },
    interviewer: { type: String, trim: true, maxlength: 150, default: '' },
    locationOrLink: { type: String, trim: true, maxlength: 500, default: '' },
    status: { type: String, enum: INTERVIEW_STATUSES, default: 'Scheduled' },
    notes: { type: String, trim: true, maxlength: 3000, default: '' },
  },
  { timestamps: true }
);

interviewSchema.index({ userId: 1, interviewDate: 1 });
interviewSchema.index({ applicationId: 1 });

interviewSchema.statics.INTERVIEW_TYPES = INTERVIEW_TYPES;
interviewSchema.statics.INTERVIEW_STATUSES = INTERVIEW_STATUSES;

module.exports = mongoose.model('Interview', interviewSchema);

const Interview = require('../models/Interview');
const JobApplication = require('../models/JobApplication');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

exports.getInterviews = catchAsync(async (req, res) => {
  const filter = { userId: req.user._id };
  if (req.query.applicationId) filter.applicationId = req.query.applicationId;

  const interviews = await Interview.find(filter).sort({ interviewDate: 1 }).populate('applicationId', 'company position');

  res.status(200).json({ success: true, data: { interviews } });
});

exports.getInterview = catchAsync(async (req, res) => {
  const interview = await Interview.findById(req.params.id).populate('applicationId', 'company position');
  if (!interview) throw new ApiError(404, 'Interview not found.');

  if (req.user.role !== 'ADMIN' && String(interview.userId) !== String(req.user._id)) {
    throw new ApiError(403, 'You do not have access to this interview.');
  }

  res.status(200).json({ success: true, data: { interview } });
});

exports.createInterview = catchAsync(async (req, res) => {
  const application = await JobApplication.findById(req.body.applicationId);
  if (!application) throw new ApiError(404, 'Related application not found.');

  if (String(application.userId) !== String(req.user._id)) {
    throw new ApiError(403, 'You cannot create an interview for another user\'s application.');
  }

  const interview = await Interview.create({ ...req.body, userId: req.user._id });
  res.status(201).json({ success: true, message: 'Interview created.', data: { interview } });
});

exports.updateInterview = catchAsync(async (req, res) => {
  const interview = await Interview.findById(req.params.id);
  if (!interview) throw new ApiError(404, 'Interview not found.');

  if (req.user.role !== 'ADMIN' && String(interview.userId) !== String(req.user._id)) {
    throw new ApiError(403, 'You do not have permission to modify this interview.');
  }

  Object.assign(interview, req.body);
  await interview.save();

  res.status(200).json({ success: true, message: 'Interview updated.', data: { interview } });
});

exports.deleteInterview = catchAsync(async (req, res) => {
  const interview = await Interview.findById(req.params.id);
  if (!interview) throw new ApiError(404, 'Interview not found.');

  if (req.user.role !== 'ADMIN' && String(interview.userId) !== String(req.user._id)) {
    throw new ApiError(403, 'You do not have permission to delete this interview.');
  }

  await interview.deleteOne();
  res.status(200).json({ success: true, message: 'Interview deleted.' });
});

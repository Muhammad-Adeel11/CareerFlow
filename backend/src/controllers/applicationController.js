const JobApplication = require('../models/JobApplication');
const Interview = require('../models/Interview');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

exports.getApplications = catchAsync(async (req, res) => {
  const { search, status, jobType, from, to, page = 1, limit = 10 } = req.query;

  const filter = req.user.role === 'ADMIN' && req.query.all === 'true' ? {} : { userId: req.user._id };

  if (status) filter.status = status;
  if (jobType) filter.jobType = jobType;
  if (from || to) {
    filter.applicationDate = {};
    if (from) filter.applicationDate.$gte = new Date(from);
    if (to) filter.applicationDate.$lte = new Date(to);
  }
  if (search) {
    filter.$or = [
      { company: { $regex: search, $options: 'i' } },
      { position: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const [applications, total] = await Promise.all([
    JobApplication.find(filter).sort({ applicationDate: -1 }).skip(skip).limit(limitNum),
    JobApplication.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      applications,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    },
  });
});

exports.getApplication = catchAsync(async (req, res) => {
  const application = await JobApplication.findById(req.params.id);
  if (!application) throw new ApiError(404, 'Application not found.');

  if (req.user.role !== 'ADMIN' && String(application.userId) !== String(req.user._id)) {
    throw new ApiError(403, 'You do not have access to this application.');
  }

  const interviews = await Interview.find({ applicationId: application._id }).sort({ interviewDate: 1 });

  res.status(200).json({ success: true, data: { application, interviews } });
});

exports.createApplication = catchAsync(async (req, res) => {
  const application = await JobApplication.create({ ...req.body, userId: req.user._id });
  res.status(201).json({ success: true, message: 'Application created.', data: { application } });
});

exports.updateApplication = catchAsync(async (req, res) => {
  const application = await JobApplication.findById(req.params.id);
  if (!application) throw new ApiError(404, 'Application not found.');

  if (req.user.role !== 'ADMIN' && String(application.userId) !== String(req.user._id)) {
    throw new ApiError(403, 'You do not have permission to modify this application.');
  }

  Object.assign(application, req.body);
  await application.save();

  res.status(200).json({ success: true, message: 'Application updated.', data: { application } });
});

exports.deleteApplication = catchAsync(async (req, res) => {
  const application = await JobApplication.findById(req.params.id);
  if (!application) throw new ApiError(404, 'Application not found.');

  if (req.user.role !== 'ADMIN' && String(application.userId) !== String(req.user._id)) {
    throw new ApiError(403, 'You do not have permission to delete this application.');
  }

  await Interview.deleteMany({ applicationId: application._id });
  await application.deleteOne();

  res.status(200).json({ success: true, message: 'Application deleted.' });
});

exports.getStats = catchAsync(async (req, res) => {
  const filter = { userId: req.user._id };

  const [byStatus, total, applications] = await Promise.all([
    JobApplication.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    JobApplication.countDocuments(filter),
    JobApplication.find(filter, 'applicationDate status').sort({ applicationDate: 1 }),
  ]);

  const statusCounts = JobApplication.STATUSES.reduce((acc, s) => ({ ...acc, [s]: 0 }), {});
  byStatus.forEach((item) => {
    statusCounts[item._id] = item.count;
  });

  const monthly = {};
  applications.forEach((app) => {
    const key = app.applicationDate.toISOString().slice(0, 7);
    monthly[key] = (monthly[key] || 0) + 1;
  });
  const overTime = Object.entries(monthly)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([month, count]) => ({ month, count }));

  const interviewsCount = await Interview.countDocuments({ userId: req.user._id });

  res.status(200).json({
    success: true,
    data: {
      total,
      statusCounts,
      overTime,
      interviewsCount,
    },
  });
});

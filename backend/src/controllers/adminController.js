const User = require('../models/User');
const JobApplication = require('../models/JobApplication');
const Interview = require('../models/Interview');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

exports.getUsers = catchAsync(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: { users: users.map((u) => u.toSafeObject()) } });
});

exports.deleteUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found.');
  if (user.role === 'ADMIN') throw new ApiError(400, 'Admin accounts cannot be deleted from here.');

  await JobApplication.deleteMany({ userId: user._id });
  await Interview.deleteMany({ userId: user._id });
  await user.deleteOne();

  res.status(200).json({ success: true, message: 'User and their data removed.' });
});

exports.getSystemStats = catchAsync(async (req, res) => {
  const [totalUsers, totalApplications, totalInterviews, byStatus, recentApplications, recentUsers] = await Promise.all([
    User.countDocuments({ role: 'USER' }),
    JobApplication.countDocuments(),
    Interview.countDocuments(),
    JobApplication.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    JobApplication.find().sort({ createdAt: -1 }).limit(5).populate('userId', 'name email'),
    User.find({ role: 'USER' }).sort({ createdAt: -1 }).limit(5),
  ]);

  const statusCounts = JobApplication.STATUSES.reduce((acc, s) => ({ ...acc, [s]: 0 }), {});
  byStatus.forEach((item) => {
    statusCounts[item._id] = item.count;
  });

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalApplications,
      totalInterviews,
      statusCounts,
      recentApplications,
      recentUsers: recentUsers.map((u) => u.toSafeObject()),
    },
  });
});

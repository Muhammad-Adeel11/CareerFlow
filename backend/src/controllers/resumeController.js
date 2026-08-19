const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

exports.uploadResume = catchAsync(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Please select a resume file to upload.');

  const isConfigured = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY;
  if (!isConfigured) {
    throw new ApiError(500, 'File storage is not configured. Please set Cloudinary environment variables.');
  }

  const uploadFromBuffer = () =>
    new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'careerflow/resumes', resource_type: 'raw', public_id: `${req.user._id}-${Date.now()}` },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

  const result = await uploadFromBuffer();

  req.user.resumeUrl = result.secure_url;
  req.user.resumeName = req.file.originalname;
  await req.user.save();

  res.status(200).json({
    success: true,
    message: 'Resume uploaded successfully.',
    data: { user: req.user.toSafeObject() },
  });
});

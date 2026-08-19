const express = require('express');
const resumeController = require('../controllers/resumeController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/', authenticate, upload.single('resume'), resumeController.uploadResume);

module.exports = router;

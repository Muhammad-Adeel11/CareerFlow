const express = require('express');
const interviewController = require('../controllers/interviewController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createInterviewSchema, updateInterviewSchema } = require('../validators/interviewValidators');

const router = express.Router();

router.use(authenticate);

router.get('/', interviewController.getInterviews);
router.get('/:id', interviewController.getInterview);
router.post('/', validate(createInterviewSchema), interviewController.createInterview);
router.put('/:id', validate(updateInterviewSchema), interviewController.updateInterview);
router.delete('/:id', interviewController.deleteInterview);

module.exports = router;

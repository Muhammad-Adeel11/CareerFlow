const express = require('express');
const applicationController = require('../controllers/applicationController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createApplicationSchema, updateApplicationSchema } = require('../validators/applicationValidators');

const router = express.Router();

router.use(authenticate);

router.get('/stats', applicationController.getStats);
router.get('/', applicationController.getApplications);
router.get('/:id', applicationController.getApplication);
router.post('/', validate(createApplicationSchema), applicationController.createApplication);
router.put('/:id', validate(updateApplicationSchema), applicationController.updateApplication);
router.delete('/:id', applicationController.deleteApplication);

module.exports = router;

const router = require('express').Router();
const { authenticate, authorizeRoles } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const upload = require('../utils/upload');
const operatorValidation = require('../validators/operator.validation');
const operatorController = require('../controllers/operator.controller');

router.use(authenticate, authorizeRoles('OPERATOR'));

router.get('/dashboard', operatorController.dashboard);
router.post('/acknowledge', validate(operatorValidation.acknowledge), operatorController.acknowledge);
router.post('/sensors', validate(operatorValidation.createSensor), operatorController.addSensor);
router.put('/sensors/:id', validate(operatorValidation.updateSensor), operatorController.updateSensor);
router.post('/incidents', upload.array('media', 5), validate(operatorValidation.createIncident), operatorController.createIncident);
router.get('/incidents', operatorController.getIncidents);
router.get('/alerts', operatorController.getAlerts);

module.exports = router;

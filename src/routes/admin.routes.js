const router = require('express').Router();
const { authenticate, authorizeRoles } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const adminValidation = require('../validators/admin.validation');
const adminController = require('../controllers/admin.controller');

router.use(authenticate, authorizeRoles('ADMIN'));

router.get('/dashboard', adminController.dashboard);
router.post('/alerts', validate(adminValidation.createAlert), adminController.createAlert);
router.put('/alerts/:id', validate(adminValidation.updateAlert), adminController.updateAlert);
router.get('/reports', adminController.reports);
router.get('/reports/export', validate(adminValidation.exportReports), adminController.exportReports);

// User management routes
router.get('/users', adminController.getUsers);
router.post('/users', validate(adminValidation.createUser), adminController.createUser);
router.put('/users/:id', validate(adminValidation.updateUser), adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Sensor management routes
router.get('/sensors', adminController.getSensors);
router.post('/sensors', validate(adminValidation.createSensor), adminController.createSensor);
router.put('/sensors/:id', validate(adminValidation.updateSensor), adminController.updateSensor);
router.delete('/sensors/:id', adminController.deleteSensor);

module.exports = router;

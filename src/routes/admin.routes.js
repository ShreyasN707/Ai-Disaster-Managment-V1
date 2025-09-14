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

module.exports = router;

const router = require('express').Router();
const validate = require('../middlewares/validate');
const publicValidation = require('../validators/public.validation');
const publicController = require('../controllers/public.controller');

router.get('/alerts', publicController.getAlerts);
router.get('/info', publicController.getInfo);
router.post('/subscribe', validate(publicValidation.subscribe), publicController.subscribe);

module.exports = router;

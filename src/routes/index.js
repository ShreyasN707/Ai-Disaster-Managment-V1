const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/public', require('./public.routes'));
router.use('/admin', require('./admin.routes'));
router.use('/operator', require('./operator.routes'));
router.use('/ml', require('./ml.routes'));

module.exports = router;

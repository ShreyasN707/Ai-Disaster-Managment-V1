const router = require('express').Router();
const validate = require('../middlewares/validate');
const rateLimiter = require('../middlewares/rateLimiter');
const { authenticate } = require('../middlewares/auth');
const authValidation = require('../validators/auth.validation');
const authController = require('../controllers/auth.controller');

router.post('/register', rateLimiter.authLimiter, validate(authValidation.register), authController.register);
router.post('/login', rateLimiter.authLimiter, validate(authValidation.login), authController.login);
router.get('/me', authenticate, authController.me);

module.exports = router;

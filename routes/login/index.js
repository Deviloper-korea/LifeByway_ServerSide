var express = require('express');
var router = express.Router();
var signup = require('./signup');
var logout = require('./logout');
var signin = require('./signin');

router.use('/signup',signup);
router.use('/logout',logout);
router.use('/signin',signin);

module.exports = router;

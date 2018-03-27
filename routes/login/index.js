var express = require('express');
var router = express.Router();
var signup = require('./signup');
var logout = require('./logout');
var signin = require('./signin');
var stamp = require('./stamp');

router.use('/signup',signup);
router.use('/logout',logout);
router.use('/signin',signin);
router.use('/stamp',stamp);

module.exports = router;

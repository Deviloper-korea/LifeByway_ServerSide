var express = require('express');
var router = express.Router();
var signup = require('./signup');
var logout = require('./logout');
var signin = require('./signin');
var findid = require('./findid');
var findpwd = require('./findpwd');

router.use('/signup',signup);
router.use('/logout',logout);
router.use('/signin',signin);
router.use('/id', findid);
router.use('/newpwd', findpwd);

module.exports = router;

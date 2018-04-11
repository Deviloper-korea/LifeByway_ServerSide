var express = require('express');
var router = express.Router();

var fromcal = require('./fromcal');
var getreview = require('./getreview');
var mainpage = require('./mainpage');



router.use('/fromcal', fromcal);
router.use('/getreview', getreview);
router.use('/mainpage', mainpage);

module.exports = router;

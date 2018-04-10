var express = require('express');
var router = express.Router();

var fromcal = require('./fromcal');
var getreview = require('./getreview');
var stamp = require('./stamp');



router.use('/fromcal', fromcal);
router.use('/getreview', getreview);
router.us('/stamp', stamp);

module.exports = router;

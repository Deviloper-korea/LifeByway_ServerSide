var express = require('express');
var router = express.Router();
var todayS = require('./todayS');
var byDate = require('./byDate');
var writeRev = require('./writeRev');
var getreview = require('./getreview');

router.use('/todayS',todayS);
router.use('/byDate',byDate);
router.use('/writeRev',writeRev);
router.use('/getreview',getreview);

module.exports = router;

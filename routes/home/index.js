var express = require('express');
var router = express.Router();
var todayS = require('./todayS');
var byDate = require('./byDate');
var writeRev = require('./writeRev');


router.use('/todayS',todayS);
router.use('/byDate',byDate);
router.use('/writeRev',writeRev);

module.exports = router;

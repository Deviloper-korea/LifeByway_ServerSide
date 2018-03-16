var express = require('express');
var router = express.Router();
var todayS = require('./todayS');
var byDate = require('./byDate');

router.use('/todayS',todayS);
router.use('/byDate',byDate);

module.exports = router;

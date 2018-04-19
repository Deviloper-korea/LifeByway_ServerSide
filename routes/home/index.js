var express = require('express');
var router = express.Router();

var byDate = require('./byDate');
var writeRev = require('./writeRev');



router.use('/byDate',byDate);
router.use('/writeRev',writeRev);

module.exports = router;

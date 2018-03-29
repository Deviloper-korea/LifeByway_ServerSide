var express = require('express');
var router = express.Router();
var getreview = require('./getreview');
var stamp = require('./stamp');

router.use('/getreview',getreview);
router.use('/stamp',stamp);

module.exports = router;

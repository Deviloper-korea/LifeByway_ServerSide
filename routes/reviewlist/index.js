var express = require('express');
var router = express.Router();

var getsubject = require('./getsubject');



router.use('/subject', getsubject);


module.exports = router;

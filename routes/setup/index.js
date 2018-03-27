var express = require('express');
var router = express.Router();
var recommand = require('./recommand');

router.use('/recommand',recommand);


module.exports = router;

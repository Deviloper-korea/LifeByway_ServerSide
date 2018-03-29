var express = require('express');
var router = express.Router();
var recommand = require('./recommand');
var loadData = require('./loadData');
var modifyData = require('./modifyData');

router.use('/recommand',recommand);
router.use('/loadData',loadData);
router.use('/modifyData',modifyData);

module.exports = router;

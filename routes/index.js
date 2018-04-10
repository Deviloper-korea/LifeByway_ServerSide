var express = require('express');
var router = express.Router();
var login = require('./login/index');
var home = require('./home/index');
var setup = require('./setup/index');
var reviews = require('./reviewlist/index');

router.use('/login', login);
router.use('/home', home);
router.use('/setup', setup);
router.use('/reviewlist', reviews);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;

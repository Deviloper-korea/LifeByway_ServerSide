var express = require('express');
var router = express.Router();
var login = require('./login/index');
var home = require('./home/index');
var setup = require('./setup/index');

router.use('/login', login);
router.use('/home', home);
router.use('/setup', setup);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;

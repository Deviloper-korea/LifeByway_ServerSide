const express = require('express');
const router = express.Router();
//const pool = require('../../config/dbpool.js');

const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const async = require('async');
const middle = require('../../middlewares/auth.js');


router.use('/', middle);

router.get('/', (req, res) =>{
 
});

module.exports = router;

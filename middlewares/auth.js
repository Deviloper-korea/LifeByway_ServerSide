const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const async = require('async');
const secret = require('../config/secret.js')

const middleware = (req, res, next)=>{

var tasks = [
  function (callback){
    const token = req.headers['token'] || req.query.token;

    if(!token){
      res.status(403).send({

        stat: 'no token'
      });

      return callback(err);

    }else {
      callback(null, token);
    }
  },
  function(token, callback)
  {
    jwt.verify(token, secret, (err, decoded)=>{
      if(err)
      {   //response를 하고 나서는 헤더에 무엇을 실을수 없다.
        // res.status(403).send({
        //   stat: 'invalid'
        // });

        return callback(err);
      }
      else {
        console.log('valid');
        callback(null, decoded);
      }
    });
  }
];

  async.waterfall(tasks, (err, decoded)=>{
    if(err)
    {
      console.log('err');
      req.stat = 'invalid';
      next();
    }
    else {
      console.log('done');
      req.decoded = decoded;
      next();
    }
  });
};

//module.exports = router;
module.exports = middleware;

const express = require('express');
const router = express.Router();
const async = require('async');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const pool = require('../../config/dbpool');
const mailconnect = require('../../config/mailconnect');

var smtpTransport = nodemailer.createTransport({
  mailconnect
});

router.get('/', function(req, res){
  console.log('get');

tasks = [

  function(callback){

    pool.getConnection((err, connection)=>{

        if(err){
          res.status(500).send({
            stat: 'fail'
          });

          return(callback);
        }
        else{
          callback(null, connection);

        }
    });
  },

  function(connection, callback){
      var query = 'select id from user where email = ?';

      connection.query(query, [req.headers['email']], (err, rows)=>{
          if(err){

            res.status(500).send({
              stat: 'fail'
            });
            connection.release();
            return(callback);

          }
          else if(!rows.length){

            res.status(501).send({
              stat: 'no data'
            });
            connection.release();
          }
          else{
            callback(null, rows[0].id);

          }
      });
  },

  function(id, callback){
    console.log(id);
    var mailOptions ={
      from: 'nohkojang@gmail.com',
      to: req.headers['email'],
      subject: '아이디 찾기',
      text: id
    };

    smtpTransport.sendMail(mailOptions, (err, info)=>{

      if(err){
        console.log(err);

        res.status(500).send({
          stat: 'fail'
        });
      }

      else{
        console.log(info);

        res.status(201).send({
          stat: 'success'
        });
      }
        smtpTransport.close();
    });

  }
]

async.waterfall(tasks, function(err){
  if(err){
    console.log('err');
  }
  else{
    console.log('done');
  }
});

});


module.exports = router;

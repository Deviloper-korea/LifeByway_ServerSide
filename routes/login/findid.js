const express = require('express');
const router = express.Router();
const async = require('async');
const nodemailer = require('nodemailer');
const sesTransport = require('nodemailer-ses-transport');
const crypto = require('crypto');
const pool = require('../../config/dbpool');
const sescred = require('../../config/ses_config');
var aws = require('aws-sdk');
aws.config.update({region:'us-east-1'});

var ses = new aws.SES({'accessKeyId': sescred.accessKeyId, 'secretAccessKey': sescred.secretAccessKey});


router.get('/', function(req, res){
  console.log('get');

tasks = [

  function(callback){

    pool.getConnection((err, connection)=>{

        if(err){
          res.status(500).send({
            stat: 'db connection fail'
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
              stat: 'select query fail'
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

    // var mailOptions = {
    //   from: 'nogoto@naver.com',
    //   to: 'nogoto@naver.com',
    //   subject: 'ssibal'
    // }
    // var mailOptions ={
    //   from: 'nogoto@naver.com',
    //   to: req.headers['email'],
    //   subject: '아이디 찾기',
    //   text: id
    // };


    var eparam = {
      Destination: {
        ToAddresses: [req.headers['email']]
      },
      Message: {
           Body: {

             Text: {
               Data: id
             }
           },
           Subject: {
             Data: "Find Id"
           }
         },
         Source: 'nogoto@naver.com',
         ReplyToAddresses: ['nogoto@naver.com'],
         ReturnPath: 'nogoto@naver.com'
      }


    ses.sendEmail(eparam, function (err, data) {

      if(err){
        console.log(err);

        res.status(500).send({
          stat: 'send mail fail'
        });
      }

      else{
        console.log(data);

        res.status(201).send({
          stat: 'success'
        });
      }

    });
  }
]

async.waterfall(tasks, function(err){
  if(err){
    console.log(err);
  }
  else{
    console.log('done');
  }
});

});


module.exports = router;

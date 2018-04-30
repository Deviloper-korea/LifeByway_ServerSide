const express = require('express');
const router = express.Router();
const pool = require('../../config/dbpool.js');
const mysql = require('mysql');
const async = require('async');
const randomstring = require('randomstring');
const jwt = require('jsonwebtoken');
const sescred = require('../../config/ses_config');
var aws = require('aws-sdk');
aws.config.update({region:'us-east-1'});

var ses = new aws.SES({'accessKeyId': sescred.accessKeyId, 'secretAccessKey': sescred.secretAccessKey});

router.get('/', function(req, res){
        console.log('get');

 var tasks = [

    function(callback)
    {
      pool.getConnection((err, connection)=> {

      if(err){

        res.status(500).send(
          {
            stat:'fail'
          }
        );

        return callback(err);

      }
      else {
        callback(null, connection);
      }
    })
  },

    function(connection, callback){ //임시비밀번호 생성하고 email,id 대조

      var random = randomstring.generate({
        length: 12,
        charset: 'alphanumeric'
      });

      callback(null, random, connection);
    },

     function(random, connection, callback){

    console.log(random);
    var query = 'select id from user where email = ?';
       connection.query(query, [req.headers['email']], (err, rows) =>
       {
         if(err)
         {
           res.status(500).send({
             stat: 'err'

           });
           connection.release();
           return callback(err);
         }
         else if(!rows.length)
         {
           res.status(501).send({
             stat: 'no data'
           });
           connection.release();
         }
         else {
           console.log(rows[0].id);

           if(rows[0].id === req.headers['id']){

             console.log('correct');
             callback(null, random, connection);

           }
           else{

             res.status(502).send({
               stat: 'not correct'
             });
             connection.release();

           }
         }
     });
   },

   function(random, connection, callback){  //임시비밀번호로 수정
       var query = 'update user set password = ? where id = ?';
       console.log(random);
       connection.query(query, [random, req.headers['id']], (err, rows)=>{
           if(err){

             res.status(500).send({
               stat: 'fail'
             });

             connection.release();
             return(callback, random);

           }
           else{
              connection.release();
              callback(null, random);
           }
       });
  },

   function(random){ //임시비밀번호 메일로 전송
     console.log('sendmail');

     var eparam = {
       Destination: {
         ToAddresses: [req.headers['email']]
       },
       Message: {
            Body: {

              Text: {
                Data: random
              }
            },
            Subject: {
              Data: "Find Password"
            }
          },
          Source: 'nogoto@naver.com',
          ReplyToAddresses: ['nogoto@naver.com'],
          ReturnPath: 'nogoto@naver.com'
       }


     ses.sendEmail(eparam, function (err, data){

       if(err){
         console.log(err);

         res.status(500).send({
           stat: 'fail'
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
       console.log('err');
     }
     else{
       console.log('done');
     }
   });

 });



module.exports = router;

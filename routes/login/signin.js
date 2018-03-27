const express = require('express');
const router = express.Router();
const pool = require('../../config/dbpool.js');

const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const async = require('async');

const secret = require('../../config/secret.js');


router.post('/', function(req, res, next){
    console.log('post');
    pool.getConnection((err, connection)=> {
         console.log('connection');

          if(err){
          console.log('connection error');
            res.status(500).send(
              {
                stat: 'fail'
              }
            );

          }
          else {
        console.log('connection success');
            let query = "select * from user where id = ? and password = ?";

            connection.query(query, [req.get('id'), req.get('password')], (err, rows) =>{

              if(err){
                console.log('select fail');
                res.status(500).send(
                  {
                    stat: 'fail'
                  }
                );
                  connection.release();
              }
              else {

                var token = jwt.sign(
                             {
                               id: rows[0].id,
                               nickname: rows[0].nickname,
                               user_id: rows[0].user_id

                             },
                             secret,
                             {
                               expiresIn: '7d',
                               issuer: 'deviloper',
                               subject :'userinfo'
                             });

                            res.send(


                               token

                            );
                            connection.release();
              }
            });
          }
        });
      });



   //
   // var tasks=[
   //   function(callback) {
   //    pool.getConnection((err, connection)=>{
   //      if(err){
   //      connection.release();
   //        return callback(err);
   //
   //      }
   //      else {
   //
   //        callback(null, connection);
   //
   //      }
   //    });
   //  },
   //
   //  function(connection, callback){
   //
   //    console.log('connection success');
   //        let query = "select * from user where id = ? and password = ?";
   //        connection.query(query, [req.body.id, req.body.pwd], (err, rows)=>{
   //
   //          if(err)
   //          {
   //            connection.release();
   //            return callback(err);
   //          }
   //
   //          else {
   //
   //            var token = jwt.sign(
   //                         {
   //                           id: rows[0].id,
   //                           nickname: rows[0].nickname
   //                         },
   //                          secret,
   //                         {
   //                           expiresIn: '7d',
   //                           issuer: 'deviloper',
   //                           subject :'userinfo'
   //                         });
   //
   //                        res.send(
   //
   //
   //                           token
   //
   //                        );
   //                        connection.release();
   //            callback(null)
   //          }
   //
   //        });
   //  }
   // ];
   //
   // async.waterfall(tasks, function(err){
   //  if(err)
   //  {
   //      console.log('err');
   //      res.send({stat:err});
   //  }
   //  else{
   //     console.log('done');
   //  }
//
  //
  // });
  //   });

module.exports = router;

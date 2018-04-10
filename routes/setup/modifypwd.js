const express = require('express');
const router = express.Router();
const async = require('async');
const pool = require('../../config/dbpool');
const middle = require('../../middlewares/auth.js');


router.use('/', middle);


router.put('/', function(req, res){
  console.log('put');

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
      var query = 'update user set password = ? where id = ?';

      connection.query(query, [req.body.pwd, req.decoded.id], (err, rows)=>{
          if(err){

            res.status(500).send({
              stat: 'fail'
            });
            connection.release();
            return(callback);

          }
          else{
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

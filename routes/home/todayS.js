const express = require('express');
const router = express.Router();
const pool = require('../../config/dbpool');
//callback함수
const async = require('async');


/*오늘의 미션*/
router.post('/', function(req, res, next) {
  let taskArray = [
    (callback) => {
      pool.getConnection((err, connection) => {
        if(err) {
          connection.release();
          res.status(500).send({
            stat:'fail'
          });
          callback("errer"+err, null);
        }else{
          callback(null, connection);
        }
      });
    },

    (connection, callback) => {
      let selectquery = "select contents from subject where date = ?;";
      connection.query(selectquery,[req.body.date],(err,rows) =>{
        if(rows[0] == null){
          res.status(501).send({
            stat:'no contents'
          });
          connection.release();
          callback("errer"+err, null);
        }else{
          callback(null, connection, rows);
        }
      });
    },

    (connection, rows, callback) => {
      res.status(201).send({
        stat:"success",
        data: rows[0].contents
      });
      connection.release();
      callback(null, null);
    }
  ];

  async.waterfall(taskArray, (err, result) => {
     if(err) console.log(err);
     else console.log(result);
  });
});


module.exports = router;

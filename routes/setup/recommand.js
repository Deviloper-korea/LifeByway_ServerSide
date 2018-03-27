const express = require('express');
const router = express.Router();
const pool = require('../../config/dbpool');
//callback함수
const async = require('async');
//토큰 사용
const middle = require('../../middlewares/auth.js');
router.use('/', middle);

/*미션 제안*/
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
      let insertquery = "insert into recommand(content, user_id) values(?, ?);";
      // var id = req.decoded.user_id;
      connection.query(insertquery,[req.body.content, req.decoded.user_id],(err,rows) =>{
        if(err){
          res.status(501).send({
            stat:'not available'
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
        data:{
          "id": req.decoded.user_id,
          "content" : req.body.content
        }
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

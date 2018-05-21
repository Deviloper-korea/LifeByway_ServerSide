const express = require('express');
const router = express.Router();
const pool = require('../../config/dbpool');
//callback함수
const async = require('async');
//토큰 사용
const middle = require('../../middlewares/auth.js');
router.use('/', middle);

/*회원정보 수정 페이지 - 사진, 닉네임, 레벨 불러오기*/
router.post('/', function(req, res, next) {
  let taskArray = [
    (callback) => {
      pool.getConnection((err, connection) => {
        if(err) {
          connection.release();
          res.status(500).send({
            stat:'fail'
          });
          callback("error"+err, null);
        }else{
          callback(null, connection);
        }
      });
    },

    (connection, callback) => {
      let selectquery = "select * from user where user_id = ?;";
      connection.query(selectquery,[req.decoded.user_id],(err,userInfo) =>{
        if(userInfo[0] == null){
          res.status(501).send({
            stat:'no contents'
          });
          connection.release();
          callback("error"+err, null);
        }else{
          callback(null, connection, userInfo);
        }
      });
    },

    (connection, userInfo, callback) => {
      res.status(201).send({
        stat:"success",
        data:{
          "userInfo": userInfo[0],
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

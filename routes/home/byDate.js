const express = require('express');
const router = express.Router();
const pool = require('../../config/dbpool');
var math = require('mathjs');

//callback함수
const async = require('async');


//랜덤 함수
// function getRandomInt(min, max) { //min ~ max 사이의 임의의 정수 반환
// return math.floor(math.random() * (max - min)) + min;
// }

/*날짜별 미션과 후기*/

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
      let selectquery = "select * from subject where date = ?;";
      connection.query(selectquery,[req.body.date],(err,subject) =>{
        if(subject[0] == null){
          res.status(501).send({
            stat:'no contents'
          });
          connection.release();
          callback("error"+err, null);
        }else{
          callback(null, connection, subject);
        }
      });
    },

    (connection, subject, callback) => {
      let countquery = "select count(review_id) as cnt from review where subject_id = ?;";
      connection.query(countquery,[subject[0].subject_id],(err,count) =>{
        if(count[0].cnt == 0){ //후기 없음
          res.status(502).send({
            stat:'no reviews'
          });
          connection.release();
          callback("errer"+err, null);
        }else{
          callback(null, connection, subject, count);
        }
      });
    },

    (connection, subject, count, callback) => {
      var info = new Array(10);
      var num = new Array(count[0].cnt);
      let selectquery = "select user.id, user.nickname, user.imgLink, user.level, review.comment, review.date from user inner join review on user.user_id = review.user_id where subject_id = ?;";
      connection.query(selectquery,[subject[0].subject_id],(err,rows) =>{
        if(count[0].cnt < 10){ //1~10 보내줌
          for(let i=0; i < count[0].cnt; i++){
            info[i] = rows[i];
          }
          callback(null, connection, subject, info, rows, num);
        }else{//랜덤으로 10개의 숫자 뽑아서 보내줌
          for(let i=0; i < 10; i++){
            num[i] = Math.floor(Math.random() * (count[0].cnt-1));
            //getRandomInt(0, count.cnt-1);

            //중복체크
            for(var j=0; j<i; j++){
              if(num[i] == num[j]){
                  i = i - 1;
                  break;
              }
            }

          }

          for(let i = 0; i < 10; i++){
            info[i] = rows[num[i]];
          }
          callback(null, connection, subject, info, rows, num);
        }
      });
    },

    (connection, subject, info, rows, num, callback) => {
      res.status(201).send({
        stat:"success",
        data:{
          "subject": subject[0],
          "comments" : info
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

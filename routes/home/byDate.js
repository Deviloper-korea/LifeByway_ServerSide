const express = require('express');
const router = express.Router();
const pool = require('../../config/dbpool');
var math = require('mathjs');

//callback함수
const async = require('async');
//파일 업로드용 미들웨어(S3에 업로드)
// const multer = require('multer');
// const multerS3 = require('multer-s3');
// const aws = require('aws-sdk');
// aws.config.loadFromPath('./config/aws_config.json');
// const s3 = new aws.S3();
// const upload = multer({
//   storage: multerS3({
//     s3 : s3,
//     bucket: 'uniquename1234', //버킷 설정
//     acl: 'public-read', //권한 설정
//     key: function(req, file, cb) { //업로드할 파일 이름 설정
//       cb(null, Date.now() + '.' + file.originalname.split('.').pop());//저장되는 이름 설정
//     }
//   })
// });


//랜덤 함수
// function getRandomInt(min, max) { //min ~ max 사이의 임의의 정수 반환
// return math.floor(math.random() * (max - min)) + min;
// }

/*날짜별 미션과 후기*/

/*파일 업로드
  여러 개의 파일을업로드-> array 사용, 두 번째 인자로 파일의 갯수 명시, req.files[i].location으로 링크 받아옴
  하나의 파일 -> single, req.file.location으로 파일 링크 받아옴
*/
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
      let selectquery = "select subject_id, contents from subject where date = ?;";
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
      var info = new Array(5);
      var num = new Array(count[0].cnt);
      let selectquery = "select user.nickname, review.comment from user inner join review on user.user_id = review.user_id where subject_id = ?;";
      connection.query(selectquery,[subject[0].subject_id],(err,rows) =>{
        if(count[0].cnt < 5){ //1~5 보내줌
          for(let i=0; i < count[0].cnt; i++){
            info[i] = rows[i];
          }
          callback(null, connection, subject, info, rows, num);
        }else{//랜덤으로 5개의 숫자 뽑아서 보내줌
          for(let i=0; i < 5; i++){
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

          for(let i = 0; i < 5; i++){
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
          "contents": subject[0].contents,
          "array" : info
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

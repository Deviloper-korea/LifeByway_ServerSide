const express = require('express');
const router = express.Router();
const pool = require('../../config/dbpool');
//암호화
const crypto = require('crypto');
//callback함수
const async = require('async');
//파일 업로드용 미들웨어(S3에 업로드)
const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
aws.config.loadFromPath('./config/aws_config.json');
const s3 = new aws.S3();
const upload = multer({
  storage: multerS3({
    s3 : s3,
    bucket: 'lifebyway', //버킷 설정
    acl: 'public-read', //권한 설정
    key: function(req, file, cb) { //업로드할 파일 이름 설정
      cb(null, Date.now() + '.' + file.originalname.split('.').pop());//저장되는 이름 설정
    }
  })
});

/*회원가입 페이지*/

/*파일 업로드
  여러 개의 파일을업로드-> array 사용, 두 번째 인자로 파일의 갯수 명시, req.files[i].location으로 링크 받아옴
  하나의 파일 -> single, req.file.location으로 파일 링크 받아옴
*/
router.post('/',upload.single('image'), function(req, res, next) {
// router.post('/', function(req, res, next) {
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
      crypto.randomBytes(32, function(err, buffer){
        if(err){
          res.status(500).send({
            stat:'fail'
          });
          connection.release();
          callback("error"+err, null);
        }else{
            callback(null, connection, buffer);
        }
      });
    },

    (connection, buffer, callback) => {
      let insertquery = "insert into user(id,nickname,imgLink,password) values (?,?,?,?);";
      connection.query(insertquery,[req.get('id'), req.body.nickname,req.file.location, req.get('password')],(err,rows) =>{
      // connection.query(insertquery,[req.get('id'), req.body.nickname,req.body.imgLink, req.get('password')],(err,rows) =>{
        if(err){
          res.status(501).send({
            stat:'not available'
          });
          connection.release();
          callback("errer"+err, null);
        }else{
          callback(null, connection, buffer, rows);
        }
      });
    },

    (connection, buffer, rows, callback) => {
      res.status(201).send({
        stat:"success",
        data:{
          "id": req.get('id'),
          "nickname" : req.body.nickname,
          "profileImg": [req.file.location] //파일 링크
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

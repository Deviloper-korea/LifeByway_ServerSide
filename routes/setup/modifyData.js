const express = require('express');
const router = express.Router();
const pool = require('../../config/dbpool');
//callback함수
const async = require('async');
//토큰 사용
const middle = require('../../middlewares/auth.js');
router.use('/', middle);
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

/*회원정보 수정 페이지 - 닉네임, 사진, 패스워드 변경*/

router.post('/', upload.single('image'), function(req, res, next) {
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
      let updatequery = "update user set nickname = ?, imgLink = ?, password = ? where user_id = ?;";
      connection.query(updatequery,[req.body.nickname, req.body.imgLink, req.get('password'), req.decoded.user_id],(err,rows) =>{
      // connection.query(selectquery,[req.body.nickname, req.body.profileImg, req.file.location, req.get('password'), req.decoded.user_id],(err,rows) =>{
        if(err){
          res.status(501).send({
            stat:'update fail'
          });
          connection.release();
          callback("error"+err, null);
        }else{
          callback(null, connection, rows);
        }
      });
    },

    (connection, rows, callback) => {
      res.status(201).send({
        stat:"success",
        data:{
          "rows": rows[0]
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

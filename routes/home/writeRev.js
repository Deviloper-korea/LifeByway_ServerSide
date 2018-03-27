const express = require('express');
const router = express.Router();
const pool = require('../../config/dbpool');
//callback함수
const async = require('async');
//토큰 사용
const middle = require('../../middlewares/auth.js');
router.use('/', middle);
var level = 0;

/*후기 작성*/
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
      connection.query(selectquery ,[req.body.sub_date],(err,subject) =>{
        if(subject[0] == null){
          res.status(501).send({
            stat:'no contents'
          });
          connection.release();
          callback("errer"+err, null);
        }else{
          callback(null, connection, subject);
        }
      });
    },

    (connection, subject, callback) => {
      let insertquery = "insert into review(comment, date, subject_id, user_id) values(?, ?, ?, ?);";
      // let id = req.decoded.user_id;
      console.log(req.decoded.user_id);
      connection.query(insertquery ,[req.body.comment, req.body.today_date, subject[0].subject_id, req.decoded.user_id],(err, review) =>{
        if(err){
          res.status(502).send({
            stat:'not available / review'
          });
          connection.release();
          callback("errer"+err, null);
        }else{
          callback(null, connection, subject, review);
        }
      });
    },

    (connection, subject, review, callback) => {
      let insertquery = "insert into stamp(date, user_id, veryday) values(?, ?, ?);";
      // let id = req.decoded.user_id;
      var veryday = 0;
      if(req.body.today_date == req.body.sub_date) veryday = 1;
      else veryday = 0;
      connection.query(insertquery ,[req.body.sub_date, req.decoded.user_id, veryday],(err,stamp) =>{
        if(err){
          res.status(503).send({
            stat:'not available / stamp'
          });
          connection.release();
          callback("errer"+err, null);
        }else{
          callback(null, connection, subject, review, stamp);
        }
      });
    },

    (connection, subject, review, stamp, callback) => {
      let countquery = "select count(stamp_id) as cnt from stamp where veryday = 1;";
      connection.query(countquery ,[],(err,count) =>{
        if(err){
          res.status(503).send({
            stat:'not available / cnt'
          });
          connection.release();
          callback("error"+err, null);
        }else{
          callback(null, connection, subject, review, stamp, count);
        }
      });
    },

    (connection, subject, review, stamp, count, callback) => {
      let updatequery = "update user set level = ? where user_id = ?;";
      // var level = parseInt(count[0].cnt / 7);
      level = parseInt(count[0].cnt / 7);
      console.log(level);
      connection.query(updatequery ,[level, req.decoded.user_id],(err,count) =>{
        if(err){
          res.status(503).send({
            stat:'not available / level'
          });
          connection.release();
          callback("error"+err, null);
        }else{
          callback(null, connection, subject, review, stamp, count);
        }
      });
    },

    (connection, subject, review, stamp, count, callback) => {
      res.status(201).send({
        stat:"success",
        data:{
          "id": req.decoded.user_id,
          "subject" : subject,
          "review" : req.body.comment,
          "date" : req.body.today_date,
          "level" : level
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

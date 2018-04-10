const express = require('express');
const router = express.Router();
const pool = require('../../config/dbpool.js');
const mysql = require('mysql');
const async = require('async');
const middle = require('../../middlewares/auth.js');

//달력에서 해당 날짜클릭했을때 주제와 후기 가져오는 것 *******테스트 완료 
router.use('/', middle);

router.get('/', function(req, res){
        console.log('post');

 var tasks = [

    function(callback)
    {
      pool.getConnection((err, connection)=> {

      if(err){

        res.status(500).send(
          {
            stat:'fail'
          }
        );

        return callback(err);

      }
      else {
        callback(null, connection);
      }
    })
  },

    function(connection, callback){
      var selectquery = "select subject_id, contents from subject where date = ?";

      connection.query(selectquery, [req.headers['date']], (err, rows)=>{
        if(err){
            res.send({
              stat: 'err'
            })

            return callback(err);
        }
        else if(!rows.length){
              res.send({
                stat: 'no data'
              })
          }
        else {
            console.log(rows[0]);
            callback(null, rows[0].subject_id, rows[0].contents, connection);

        }

      });
    },

     function(s_id, contents, connection, callback){


    //let selectquery = "select r.comment, u.imgLink, s.contents  from review r, subject s, user u where r.subject_id = s.subject_id and r.user_id = u.user_id and s.subject_id = ? order by r.review_id desc limit 2 offset ?";
    var selectquery = "select comment from review where subject_id = ? and user_id =?" ;



       connection.query(selectquery, [s_id, req.decoded.user_id], (err, rows) =>
       {
         if(err)
         {
           res.send({
             stat: 'err'

           });
           connection.release();
           return callback(err);
         }

         else if(rows.length > 0) {
          console.log(rows);

           res.send(
              {
               subject: contents,
               comment: rows[0].comment
              }
           );

           connection.release();
         }
         else{
           res.send({
             stat: 'no data'

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

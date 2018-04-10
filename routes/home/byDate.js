const express = require('express');
const router = express.Router();
const pool = require('../../config/dbpool');
const math = require('mathjs');


//callback함수
const async = require('async');
const dateFormat = require('dateformat');

//랜덤 함수
// function getRandomInt(min, max) { //min ~ max 사이의 임의의 정수 반환
// return math.floor(math.random() * (max - min)) + min;
// }
// VOLUME /var/lib/node
// VOLUME /root/.pm2
/*날짜별 미션과 후기*/

router.get('/', function(req, res, next) {

  let taskArray = [
    function(callback){
      pool.getConnection((err, connection) => {
        if(err) {
          connection.release();
          res.status(500).send({
            stat:'connection fail'
          });
          callback("errer"+err, null);
        }else{
          callback(null, connection);
        }
      });
    },

    function(connection, callback) {
      let selectquery = "select * from subject order by subject_id limit 7;";
      connection.query(selectquery,[], (err, subjects) =>{
        if(err){
          res.status(500).send({
            stat: 'select query fail'
          })
          return callback(err);
        }
        else if(!subjects.length){
          res.status(501).send({
            stat: 'no subjects'
          });
        }
        else
        {
          console.log(subjects);
          callback(null, connection, subjects, callback);
        }
      });
    },

    function(connection, subjects, callback){
      console.log('second callback');
      var bundles = [];

      var load = function(index){  //load 재귀 호출 정의

        var subject = subjects[index]; //하나 추출
        var reviews = [];
        console.log(subject);

        //var count = checkcount(subject);

        // var info = new Array(10);
        //
        //    var num = new Array(count);
         var info = [];
         var num = [];

         var countquery = "select count from reviewcount where subject_id = ?";
         connection.query(countquery, [subject.subject_id], (err, count) =>{
           console.log('checkcount query');
           if(err){
               console.log('checkcount error');
             res.status(500).send({
               stat: 'select query fail'
             });
             connection.release();
             callback("errer"+err, null);

           }
           else if(count[0] == 0)
           {
             console.log('checkcount 0');

             var bundle = {
               subject: {
                 'subject_id': subjects[index].subject_id,
                 'contents': subjects[index].contents,
                 'date' : dateFormat(subjects[index].date, 'yyyy-mm-dd')
               },
               reviews: reviews
             };

             bundles.push(bundle);

             load(index + 1);
           }
           else{

               let selectquery = "select user.id, user.nickname, user.imgLink, user.level, review.comment, review.date from user inner join review on user.user_id = review.user_id where subject_id = ?;";
               console.log('subject id: '+ subject.subject_id);

               var count = count[0].count;
               console.log(count);
               connection.query(selectquery, [subject.subject_id],(err,rows) =>{
                 console.log(rows);

                 if(count < 10){ //10보다 작으면 갯수만큼 보내줌

                   for(let i=0; i < count; i++){
                     //info.push(rows[i]);
                     info[i] = rows[i];
                   }
                 }
                 else{     //랜덤으로 10개의 숫자 뽑아서 보내줌 10개보다 이상일때
                   for(let i=0; i < count; i++){
                     num[i] = Math.floor(Math.random() * (count-1));
                     //getRandomInt(0, count.cnt-1);
                     //중복체크
                     for(var j=0; j<i; j++){
                       if(num[i] == num[j]){
                           i = i - 1;
                           break;
                       }
                     }
                   }

                   for(let i = 0; i < count; i++){
                     info[i] = rows[num[i]];
                   }

                 }
                 console.log(info);



                 for(let i =0; i < count; i++){
                    var tempinfo = info[i];

                    var user ={
                        'id': tempinfo.id,
                        'nickname': tempinfo.nickname,
                        'imgLink': tempinfo.imgLink,
                        'level': tempinfo.level
                    };

                    var review = {
                      'comment': tempinfo.comment,
                      'date': dateFormat(tempinfo.date, 'yyyy-mm-dd')
                    };

                    var bundle = {
                      'user': user,
                      'review': review,
                    }

                    reviews.push(bundle);

                 }

                 var bundle = {
                   subject: {
                     'subject_id': subjects[index].subject_id,
                     'contents': subjects[index].contents,
                     'date' : dateFormat(subjects[index].date, 'yyyy-mm-dd')
                   },
                   reviews: reviews
                 };

                 bundles.push(bundle);


                 if(!subjects[index+1])
                 {
                   res.status(201).send({
                     stat: 'success',
                     data: bundles
                   });

                   connection.release();

                 }
                 else{
                   load(index + 1);
                 }

               });
           }
         });
       };

         if(subjects.length>0){
           console.log('재귀시작');
           load(0);

           console.log('재귀끝');
         }

       }
      ]

  async.waterfall(taskArray, (err, result) => {
     if(err) console.log(err);
     else console.log('done');
  });
});


module.exports = router;

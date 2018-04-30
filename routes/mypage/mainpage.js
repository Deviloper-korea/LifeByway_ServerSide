const express = require('express');
const router = express.Router();
const pool = require('../../config/dbpool.js');
const mysql = require('mysql');
const async = require('async');
const middle = require('../../middlewares/auth.js');
const dateFormat = require('dateformat');

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
            stat:'connection fail'
          }
        );
        return callback(err);
      }
      else {
        callback(null, connection);
      }
    });
  },

     function(connection, callback){ //select from subject

       var selectquery = 'select * from subject where YEAR(date) = ? and MONTH(date) = ? order by subject_id';


       connection.query(selectquery, [req.headers.year, req.headers.month], (err, subjects) =>
       {
             console.log(subjects);

         if(err)
         {
           res.status(500).send({
             stat: 'query err1'
           });
           connection.release();
           return callback(err);
         }

        else if(!subjects.length)
        {
          res.status(501).send({
            stat: 'no data'
          });
          connection.release();
          return callback(null);
        }
        else{
          callback(null, connection, subjects)
         }
     });
   },

   function(connection, subjects, callback){ //select from review

     var selectquery = 'select r.user_id, s.stamp_id, s.date, s.veryday, r.review_id, r.comment, r.subject_id from review r inner join stamp s on r.subject_id = s.subject_id where r.user_id = ? and r.subject_id between ? and ?';

     connection.query(selectquery, [req.decoded.user_id, subjects[0].subject_id, subjects[subjects.length-1].subject_id], (err, joindatas) =>
     {
           console.log(joindatas);
           let bundles = [];
       if(err)
       {
         res.status(500).send({
           stat: 'query err2'
         });
         connection.release();
         return callback(err);
       }

      else if(!joindatas.length)
      {
        res.status(501).send({
          stat: 'no data'
        });
        //
        // for(int i=0 ; i < subjects[i].length; i++)
        // {
        //
        //
        connection.release();
        return callback(null);
      }
      else{
        let bundles = [];
        var slength = subjects.length;
        var jlength = joindatas.length;

        var sindex = 0 ;
        var jindex = 0 ;

        while(sindex !== slength && jindex !== jlength)
        {
          console.log(subjects[sindex].date+' '+joindatas[jindex].date);

          if(dateFormat(subjects[sindex].date, 'yyyy-mm-dd') !== dateFormat(joindatas[jindex].date, 'yyyy-mm-dd') || jindex == jlength)
          {
            console.log('같지않아');
            var bundle ={
              date: dateFormat(subjects[sindex].date, 'yyyy-mm-dd'),

              subject: {
                subject_id: subjects[sindex].subject_id,
                contents: subjects[sindex].contents
              },

              review: {

              }

            };

            bundles.push(bundle);
            sindex++;
          }
          else if(dateFormat(subjects[sindex].date, 'yyyy-mm-dd') === dateFormat(joindatas[jindex].date, 'yyyy-mm-dd'))
          {
            console.log('같아');
            var bundle ={
              date: dateFormat(subjects[sindex].date, 'yyyy-mm-dd'),

              subject: {
                subject_id: subjects[sindex].subject_id,
                contents: subjects[sindex].contents
              },

              review: {
               stamp_id: joindatas[jindex].stamp_id,
               veryday: joindatas[jindex].veryday,
               review_id: joindatas[jindex].review_id,
               comment: joindatas[jindex].comment,

              }

            }


            bundles.push(bundle);
            jindex++;

          }
       }

       res.status(201).send({
         stat : 'success',
        data : bundles

       });

        callback(null)
       }
   });
 },



   // function(connection, subjects, callback)
   // {
   //    let bundles = [];
   //
   //    var load = function(index){
   //
   //      var joindata = joindatas[index];
   //
   //      var selectquery = 'select veryday from stamp where user_id=? and date=?';
   //
   //      connection.query(selectquery, [joindata.user_id, joindata.date], (err, rows)=>{
   //        console.log(rows)
   //        if(err)
   //        {
   //          res.status(500).send({
   //            stat: 'query err'
   //          });
   //          connection.release();
   //          return callback(err);
   //        }
   //        else if(!rows.length){
   //          if(!joindatas[index+1])
   //          {
   //            res.status(201).send({
   //              stat: 'success',
   //              data: bundles
   //            });
   //
   //            connection.release();
   //
   //          }
   //          else{
   //            load(index+1);
   //         }
   //        }
   //        else
   //        {
   //          console.log('stamp 잇음')
   //          var bundle ={
   //            date: dateFormat(joindata.date, 'yyyy-mm-dd'),
   //
   //            subject:{
   //              subject_id : joindata.subject_id,
   //              contents : joindata.contents
   //            },
   //            review :{
   //              review_id : joindata.review_id,
   //              comment : joindata.comment,
   //            },
   //            stamp: rows[0].veryday
   //
   //          }
   //          console.log(bundle);
   //          bundles.push(bundle);
   //
   //    if(!joindatas[index+1])
   //    {
   //      res.status(201).send({
   //        stat: 'success',
   //        data: bundles
   //      });
   //
   //      connection.release();
   //
   //    }
   //    else{
   //      load(index+1);
   //   }
   // }
   //   });
   // }
   // load(0);
   // }
 ];

   async.waterfall(tasks, function(err, callback){
     if(err){
       console.log(err);
     }
     else{
       console.log('done');
     }
   });

 });


module.exports = router;

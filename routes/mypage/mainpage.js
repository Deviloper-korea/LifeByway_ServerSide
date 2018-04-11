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

     function(connection, callback){
       //let selectquery = "select * from review as r join stamp as s on r.user_id = s.user_id where ";
       // var selectquery = 'select * from review where YEAR(date) = ? and MONTH(date) = ?';
       // var selectquery = 'select * from review r, subject s on r.subject_id = s.subject_id where YEAR(date) = ? and MONTH(date) = ?';

       var selectquery = 'select * from review r join subject s on r.subject_id = s.subject_id where r.user_id = ? and YEAR(s.date) = ? and MONTH(s.date) = ?'
       var id = req.decoded.user_id;

       connection.query(selectquery, [id, req.headers.year, req.headers.month], (err, joindatas) =>
       {
             console.log(joindatas);


         if(err)
         {
           res.status(500).send({
             stat: 'query err'
           });
           connection.release();
           return callback(err);
         }

        else if(!joindatas.length)
        {
          res.status(501).send({
            stat: 'no data'
          });
          connection.release();
          return callback(null);
        }
        else{
          callback(null, connection, joindatas)
         }
     });
   },

   function(connection, joindatas, callback)
   {
      let bundles = [];

      var load = function(index){

        var joindata = joindatas[index];

        var selectquery = 'select veryday from stamp where user_id=? and date=?';

        connection.query(selectquery, [joindata.user_id, joindata.date], (err, rows)=>{
          console.log(rows)
          if(err)
          {
            res.status(500).send({
              stat: 'query err'
            });
            connection.release();
            return callback(err);
          }
          else if(!rows.length){
            if(!joindatas[index+1])
            {
              res.status(201).send({
                stat: 'success',
                data: bundles
              });

              connection.release();

            }
            else{
              load(index+1);
           }
          }
          else
          {
            console.log('stamp 잇음')
            var bundle ={
              date: dateFormat(joindata.date, 'yyyy-mm-dd'),

              subject:{
                subject_id : joindata.subject_id,
                contents : joindata.contents
              },
              review :{
                review_id : joindata.review_id,
                comment : joindata.comment,
              },
              stamp: rows[0].veryday

            }
            console.log(bundle);
            bundles.push(bundle);

      if(!joindatas[index+1])
      {
        res.status(201).send({
          stat: 'success',
          data: bundles
        });

        connection.release();

      }
      else{
        load(index+1);
     }
   }
     });
   }
   load(0);
   }
 ];

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

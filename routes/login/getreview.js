const express = require('express');
const router = express.Router();
const pool = require('../../config/dbpool.js');
const mysql = require('mysql');
const async = require('async');
const middle = require('../../middlewares/auth.js');


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
       //let selectquery = "select * from review where review_id in (select review_id from review where user_id = ? order by review_id desc ) ";
       let selectquery = "select * from review where user_id =? order by review_id desc limit 2 offset 2";
        console.log(req.decoded);
       var id = req.decoded.user_id;

    console.log(id);

       connection.query(selectquery, [id, req.headers['offset']], (err, rows) =>
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

           var obj = {
             reviews:[]
           };

           for(var i = 0; i < rows.length; i +=1 )
           {

             obj.reviews.push(
               {
                 comment: rows[i].comment,
                 review_id: rows[i].review_id
               }

             );
           }
           res.send(

               obj

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

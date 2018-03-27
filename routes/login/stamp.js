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
    });
  },

     function(connection, callback){
       let checkquery = "select * from stamp where date = ? and user_id = ?";

       var id = req.decoded.user_id;
    console.log(req.decoded);
    console.log(id);
    console.log(req.headers.date);

       connection.query(checkquery, [req.headers.date, id], (err, rows) =>
       {
             console.log(rows);
             console.log(rows.length);

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
             stamps:[]
           };

           for(var i = 0; i < rows.length; i +=1 )
           {

             obj.stamps.push(
               {
                 date: rows[i].date,
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
             stat: 'nope'

           });
         }
     });
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

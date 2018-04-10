const express = require('express');
const router = express.Router();
const pool = require('../../config/dbpool.js');
const mysql = require('mysql');
const async = require('async');
const middle = require('../../middlewares/auth.js');

//리스트에서 제목 7개 ****
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
      var selectquery = "select subject_id, contents from subject order by subject_id desc limit 7"; //최신자로 7곱개 가져온다 .

      connection.query(selectquery, [], (err, rows)=>{
        if(err)
        {
          res.send({
            stat: 'err'

          });
          connection.release();
          return callback(err);
        }

        else if(!rows.length) {

          res.send({
            stat: 'no data'

          });

        }

        else{
          console.log(rows);

            var data= {
              subjects:[]
            };

            for(var i = 0; i < rows.length; i +=1 )
            {
              data.subjects.push(
               rows[i]
              );
            }

            res.send({
              stat: 'success',
              data: data
            }
          );

            connection.release();
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

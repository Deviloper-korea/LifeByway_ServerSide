const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const async = require('async');
const secret = require('../config/secret.js');

const middleware = (req, res, next)=>{ //이함수는 클라이언트에서 로그인 하고나서
  // 발생하는 모든 request에 대해서 실행되는 함수
  //예를들어 logout.js 들어가보면 router.get 함수 호출 이전에 호출된다.
var tasks=[
//클라이언트의 요청에 대해서 /logout 으로 클라이언트의 요청이 들어온다고 가정
  function (callback){
    const token = req.headers['token'] || req.query.token; //헤더에 포함되어있는 토큰을 검증해야한다.

    if(!token){ //클라이언트 측에서 헤더에 토큰을 포함하지 않고 request했을때
      res.status(403).send({

        stat: 'no token'
      });

      return callback(err);

    }else {
      callback(null, token);
    }
  },
  function(token, callback)
  {
    jwt.verify(token, secret, (err, decoded)=>{ //토큰을 검증하는 과정, 토큰안에는 로그인할때 보내줬던
      // 회원정보가 포함되어있고 검증에 성공하게되면 decoded에 회원정보가 저장된다.
      if(err)
      {

        return callback(err);
      }
      else {
        console.log('valid');
        callback(null, decoded);
      }
    });
  }
];

  async.waterfall(tasks, (err, decoded)=>{
    if(err)
    {
      console.log('err');
      req.stat = 'invalid'; //검증에 실패하면 req.stat invalid를 저장하고,
      next(); // /logout으로 요청이 들어왔다고 가정했을때, next()를 호출하면 아래 코드가 실행됨
    }
    else { //에러가 나지 않으면
      console.log('done');
      req.decoded = decoded; //request.decoded 에 해시된 정보를 넘겨준다.
      next(); // /logout으로 요청이 들어왔다고 가정했을때, next()를 호출하면 아래 코드가 실행되는데

        //router.get('/', (req, res) =>{

        //if(req.stat ==='invalid')    //검증 실패했을때 req.stat= 'invalid' 했기때문에 if문은 참이 된다.
        //{
        //  res.send({
          //  stat : 'logout'
        //  });
       //}
       //});





    }
  });
};

//module.exports = router;
module.exports = middleware;

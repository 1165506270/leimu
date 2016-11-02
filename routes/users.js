var router = require("../routes/index");
//var session = require("express-session");
var connection = require('../routes/db');

//router.use(session({
//  secret:"bilibbili",
//  cookie:{maxAge:60*1000*60*72}
//}))
/* GET users listing. */
//手机端注册
router.get('/mr', function(req, res) {
  res.render('mreg', { title: '注册' });
});
//手机端登录页
router.get('/ml', function(req, res) {
  res.render('mlogin', { title: '登录' });
});
//注册账号是否已被注册验证
router.get('/username',function(req,res){
  console.log(req.query.user);
  connection.query('SELECT username FROM users WHERE username="'+req.query.user+'"',function(err,rows){
    if(err){
      console.log(err);
    }else{
      if(rows.length>0){//当查询结果大于0时，即用户名已被注册，返回1
        res.json({"flag":1});
      }else{
        res.json({"flag":2});//反之返回2
      }
    }
  })
});
router.get("/face",function(req,res){
  req.query.uid = req.query.uid||0;
    connection.query("SELECT face FROM users WHERE uid="+req.query.uid,function(err,rows){
      if(err){
        console.log(err);
      }else{
        if(rows[0]){
          res.json({src:rows[0].face})
        }
      }
    })
});
//电脑端登录页面
//router.get("log",function(req,res){
//  render("login",{title:"登录"})
//})
//电脑端注册页面
//router.get("reg",function(req,res){
//  render("reg",{title:"注册"});
//})
//账户注册成功提交时将信息写入数据库
router.post('/regpost',function(req,res){
  console.log(req.body.username);
  connection.query('INSERT INTO users (username,password) VALUES ("'+req.body.username+'",'+req.body.password+')',function(err,rows){
    if(err){
      console.log("出错了"+err);//当出现错误时输出错误信息，且浏览器端跳转回注册页面
      res.redirect('/users/mr')
    }else{
      res.redirect("/users/ml");//无错误信息是跳转到登录页面
    }

  })
});
//登录请求验证
router.get('/login',function(req,res){
  connection.query("SELECT * FROM  users WHERE username='"+req.query.username+"' AND password="+req.query.password,function(err,rows){
    if(err){
      console.log("出错了"+err);
      res.redirect('/users/ml');
    }else{
      if(rows.length==0){//无匹配项时即表示账号或密码不正确，返回1;
        res.json({"flag":1});
      }else{//反之则登录成功，执行下面的操作
        connection.query("SELECT uid FROM users WHERE username='"+req.query.username+"'",function(err,rows){
          if(err){
            console.log(err);
          }else{
            res.cookie("uid",rows[0].uid,{maxAge:60*1000*60*72});
            req.session.name=req.query.username;//保存session,用来验证登录状态，及用户的辨识
            res.json({"flag":2,name:req.query.username});//返回flag为2，及投稿页面地址由浏览器端的js程序进行跳转
            //res.redirect('/index')
          }
        });
        //res.render('/index',{title:"登录成功"});

      }
    }
  });
});
//用户信息编辑
router.get("/personal",function(req,res){
  //if(req.session.name){
  connection.query("SELECT `name`, `describe`, `birthday`, `address`, `maritalStatus`, `sex`, `face` FROM `users` WHERE `username` = '" + req.session.name+"'",function(err,rows){
    if(err){
      console.log(err)
    }else{
      console.log(rows[0]);
      res.render("personal",{data:rows[0]});
    }
  })
  //}
});
//用户信息保存
router.post("/personal-save",function(req,res){
  var uid = req.body.uid,
      name = req.body.name,
      describe = req.body.describe,
      birthday = req.body.birthday,
      address = req.body.address,
      sex = req.body.sex,
      maritalStatus = req.body.maritalStatus;
  //console.log(req.getPart())
  connection.query( "UPDATE `users` SET `name` = '"+name+"', `describe` = '"+describe+"', `birthday` = '"+birthday+"',  `address` = '"+address+"', `maritalStatus` = '"+maritalStatus+"', `sex` = '"+sex+"' WHERE `users`.`uid` = "+uid,function(err,rows){
    if(err){
      console.log(err);
    }else{
      res.json({});
    }
  });
});
//imageMagick("/1.jpg").resize(100,100,"!").write("/1.jpg",function(err){
//  if(err){
//    console.log(err)
//  }
//})
router.post("/ceshi",multipartMiddleware,function(req,res){
  var des_file = "/leimu/public/face/" + req.files.upfile.originalFilename;//图片文件的保存路径及图片名字
  var uid = req.body.uid;
  connection.query("SELECT face FROM users WHERE uid="+uid,function(err,rows){
    if(err){
      console.log(err);
    }else{
      fs.unlink("/leimu/public/face/"+rows[0].face,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("文件以删除")
        }
      });
      fs.readFile(req.files.upfile.path, function (err, data) {//使用fs模块readFile打开图片文件
        fs.writeFile(des_file, data, function (err) {//用fs.writeFile将图片内容写入指定的路径中
          if (err) {
            console.log("出错了" + err);
          } else{
            var width =parseInt(req.body.width);
            var height =parseInt(req.body.height);
            var top =parseInt(req.body.top);
            var left =parseInt(req.body.left);
            console.log(req.files.upfile.originalFilename+"上传成功",height,width);
            var img = images(des_file);
            images(img,left,top,width,height).resize(220,220).save(des_file,{quality : 100})
            connection.query("UPDATE `users` SET `face` = '"+req.files.upfile.originalFilename+"' WHERE `users`.`uid` = "+uid,function(err,rows){
              if(err){
                console.log("出错了" + err)
              }else{
                res.json("保存成功")
              }
            })
          }
        })
      });
    }
  });
});
//头像
router.get("/touxiang",function(req,res){
  res.render("touxiang",{data:0})
})
//登出操作
router.get("/logout",function(req,res){
  req.session.name=null;//清除服务器储存的session
  res.redirect('/users/ml');//跳转到登录页面
});

module.exports = router;

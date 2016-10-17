var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var session = require("express-session");
var fs = require("fs");
var uid = 0;
var multipart = require('connect-multiparty');//此模块用于帮助上传文件
var multipartMiddleware = multipart();//实例化
router.use(session({
  secret:"bilibbili",
  cookie:{maxAge:60*1000*60*72}
}))
//创建一个connection
var connection = mysql.createConnection({
  host : '127.0.0.1', //主机
  user :'root',//mysql认证用户名
  password : "",//mysql认证用户名密码
  port:'3306',//端口号
  database:'huayou',
})
//创建一个connection
connection.connect(function(err){
  if(err){
    console.log('[query]-:'+err)
  }else{
    console.log("[connection connect succeed")
  }
})
/* GET home page. */
//浏览模式
router.get('/liulan',function(req,res){
  res.render("liulan",{});
})
router.get('/huoqu',function(req,res){
  connection.query("SELECT  url,title,uid FROM tupianku", function (err, rows) {
    if (err) {
      console.log(err);
    } else {
        res.json(rows.reverse().slice(req.query.page*8,req.query.page*8+8));//返回作品页面，传入最新的10张作品信息
    }
  })
})
//首页
//router.get('/', function(req, res, next) {
//  res.render('zuopin');
//});
//手机端注册
router.get('/mr', function(req, res, next) {
  res.render('mreg', { title: '注册' });
});
//手机端登录页
router.get('/ml', function(req, res, next) {
  res.render('mlogin', { title: '登录' });
});
//注册账号是否已被注册验证
router.get('/index',function(req,res){
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
})
//电脑端登录页面
router.get("log",function(req,res){
  render("login",{title:"登录"})
})
//电脑端注册页面
router.get("reg",function(req,res){
  render("reg",{title:"注册"});
})
//账户注册成功提交时将信息写入数据库
router.post('/regpost',function(req,res){
  console.log(req.body.username);
    connection.query('INSERT INTO users (username,password,uid) VALUES ("'+req.body.username+'",'+req.body.password+','+(++uid)+')',function(err,rows){
      if(err){
        console.log("出错了"+err);//当出现错误时输出错误信息，且浏览器端跳转回注册页面
        res.redirect('/mr')
      }else{
        res.redirect("/ml")//无错误信息是跳转到登录页面
      }
    })
})
//登录请求验证
router.get('/login',function(req,res){
  connection.query("SELECT * FROM  users WHERE username='"+req.query.username+"' AND password="+req.query.password,function(err,rows){
    if(err){
      console.log("出错了"+err);
      res.redirect('/ml');
    }else{
      if(rows.length==0){//无匹配项时即表示账号或密码不正确，返回1;
        res.json({"flag":1});
      }else{//反之则登录成功，执行下面的操作
        //res.render('/index',{title:"登录成功"});
        req.session.name=req.query.username;//保存session,用来验证登录状态，及用户的辨识
        res.json({"flag":2,"url":"/user",name:req.query.username})//返回flag为2，及投稿页面地址由浏览器端的js程序进行跳转
        //res.redirect('/index')
      }
    }
  });
})
//登出操作
router.get("/logout",function(req,res){
  req.session.name=null;//清除服务器储存的session
  res.redirect('/ml');//跳转到登录页面
})
//投稿页面
router.get("/user",function(req,res){
  if(req.session.name){//通过session验证请求的浏览器端是否已经登录
    //connection.query("SELECT * FROM contents WHERE username LIKE "+req.session.name,function(err,rows){
    //  if(err){
    //    console.log(err);
    //  }else{
    //    res.render("user",{username:req.session.name,content:rows});
    //  }
    //})
    res.render("tougao");//验证通过时，返回投稿页面
  }else{
    //res.render("mlogin",{title:"登录"});
    res.redirect("/ml");//若未登录则返回登录页面
  }
})
//router.get("/post",function(req,res){
//  res.render("post",{username:req.session.name})
//})
//主页作品页面
router.get("/zhuye",function(req,res){
  if(req.session.name) {//验证用户是否已登录
    //查询数据库，获取数据库中的所有作品图片
    connection.query("SELECT  url,title,uid FROM tupianku", function (err, rows) {
      if (err) {
        console.log(err);
      } else {
        //res.render("user",{username:req.session.name,content:rows});
        res.render("zuopin", {data: rows.slice(-15).reverse()});//返回作品页面，传入最新的15张作品信息
      }
    })
  }else{
    res.redirect("/ml");//验证不通过时跳转到登录页面
  }
})
//投稿页面
router.get("/tougao",function(req,res){
  if(req.session.name) {
    res.render("tougao");
  }else{
    res.redirect("/ml");
  }
})
//投稿功能
router.post("/tougao",multipartMiddleware,function(req,res) {
  console.log(req.files)
  var des_file = "/画友/public/tupianku/" + req.files.img.originalFilename;//图片文件的保存路径及图片名字

  fs.readFile(req.files.img.path, function (err, data) {//使用fs模块readFile打开图片文件
    fs.writeFile(des_file, data, function (err) {//用fs.writeFile将图片内容写入指定的路径中
      if (err) {
        console.log("出错了" + err);
      } else{
        console.log(req.files.img.originalFilename+"上传成功");
      }
    })
  })
  //将作品的标题，说明，投稿时间，用户名信息保存进数据库
  var date = new Date();//投稿的时间
  var time = date.getFullYear() + "-" + date.getMonth() + 1 + "-" + date.getDate() + "&nbsp" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
  connection.query('INSERT INTO tupianku (url,title,time,comment,username) VALUES ("' + req.files.img.originalFilename + '","' + req.body.title + '","' + time + '","' + req.body.comment + '","' + req.session.name + '")', function (err, rows) {
    if (err) {
      console.log("出错了" + err);
      res.redirect('/tougao')//发生错误时跳转回投稿页面
    } else {
      res.render("tiaozhuan");//成功保存后进入跳转页面
    }
  })
})
//信息页测试
router.get("/by*",function(req,res){
  var url = req.url.slice(3);
  connection.query("SELECT * FROM tupianku WHERE uid="+url+"",function(err,rows){
    if(err){
      console.log(err);
    }else{
      res.render("xinxi",{"data":rows[0]})
    }
  })
})
router.get("/comment",function(req,res){
  connection.query("SELECT * FROM comment",function(err,rows){
    if(err){
      console.log(err);
    }else{
      res.json(rows);
    }
  })
})
router.post("/comment/add",function(req,res){
  console.log(req.body.message);
  connection.query('INSERT INTO comment (content,uname,time) VALUES ("'+req.body.message+'","'+req.session.name+'","'+req.body.time+'")',function(err,rows){
      if(err){
        console.log(err);
      }else{
        res.json({});
      }
  })
})
module.exports = router;

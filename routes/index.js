var express = require('express');
var router = express.Router();
var connection = require('../routes/db');
var session = require("express-session");
var images = require("images");
router.use(session({
  secret:"bilibbili",
  cookie:{maxAge:60*1000*60*72}
}))

var fs = require("fs");
var uid = 0;
var multipart = require('connect-multiparty');//此模块用于帮助上传文件
var multipartMiddleware = multipart();//实例化

/* GET home page. */
//浏览模式
router.get('/liulan',function(req,res){
  res.render("liulan",{});
});
router.get('/huoqu',function(req,res){
  connection.query("SELECT  url,title,uid FROM tupianku WHERE pass=1", function (err, rows) {
    if (err) {
      console.log(err);
    } else {
        res.json(rows.reverse().slice(req.query.page*8,req.query.page*8+8));//返回作品页面，传入最新的10张作品信息
    }
  })
});
//首页
//router.get('/', function(req, res, next) {
//  res.render('zuopin');
//});

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
});
//router.get("/post",function(req,res){
//  res.render("post",{username:req.session.name})
//})
//主页作品页面
router.get("/zhuye",function(req,res){
  if(req.session.name) {//验证用户是否已登录
    //查询数据库，获取数据库中的所有作品图片
    connection.query("SELECT  url,title,uid FROM tupianku  WHERE pass=1", function (err, rows) {
      if (err) {
        console.log(err);
      } else {
        //res.render("user",{username:req.session.name,content:rows});
        res.render("zuopin", {data: rows.reverse().slice(0,15)});//返回作品页面，传入最新的15张作品信息
        console.log(rows.reverse().slice(0,15));
      }
    })
  }else{
    res.redirect("/ml");//验证不通过时跳转到登录页面
  }
});
//投稿页面
router.get("/tougao",function(req,res){
  if(req.session.name) {
    res.render("tougao");
  }else{
    res.redirect("/ml");
  }
});
//投稿功能
router.post("/tougao",multipartMiddleware,function(req,res) {
  var des_file = "/leimu/public/tupianku/" + req.files.img.originalFilename;//图片文件的保存路径及图片名字
  var small_file = "/leimu/public/tupianku/small/" + req.files.img.originalFilename;//小图片文件的保存路径及图片名字
  fs.readFile(req.files.img.path, function (err, data) {//使用fs模块readFile打开图片文件
    fs.writeFile(des_file, data, function (err) {//用fs.writeFile将图片内容写入指定的路径中
      if (err) {
        console.log("出错了" + err);
      } else{
        var imgg = images(des_file)
        var height = imgg.height();
        var width = imgg.width();

        if(width>height){
          images(imgg,(width-height)/2,0,height,height).save(small_file,{quality : 100});
          images(small_file).resize(270,270).save(small_file,{quality : 100})
        }else{
          var imga =images(imgg,0,(height-width)/4,width,width).save(small_file,{quality : 100});
          images(small_file).resize(270,270).save(small_file,{quality : 100})
        }
        console.log(req.files.img.originalFilename+"上传成功");
      }
    })
  });
  //将作品的标题，说明，投稿时间，用户名信息保存进数据库
  var date = new Date();//投稿的时间
  var time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + "   " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
  connection.query('INSERT INTO tupianku (url,title,time,comment,username) VALUES ("' + req.files.img.originalFilename + '","' + req.body.title + '","' + time + '","' + req.body.comment + '","' + req.session.name + '")', function (err, rows) {
    if (err) {
      console.log("出错了" + err);
      res.redirect('/tougao');//发生错误时跳转回投稿页面
    } else {
      res.render("tiaozhuan");//成功保存后进入跳转页面
    }
  })
});
//信息页测试
router.get("/by*",function(req,res){
  var url = req.url.slice(3);
  connection.query("update tupianku set see = (see+1) where tupianku.uid ="+url);
  connection.query("SELECT * FROM tupianku WHERE pass=1 AND uid="+url+"",function(err,rows){
    if(err){
      console.log(err);
    }else{
      if(!rows[0]){
        return;
      }
      var username = rows[0].username;
      connection.query("SELECT face FROM users WHERE username='"+username+"'",function(err,rows1){
        if(err){
          console.log(err);
        }else{
          //var score = 0;
          //for(var i = 0 ; i<rows1.length ; i++){
          //  score += rows1[i].score;
          //}
          console.log(rows1)
          res.render("xinxi",{"data":rows[0],"face":rows1[0].face});
        }

      })

    }
  })
});
router.get("/comment",function(req,res){
  connection.query("SELECT * FROM comment WHERE aid = "+req.query.aid,function(err,rows){
    if(err){
      console.log(err);
    }else{

      res.json({
        data:rows.reverse().slice(req.query.ps*(req.query.pn-1),req.query.ps*req.query.pn),
        length:rows.length,
        uid:req.session.name?req.session.name:false,
      });
    }
  })
});
//获得子评论
//router.get("/comment/reply",function(req,res){
//  connection.query("SELECT * FROM comment WHERE `aid` = "+req.body.aid+" AND `parent_floor` LIKE '"+req.body.floor+"'",function(err,rows){
//    if(err){
//      console.log(err);
//    }else{
//
//      res.json({
//        data:rows.reverse().slice(req.query.ps*(req.query.pn-1),req.query.ps*req.query.pn),
//        length:rows.length,
//        uid:req.session.name?req.session.name:false,
//      });
//    }
//  })
//});
//提交评论
router.post("/comment/add",function(req,res){
  var floor;
  //先获取当前最高评论的楼层，之后+1存储为新评论的楼层数
  connection.query("SELECT COUNT(*) FROM child_comment WHERE aid = "+req.body.aid,function(err,rows){
    if(err){
      console.log(err);
    }else{
      floor = rows[0]["COUNT(*)"]+1;//楼层数
      connection.query('INSERT INTO comment (face,content,uname,time,aid,floor) VALUES ("'+req.body.face+'","'+req.body.message+'","'+req.session.name+'","'+req.body.time+'","'+req.body.aid+'","'+floor+'")',function(err,rows){
        if(err){
          console.log(err);
        }else{
          res.json({})
        }
      })
    }
  })
});
//提交子评论
//router.post("/comment/childAdd",function(req,res){
//  var floor;
//  connection.query("SELECT COUNT(*) FROM `child_comment` WHERE `aid` = "+req.body.aid+" AND `parent_floor` LIKE '"+req.body.floor+"'",function(err,rows){
//      if(err){
//        console.log(err);
//      }else{
//        console.log(rows[0]["COUNT(*)"]+1)
//        floor = rows[0]["COUNT(*)"]+1;
//        connection.query('INSERT INTO child_comment (face,content,uname,time,aid,floor,parent_floor) VALUES ("'+req.body.face+'","'+req.body.message+'","'+req.session.name+'","'+req.body.time+'","'+req.body.aid+'","'+floor+'","'+req.body.floor+'")',function(err,rows){
//          if(err){
//            console.log(err);
//          }else{
//            res.json({})
//          }
//        })
//      }
//  })
//});
//提交评分
router.post("/postScore",function(req,res){
  connection.query("INSERT INTO score (aid,score,uid) VALUES ('"+req.body.aid+"','"+req.body.score+"','"+req.session.name+"')",function(err,rows){
    if(err){
      console.log(req.body.score,req.body.aid);
      console.log(err);
    }else{
      res.json({})
    }
  })
});
//查询用户是否对此图片进行过评分，如果有就把分数传过去
router.get("/searchScore",function(req,res){
  var data = {};
  connection.query("SELECT score FROM score WHERE aid = "+req.query.aid,function(err,rows){
    if(err){
      console.log(err);
    }else{
      data.scoreArr = rows;
      if(req.session.name) {
        connection.query("SELECT score FROM score WHERE uid='"+ req.session.name + "' AND aid=" + req.query.aid, function (err, rows) {
          if (err) {
            console.log(err);
          } else {
            data.flag = 1;
            data.score = rows;
            res.json(data);
          }
        })
      }else{
          data.falg = 0;
        res.json(data);
      }
    }
  })
});
//admin管理界面
router.get("/admin",function(req,res){
  if(req.session.name === "admin"){
    connection.query("SELECT  url,title,uid FROM tupianku  WHERE pass=0", function (err, rows) {
      if (err) {
        console.log(err);
      } else {
        //res.render("user",{username:req.session.name,content:rows});
        res.render("admin", {data: rows.reverse().slice(0,16)});//返回作品页面，传入最新的15张作品信息
      }
    })
  }else{
    res.render("");
  }
});
router.get("/admin/pic",function(req,res){
  connection.query("SELECT  url,title,uid FROM tupianku WHERE pass=0", function (err, rows) {
    if (err) {
      console.log(err);
    } else {
      //res.render("user",{username:req.session.name,content:rows});
      //console.log(rows.reverse().slice())
      res.json(rows.reverse().slice(req.query.pn,parseInt(req.query.pn)+1));//返回作品页面，传入最新的15张作品信息
    }
  });
  connection.query("UPDATE tupianku SET pass = 1 WHERE uid ="+req.query.uid,function(err,rows){
    if(err){
      console.log(err);
    }
  })
});
module.exports = router;


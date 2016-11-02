/**
 * Created by pl on 2016/11/1.
 */

var fs = require("fs");
var connection = require('../routes/db');
var images = require("images");
//查询用户名是否重复
exports.censor_username = function(req,res){
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
}
//账户注册成功提交时将信息写入数据库
exports.regpost = function(req,res){
    connection.query('INSERT INTO users (username,password) VALUES ("'+req.body.username+'",'+req.body.password+')',function(err,rows){
        if(err){
            console.log("出错了"+err);//当出现错误时输出错误信息，且浏览器端跳转回注册页面
            res.redirect('/mr')
        }else{
            res.redirect("/ml");//无错误信息是跳转到登录页面
        }

    })
}
//登录请求验证
exports.login = function(req,res){
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
                    }
                });
            }
        }
    });
}
//登出操作
exports.logout = function(req,res){
    req.session.name=null;//清除服务器储存的session
    res.redirect('/ml');//跳转到登录页面
}
//获取用户头像地址
exports.face = function(req,res){
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
}

//用户信息保存
exports.personal_save = function(req,res){
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
}

//头像上传
exports.face_post = function(req,res){
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
}
//投稿操作
exports.tougao =function(req,res) {
    var des_file = "/leimu/public/tupianku/" + req.files.img.originalFilename;//图片文件的保存路径及图片名字
    var small_file = "/leimu/public/tupianku/small/" + req.files.img.originalFilename;//小图片文件的保存路径及图片名字
    fs.readFile(req.files.img.path, function (err, data) {//使用fs模块readFile打开图片文件
        fs.writeFile(des_file, data, function (err) {//用fs.writeFile将图片内容写入指定的路径中
            if (err) {
                console.log("出错了" + err);
            } else {
                var imgg = images(des_file)
                var height = imgg.height();
                var width = imgg.width();

                if (width > height) {
                    images(imgg, (width - height) / 2, 0, height, height).save(small_file, {quality: 100});
                    images(small_file).resize(270, 270).save(small_file, {quality: 100})
                } else {
                    var imga = images(imgg, 0, (height - width) / 4, width, width).save(small_file, {quality: 100});
                    images(small_file).resize(270, 270).save(small_file, {quality: 100})
                }
                console.log(req.files.img.originalFilename + "上传成功");
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
    });
}
//获取评论
exports.comment = function(req,res){
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
}
//提交评论
exports.addComment = function(req,res){
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
}
//提交评分
exports.postSocre =function(req,res){
    connection.query("INSERT INTO score (aid,score,uid) VALUES ('"+req.body.aid+"','"+req.body.score+"','"+req.session.name+"')",function(err,rows){
        if(err){
            console.log(req.body.score,req.body.aid);
            console.log(err);
        }else{
            res.json({})
        }
    })
}
//查询用户是否对此图片进行过评分，如果有就把分数传过去
exports.searchScore = function(req,res){
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
}
//admin审核图片
exports.admin_pic = function(req,res){
    connection.query("UPDATE tupianku SET pass = 1 WHERE uid ="+req.query.uid,function(err,rows){
        if(err){
            console.log(err);
        }else{
            connection.query("SELECT  url,title,uid FROM tupianku WHERE pass=0", function (err, rows) {
                if (err) {
                    console.log(err);
                } else {
                    //res.render("user",{username:req.session.name,content:rows});
                    //console.log(rows.reverse().slice())
                    res.json(rows.reverse().slice(req.query.pn,parseInt(req.query.pn)+1));//返回作品页面，传入最新的15张作品信息
                }
            });

        }
    })
}
/**

 * Created by pl on 2016/11/1.

 */

//进入登录页面

var connection = require('../routes/db');

exports.ml = function(req,res){

    res.render('mlogin', { title: '登录' });

}

//进入注册页面

exports.mr = function(req,res){

    res.render('mreg', { title: '注册' });

}

//用户信息编辑页面

exports.personal = function(req,res){

    connection.query("SELECT `name`, `describe`, `birthday`, `address`, `maritalStatus`, `sex`, `face` FROM `users` WHERE `username` = '" + req.session.name+"'",function(err,rows){

        if(err){

            console.log(err)

        }else{

            console.log(rows[0]);

            res.render("personal",{data:rows[0]});

        }

    })

}

//头像上传页面

exports.username_face = function(req,res){

    res.render("touxiang",{data:0})

}

//画友主页

exports.zhuye = function(req,res){

    //查询数据库，获取数据库中的所有作品图片

    connection.query("SELECT  url,title,uid FROM tupianku  WHERE pass=1", function (err, rows) {

        if (err) {

            console.log(err);

        } else {

            //res.render("user",{username:req.session.name,content:rows});

            res.render("zuopin", {data: rows.reverse().slice(0, 15)});//返回作品页面，传入最新的15张作品信息

            console.log(rows.reverse().slice(0, 15));

        }

    })

}

//浏览页

exports.liulan=function(req,res){

    res.render("liulan");

}

//投稿页面

exports.tougao = function(req,res){

    if(req.session.name){

        res.render("tougao");//验证通过时，返回投稿页面

    }else{

        res.redirect("/ml");//若未登录则返回登录页面

    }

}

//跳转页面

exports.tiaozhuan = function(req,res){

    res.render('tiaozhuan');

}

//作品详情页

exports.works = function(req,res){

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

                    res.render("xinxi",{"data":rows[0],"face":rows1[0].face});

                }

            })

        }

    })

}

//admin管理页面

exports.admin = function(req,res){

    // if(req.session.name === "admin"){

        connection.query("SELECT  url,title,uid FROM tupianku  WHERE pass=0", function (err, rows) {

            if (err) {

                console.log(err);

            } else {

                //res.render("user",{username:req.session.name,content:rows});

                res.json(rows.reverse());//返回作品页面，传入最新的15张作品信息

            }

        })

    // }else{

    //     res.render("");

    // }

}

//手机主页

exports.mZhuye = function (req, res) {

    connection.query("SELECT  url,title,uid,comment,time FROM tupianku  WHERE pass=1", function (err, rows) {

        if (err) {

            console.log(err);

        } else {

            //res.render("user",{username:req.session.name,content:rows});

            res.render("mindex", {data: rows.reverse()});//返回作品页面，传入最新的15张作品信息

        }

    })

}
/**

 * Created by pl on 2016/11/1.

 */

//�����¼ҳ��

var connection = require('../routes/db');

exports.ml = function(req,res){

    res.render('mlogin', { title: '��¼' });

}

//����ע��ҳ��

exports.mr = function(req,res){

    res.render('mreg', { title: 'ע��' });

}

//�û���Ϣ�༭ҳ��

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

//ͷ���ϴ�ҳ��

exports.username_face = function(req,res){

    res.render("touxiang",{data:0})

}

//������ҳ

exports.zhuye = function(req,res){

    //��ѯ���ݿ⣬��ȡ���ݿ��е�������ƷͼƬ

    connection.query("SELECT  url,title,uid FROM tupianku  WHERE pass=1", function (err, rows) {

        if (err) {

            console.log(err);

        } else {

            //res.render("user",{username:req.session.name,content:rows});

            res.render("zuopin", {data: rows.reverse().slice(0, 15)});//������Ʒҳ�棬�������µ�15����Ʒ��Ϣ

            console.log(rows.reverse().slice(0, 15));

        }

    })

}

//���ҳ

exports.liulan=function(req,res){

    res.render("liulan");

}

//Ͷ��ҳ��

exports.tougao = function(req,res){

    if(req.session.name){

        res.render("tougao");//��֤ͨ��ʱ������Ͷ��ҳ��

    }else{

        res.redirect("/ml");//��δ��¼�򷵻ص�¼ҳ��

    }

}

//��תҳ��

exports.tiaozhuan = function(req,res){

    res.render('tiaozhuan');

}

//��Ʒ����ҳ

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

//admin����ҳ��

exports.admin = function(req,res){

    // if(req.session.name === "admin"){

        connection.query("SELECT  url,title,uid FROM tupianku  WHERE pass=0", function (err, rows) {

            if (err) {

                console.log(err);

            } else {

                //res.render("user",{username:req.session.name,content:rows});

                res.json(rows.reverse());//������Ʒҳ�棬�������µ�15����Ʒ��Ϣ

            }

        })

    // }else{

    //     res.render("");

    // }

}

//�ֻ���ҳ

exports.mZhuye = function (req, res) {

    connection.query("SELECT  url,title,uid,comment,time FROM tupianku  WHERE pass=1", function (err, rows) {

        if (err) {

            console.log(err);

        } else {

            //res.render("user",{username:req.session.name,content:rows});

            res.render("mindex", {data: rows.reverse()});//������Ʒҳ�棬�������µ�15����Ʒ��Ϣ

        }

    })

}
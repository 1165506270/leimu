/**
 * Created by pl on 2016/11/1.
 */

var fs = require("fs");
var connection = require('../routes/db');
var images = require("images");
//��ѯ�û����Ƿ��ظ�
exports.censor_username = function(req,res){
    connection.query('SELECT username FROM users WHERE username="'+req.query.user+'"',function(err,rows){
        if(err){
            console.log(err);
        }else{
            if(rows.length>0){//����ѯ�������0ʱ�����û����ѱ�ע�ᣬ����1
                res.json({"flag":1});
            }else{
                res.json({"flag":2});//��֮����2
            }
        }
    })
}
//�˻�ע��ɹ��ύʱ����Ϣд�����ݿ�
exports.regpost = function(req,res){
    connection.query('INSERT INTO users (username,password) VALUES ("'+req.body.username+'",'+req.body.password+')',function(err,rows){
        if(err){
            console.log("������"+err);//�����ִ���ʱ���������Ϣ�������������ת��ע��ҳ��
            res.redirect('/mr')
        }else{
            res.redirect("/ml");//�޴�����Ϣ����ת����¼ҳ��
        }

    })
}
//��¼������֤
exports.login = function(req,res){
    connection.query("SELECT * FROM  users WHERE username='"+req.query.username+"' AND password="+req.query.password,function(err,rows){
        if(err){
            console.log("������"+err);
            res.redirect('/users/ml');
        }else{
            if(rows.length==0){//��ƥ����ʱ����ʾ�˺Ż����벻��ȷ������1;
                res.json({"flag":1});
            }else{//��֮���¼�ɹ���ִ������Ĳ���
                connection.query("SELECT uid FROM users WHERE username='"+req.query.username+"'",function(err,rows){
                    if(err){
                        console.log(err);
                    }else{
                        res.cookie("uid",rows[0].uid,{maxAge:60*1000*60*72});
                        req.session.name=req.query.username;//����session,������֤��¼״̬�����û��ı�ʶ
                        res.json({"flag":2,name:req.query.username});//����flagΪ2����Ͷ��ҳ���ַ��������˵�js���������ת
                    }
                });
            }
        }
    });
}
//�ǳ�����
exports.logout = function(req,res){
    req.session.name=null;//��������������session
    res.redirect('/ml');//��ת����¼ҳ��
}
//��ȡ�û�ͷ���ַ
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

//�û���Ϣ����
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

//ͷ���ϴ�
exports.face_post = function(req,res){
    var des_file = "/leimu/public/face/" + req.files.upfile.originalFilename;//ͼƬ�ļ��ı���·����ͼƬ����
    var uid = req.body.uid;
    connection.query("SELECT face FROM users WHERE uid="+uid,function(err,rows){
        if(err){
            console.log(err);
        }else{
            fs.unlink("/leimu/public/face/"+rows[0].face,function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log("�ļ���ɾ��")
                }
            });
            fs.readFile(req.files.upfile.path, function (err, data) {//ʹ��fsģ��readFile��ͼƬ�ļ�
                fs.writeFile(des_file, data, function (err) {//��fs.writeFile��ͼƬ����д��ָ����·����
                    if (err) {
                        console.log("������" + err);
                    } else{
                        var width =parseInt(req.body.width);
                        var height =parseInt(req.body.height);
                        var top =parseInt(req.body.top);
                        var left =parseInt(req.body.left);
                        console.log(req.files.upfile.originalFilename+"�ϴ��ɹ�",height,width);
                        var img = images(des_file);
                        images(img,left,top,width,height).resize(220,220).save(des_file,{quality : 100})
                        connection.query("UPDATE `users` SET `face` = '"+req.files.upfile.originalFilename+"' WHERE `users`.`uid` = "+uid,function(err,rows){
                            if(err){
                                console.log("������" + err)
                            }else{
                                res.json("����ɹ�")
                            }
                        })
                    }
                })
            });
        }
    });
}
//Ͷ�����
exports.tougao =function(req,res) {
    var des_file = "/leimu/public/tupianku/" + req.files.img.originalFilename;//ͼƬ�ļ��ı���·����ͼƬ����
    var small_file = "/leimu/public/tupianku/small/" + req.files.img.originalFilename;//СͼƬ�ļ��ı���·����ͼƬ����
    fs.readFile(req.files.img.path, function (err, data) {//ʹ��fsģ��readFile��ͼƬ�ļ�
        fs.writeFile(des_file, data, function (err) {//��fs.writeFile��ͼƬ����д��ָ����·����
            if (err) {
                console.log("������" + err);
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
                console.log(req.files.img.originalFilename + "�ϴ��ɹ�");
            }
        })
    });
    //����Ʒ�ı��⣬˵����Ͷ��ʱ�䣬�û�����Ϣ��������ݿ�
    var date = new Date();//Ͷ���ʱ��
    var time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + "   " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    connection.query('INSERT INTO tupianku (url,title,time,comment,username) VALUES ("' + req.files.img.originalFilename + '","' + req.body.title + '","' + time + '","' + req.body.comment + '","' + req.session.name + '")', function (err, rows) {
        if (err) {
            console.log("������" + err);
            res.redirect('/tougao');//��������ʱ��ת��Ͷ��ҳ��
        } else {
            res.render("tiaozhuan");//�ɹ�����������תҳ��
        }
    });
}
//��ȡ����
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
//�ύ����
exports.addComment = function(req,res){
    var floor;
    //�Ȼ�ȡ��ǰ������۵�¥�㣬֮��+1�洢Ϊ�����۵�¥����
    connection.query("SELECT COUNT(*) FROM child_comment WHERE aid = "+req.body.aid,function(err,rows){
        if(err){
            console.log(err);
        }else{
            floor = rows[0]["COUNT(*)"]+1;//¥����
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
//�ύ����
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
//��ѯ�û��Ƿ�Դ�ͼƬ���й����֣�����оͰѷ�������ȥ
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
//admin���ͼƬ
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
                    res.json(rows.reverse().slice(req.query.pn,parseInt(req.query.pn)+1));//������Ʒҳ�棬�������µ�15����Ʒ��Ϣ
                }
            });

        }
    })
}
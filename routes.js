/**
 * Created by pl on 2016/11/1.
 */
var main = require("./handlers/main.js"),
    users = require("./handlers/users.js");
var multipart = require('connect-multiparty');//此模块用于帮助上传文件
var multipartMiddleware = multipart();//实例化

module.exports = function(app){
    //页面跳转路由
    app.get('/mr',main.mr);
    app.get('/ml',main.ml);
    app.get('/personal',main.personal);
    app.get('/username_face',main.username_face);
    app.get('/admin',main.admin);
    app.get('/zhuye',main.zhuye);
    app.get('/by*',main.works);
    app.get('/tougao',main.tougao);
    app.get('/tiaozhuan',main.tiaozhuan);
    app.get('/liulan',main.liulan);
    //移动端跳转
    app.get('/m/index',main.mZhuye);
    //登录注册操作
    app.get('/censor_username',users.censor_username);
    app.get('/login',users.login);
    app.post('/regpost',users.regpost);
    app.get("/logout",users.logout);
    //信息更改操作
    app.post('/personal-save',users.personal_save);
    app.post('/face_post',multipartMiddleware,users.face_post);
    //获取数据
    app.get('/face',users.face);//获取头像
    app.get('/comment',users.comment);//获取评论
    app.get('/searchScore',users.searchScore);//获取评分
    app.get("/huoqu",users.huoqu)//获取图片
    app.get("/admin_pics",users.admin)//获取未审核图片
    app.get("/accounts",users.accounts)//获取所有的账户信息
    //投稿提交评论评分
    app.post('/tougao',multipartMiddleware,users.tougao);
    app.post('/comment/add',users.addComment);
    app.post('/postScore',users.postSocre);
    //图片审核
    app.get('/admin/pic',users.admin_pic);

}


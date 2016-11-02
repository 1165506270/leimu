/**
 * Created by pl on 2016/11/1.
 */
var main = require("./handlers/main.js"),
    users = require("./handlers/users.js");

module.exports = function(app){
    //页面跳转路由
    app.get('/mr',main.mr);
    app.get('/ml',main.ml);
    app.get('/personal',main.personal);
    app.get('/username_face',main.username_face);
    //登录注册操作
    app.get('/censor_username',users.censor_username);
    app.get('/login',users.login);
    app.post('/regpost',users.regpost);
    app.get("/logout",users.logout);
    //信息更改操作
    app.get("/personal-save",users.personal_save);
    app.post('/face_post',users.face_post);
}


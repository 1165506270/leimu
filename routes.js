/**
 * Created by pl on 2016/11/1.
 */
var main = require("./handlers/main.js"),
    users = require("./handlers/users.js");
var multipart = require('connect-multiparty');//��ģ�����ڰ����ϴ��ļ�
var multipartMiddleware = multipart();//ʵ����
module.exports = function(app){
    //ҳ����ת·��
    app.get('/mr',main.mr);
    app.get('/ml',main.ml);
    app.get('/personal',main.personal);
    app.get('/username_face',main.username_face);
    app.get('/admin',main.admin);
    app.get('/zhuye',main.zhuye);
    app.get('/by*',main.works);
    app.get('/tougao',main.tougao);
    app.get('tiaozhuan',main.tiaozhuan);
    //��¼ע�����
    app.get('/censor_username',users.censor_username);
    app.get('/login',users.login);
    app.post('/regpost',users.regpost);
    app.get("/logout",users.logout);
    //��Ϣ���Ĳ���
    app.post('/personal-save',users.personal_save);
    app.post('/face_post',multipartMiddleware,users.face_post);
    //��ȡ����
    app.get('/face',users.face);//��ȡͷ��
    app.get('/comment',users.comment);//��ȡ����
    app.get('/searchScore',users.searchScore);//��ȡ����
    //Ͷ���ύ��������
    app.post('/tougao',multipartMiddleware,users.tougao);
    app.post('/comment/add',users.addComment);
    app.post('/postScore',users.postSocre);
    //ͼƬ���
    app.get('/admin/pic',users.admin_pic)

}


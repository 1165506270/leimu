/**
 * Created by pl on 2016/10/26.
 */
var mysql = require('mysql');
//����һ��connection
var connection = mysql.createConnection({
    host : '127.0.0.1', //����
    user :'root',//mysql��֤�û���
    password : "",//mysql��֤�û�������
    port:'3306',//�˿ں�
    database:'huayou'
});
//����һ��connection
connection.connect(function(err){
    if(err){
        console.log('[query]-:'+err)
    }else{
        console.log("[connection connect succeed")
    }
});
module.exports = connection;
/**
 * Created by pl on 2016/10/26.
 */
var mysql = require('mysql');
//创建一个connection
var connection = mysql.createConnection({
    host : '127.0.0.1', //主机
    user :'root',//mysql认证用户名
    password : "",//mysql认证用户名密码
    port:'3306',//端口号
    database:'huayou'
});
//创建一个connection
connection.connect(function(err){
    if(err){
        console.log('[query]-:'+err)
    }else{
        console.log("[connection connect succeed")
    }
});
module.exports = connection;
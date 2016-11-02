/**
 * Created by pl on 2016/9/27.
 */
$(function(){
    var code;
    var tanchuang = new Tanchuang();
    creatCode();
    function showCheck(a){
        var ctx= $('.check')[0].getContext("2d");
        ctx.clearRect(0,0,1000,1000);
        ctx.font="80px Arial";
        ctx.fillText(a,0,100);
    };
    function creatCode(){
        code="";
        var codeLength = 4;//验证码的长度
        var selectChar = new Array(1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f','g','h','j','k','l','m','n','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','J','K','L','M','N','P','Q','R','S','T','U','V','W','X','Y','Z');
        for(var i = 0;i<codeLength;i++){
            code+=selectChar[Math.floor(Math.random()*(selectChar.length-1))];
        };
        if(code.length!=codeLength){
            creatCode();
        };
        showCheck(code);
    };
    $(".check").click(function(){
        creatCode();
    })
    $("#sumbit").click(function(){
        $.ajax({
            type:"get",
            url:"/users/login",
            data:{"username":$("input[name='user']").val(),
                "password":$("input[name='password']").val()
            },
            beforeSend:function(){
                if($('.yanzhengma').val().toLocaleLowerCase()!=code.toLocaleLowerCase()){
                    tanchuang.init({
                        title:"错误",
                        w:300,
                        h:200,
                        dir:"center",
                        content:"验证码填写错误",
                        mark:false
                    })
                    creatCode();
                    return false;
                }
            },
            success:function(data){
                if(data.flag==1){
                    tanchuang.init({
                        title:"登录错误",
                        w:300,
                        h:200,
                        dir:"center",
                        content:"账号不存在或密码错误",
                        mark:false
                    })
                    creatCode();
                }else{

                    alert(data.name+"登录成功");

                   if(document.referrer){
                       var reg =/http:\/\/([^\/]+)/;
                       var mrPath = document.referrer.replace(document.referrer.match(reg)[0],"")
                        if(document.referrer.match(reg)[1]==window.location.host&&mrPath == "/users/mr"){
                           window.location.href = document.referrer;
                        }else{
                           window.location.href="/zhuye";
                        }
                   }else{
                       window.location.href="/zhuye";
                   }
                }
            }
        })

    })
})
/**
 * Created by pl on 2016/10/23.
 */
$(function(){

    $.ajax({
        type:"get",
        url:"/face",
        data:{uid:getCookie("uid")||null},
        success:function(data){
            $("#face")[0].src =data.src?"/face/"+data.src:"/images/noface.gif";
        }
    });
    if(!getCookie("uid")){
        $("#log").html("<a href='/ml' id='login'>登录</a>")
    }else{
        $("#logout").click(function(){
            delCookie("uid");
        })
    }
});
function delCookie(name) {
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval=getCookie(name);
    if(cval!=null)
        document.cookie= name + "="+cval+";expires="+exp.toGMTString();
}
function getCookie(name) {
    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");

    if(arr=document.cookie.match(reg))

        return unescape(arr[2]);
    else
        return null;
}
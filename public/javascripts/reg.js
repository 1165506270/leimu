/**
 * Created by pl on 2016/9/27.
 */
$(function(){
    $('#user').change(function(){
        console.log(11)
        $.ajax({
            type:"get",
            url:"/censor_username",
            data:{user:$('#user').val()},
            beforeSend:function(){
                if($('#user').val().length<=0){
                    return false
                }
            },
            success:function(data){
                if(data.flag==1){
                    $("#useryn").html("该用户名已被注册").addClass("no").removeClass("yes");
                }else{
                    $("#useryn").html("该用户名可以使用").addClass("yes").removeClass("no");
                }
            }
        })
    })
    $('#password').change(function(){
        if($(this).val().length<6||$(this).val().length>16){
            $("#pass").text("密码长度不能少于6位多于16位").addClass("no").removeClass("yes");
        }else{
            $("#pass").text("").addClass("yes").removeClass("no");
        }
        if($("#pass").hasClass("yes")&&$("#useryn").hasClass("yes")){
            $("#submit")[0].disabled = false;
        }else{
            $("#submit")[0].disabled = true;
        }
    })
})
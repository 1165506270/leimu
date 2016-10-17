/**
 * Created by pl on 2016/10/5.
 */
//$(function(){
//    $('#sumbit').click(function(){
//        $.ajax({
//            type:'post',
//            data:{
//                title:$("#title").val(),
//                pic:$()
//            }
//        })
//    })
//})
$(function(){
    $("#comment").keyup(function(){
        $(".shuoming span.fr").text(this.value.length+"/1000");
    })
})

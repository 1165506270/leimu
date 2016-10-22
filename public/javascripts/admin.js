/**
 * Created by pl on 2016/10/22.
 */

$(function(){
    //obtainPic(1,16);
    function obtainPic(pn,uid){
        $.ajax({
            url:"/admin/pic",
            type:"get",
            data:{
              pn:pn,
              uid:uid
            },
            success:function(data){
                for(var i = 0 ; i< data.length;i++){
                    var str = "<div>" +
                        "<img src='/tupianku/"+data[i].url+"'>" +
                        "</div>" +
                        "<p>"+data[i].title+"</p>" +
                        "<div class='operate'>" +
                        "<button class='agree'>通过</button>" +
                        "<button class='refuse'>拒绝</button>" +
                        "</div>" ;
                    $(".admin_content").append($("<div>",{
                        html:str,
                        class:"item"
                    }))
                }
            }
        })
    }
    var pn = 1;
    $(".agree").live("click",function(){
        pn++;
       var uid = $(this).parents(".item").find("img").data("uid");
        $(this).parents(".item").remove();
        obtainPic(pn,uid);
    })
});
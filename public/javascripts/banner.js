/**
 * Created by pl on 2016/10/5.
 */
$(function(){
    $(".banner-item div:nth-child(4)").addClass("big");
    //$('.banner-box').css({
    //    tranition:"all 0.5s",
    //    transfrom:"translateX("+410+$('.banner-box').position().left+"px)"
    //})
    $('.arr-left').click(function(){
        console.log($('.banner-box').position().left);
        if($('.banner-box').position().left<0){
            $('.banner-box').css({
                transition:"all 0.5s",
                transform:"translateX("+($('.banner-box').position().left+390)+"px)"
            })
        }
    })
    $('.arr-right').click(function(){
        console.log(410+$('.banner-box').position().left);
        if($('.banner-box').position().left>-($('.banner-box').width()-$('.banner').width()-50)){
            $('.banner-box').css({
                transition:"all 0.5s",
                transform:"translateX("+($('.banner-box').position().left-390)+"px)"
            })
        }
    })
})
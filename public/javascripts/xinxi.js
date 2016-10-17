/**
 * Created by pl on 2016/10/14.
 */
$(function(){
    comment({
        ele:$('.p-review .comm'),
        aid: window.location.pathname.slice(3),
        type:3,
        platform:'mobile',
        pageSize:20
    });
    var data = [
        {title: "一星", num: 6},
        {title: '二星', num: 20},
        {title: "三星", num: 7},
        {title: "四星", num: 60},
        {title: "五星", num: 9}
    ];
    var pingfen = new T();
    var ele = $(".score_wrapper")[0];
    pingfen.init({
        width: 213,
        height: 137,
        padding: 20,
        color: "#de698c",
        data: data,
        ele: ele,
        font: "12px 宋体"
    })
});
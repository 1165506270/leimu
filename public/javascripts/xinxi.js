/**
 * Created by pl on 2016/10/14.
 */
$(function(){
    //使用评论插件将评论内容插入网页中
    comment({
        ele:$('.p-review .comm'),
        aid: window.location.pathname.slice(3),
        type:3,
        platform:'mobile',
        pageSize:5
    });
    init();
    //发送ajax请求获取当前用户是否对当前图片进行过评分
    function init() {
        $.ajax({
            type: "get",
            url: "searchScore",
            data: {aid: window.location.pathname.slice(3)},//向服务器传递当前图片的aid
            success: function (data) {
                if (data.flag == 1 && data.score[0]) {//当有评分时将页面的分数设置为获得的分数
                    $(".score_icon").addClass("on").eq(data.score[0].score - 1).nextAll("a").removeClass("on");
                } else if (data.flag == 1) {
                    //当没有评分时，就添加一些交互的事件，
                    $(".score_icon").on("mouseenter", function () {
                        $(".score_icon").addClass("on");
                        $(this).nextAll("a").removeClass("on");
                    });
                    $(".score_icon").eq(0).on("mouseleave", function () {
                        $(this).removeClass("on");
                    });
                    $(".score_icon").on("click", function (e) {
                        layer(e.pageX, e.pageY, $(this).data("score"))
                    })
                } else {
                    $(".score_icon").on("click", function () {
                        new Tanchuang().init({
                            title: "错误",
                            w: 300,
                            h: 200,
                            dir: "center",
                            content: "请登录后再进行评分",
                            mark: false
                        })
                    })
                }
                //根据数据绘制条形图
                var arr = [
                    {title: "1", num: 0},
                    {title: '2', num: 0},
                    {title: "3", num: 0},
                    {title: "4", num: 0},
                    {title: "5", num: 0}
                ];
                var pinfen = 0;//总分数
                $.each(data.scoreArr, function (i, v) {
                    pinfen+= v.score;
                    for (var i = 0; i < arr.length; i++) {
                        if (arr[i]["title"] == v.score/2) {
                            arr[i]["num"] += 1;
                        }
                    }
                });
                $(".person-content-info .pinfen span").text(pinfen);//更新总分数
                //计算得分占比
                var str = ""+(($(".person-content-info .pinfen span").text()/(data.scoreArr.length*10))*10);
                //更新的分占比
                $(".rete_avg_num_f").text((isNaN(str.slice(0,3))?"0":str.slice(0,3))+"/"+pinfen);
                //关于评分的条形图绘制
                var pingfen = new T();
                var ele = $(".rate_stat")[0];
                pingfen.init({
                    width: 183,
                    height: 100,
                    padding: 15,
                    color: "#de698c",
                    data: arr,
                    ele: ele,
                    font: "12px 宋体"
                });
            }
        })
    }
    //点击评分后的弹窗
    function layer(x, y, score) {
        //把原来的弹窗清除，避免出现多个弹窗
        $(".m_layer").remove();
        var str = "<div>是否确认要评分?每个作品只能评分一次</div>" +
            "<div class='btnBox'>" +
            "<a href='javascript://' class='m_yes'>确定</a>" +
            "<a href='javascript://' class='m_no'>取消</a>" +
            "</div>"
        $("<div>", {
            html: str,
            class: "m_layer",
            style: "left:" + (x - 122) + "px;top:" + (y - 96) + "px"//根据鼠标的位置设置弹窗的位置
        }).appendTo("body").fadeIn(300);
        //为确认按钮设置点击事件
        $(".m_yes").click(function () {
            //post请求传递过去的数据
            var data = {
                score: score,//选择的分数
                aid: window.location.pathname.slice(3)//当前图片的aid
            };
            $(".m_layer").remove();//把弹窗清除
            //发送ajax请求
                $.ajax({
                    type: "post",
                    url: "/postScore",
                    data: data,
                    beforSend: function () {

                    },
                    success: function () {
                        //评分成功后弹出评分成功的窗体
                        $("<div>", {
                            html: '评分成功',
                            class: "m_success",
                            style: "left:" + (x - 35) + "px;top:" + (y - 40) + "px"
                        }).appendTo("body").fadeIn(300, function () {
                            //两秒钟后隐藏窗体并清除
                            setTimeout(function () {
                                $('.m_success').fadeOut(300,function(){
                                    $('.m_success').remove();
                                })
                            }, 2000);
                        });
                        //清除.score_icon上的事件，并将分数锁定
                        $(".score_icon").unbind().addClass("on").eq(score - 1).nextAll("a").removeClass("on");
                        init();
                    }
                })
        });
        //取消的点击事件
        $(".m_no").click(function () {
            //直接清除弹窗
            $(".m_layer").remove();
        })
    }
});
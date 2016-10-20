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
        {title: "1", num: 6},
        {title: '2', num: 20},
        {title: "3", num: 7},
        {title: "4", num: 60},
        {title: "5", num: 9}
    ];
    var pingfen = new T();
    var ele = $(".rate_stat")[0];
    pingfen.init({
        width: 183,
        height: 100,
        padding: 15,
        color: "#de698c",
        data: data,
        ele: ele,
        font: "12px 宋体"
    });
    $.ajax({
        type: "get",
        url: "searchScore",
        data: {aid: window.location.pathname.slice(3)},
        success: function (data) {
            console.log(data);
            if (data.score[0]) {
                $(".score_icon").addClass("on").eq(data.score[0].score - 1).nextAll("a").removeClass("on");
            } else {
                console.log(111);
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
            }
        }
    })
    function layer(x, y, score) {
        $(".m_layer").remove();
        var str = "<div>是否确认要评分?每个作品只能评分一次</div>" +
            "<div class='btnBox'>" +
            "<a href='javascript://' class='m_yes'>确定</a>" +
            "<a href='javascript://' class='m_no'>取消</a>" +
            "</div>"
        $("<div>", {
            html: str,
            class: "m_layer",
            style: "left:" + (x - 122) + "px;top:" + (y - 96) + "px"
        }).appendTo("body").fadeIn(300);
        $(".m_yes").click(function () {
            var data = {
                score: score,
                aid: window.location.pathname.slice(3)
            }
            $(".m_layer").remove();
            $.ajax({
                type: "post",
                url: "/postScore",
                data: data,
                beforSend: function () {

                },
                success: function () {
                    $("<div>", {
                        html: '评分成功',
                        class: "m_success",
                        style: "left:" + (x - 35) + "px;top:" + (y - 40) + "px"
                    }).appendTo("body").fadeIn(300, function () {
                        console.log(333);
                        setTimeout(function () {
                            console.log(3333);
                            $('.m_success').fadeOut(300)
                        }, 2000);
                    });
                    $(".score_icon").unbind().addClass("on").eq(score - 1).nextAll("a").removeClass("on");
                    ;

                }
            })
        });
        $(".m_no").click(function () {
            $(".m_layer").remove();
        })
    }
});
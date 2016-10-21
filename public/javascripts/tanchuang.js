/**
 * Created by pl on 2016/10/15.
 */
function Tanchuang(){
    this.settings={
        w:400,
        h:300,
        dir:'center',
        title:"",
        mark:false
    }
}
Tanchuang.prototype.init = function(opt) {
    if (typeof opt != "object") {
        opt = this.settings;
    }
    $("<div>", {
        html: "<div class='title'>" +
        "<h3>" + opt.title + "</h3>" +
        "</div>" +
        "<div class='content'>" +
        "<p>" + opt.content + "</p>" +
        "<button id='guanbi'>确定</button>" +
        "</div>",
        class: "tanchuang"
    }).css({
        position: "absolute",
        width: opt.w,
        height: opt.h
    }).appendTo("body");
    if (opt.dir == "center") {
        $(".tanchuang")[0].style.left = (document.documentElement.clientWidth - opt.w) / 2 + "px";
        $(".tanchuang")[0].style.top = (document.documentElement.clientHeight - opt.h) / 2 + $(window).scrollTop() + "px";
        if (opt.mark) {
            this.createMark();
        }
        this.guanbi();
    }
}
    Tanchuang.prototype.createMark = function () {
        $("<div>",{
            html:"",
            class:"mark"
        }).css({
            width:document.documentElement.clientWidth,
            height:document.documentElement.clientHeight
        }).appendTo("body")
    }
    Tanchuang.prototype.guanbi = function () {
        $("#guanbi").click(function () {
            $(".tanchuang").detach();
        })
    }

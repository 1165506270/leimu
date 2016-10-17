/**
 * Created by pl on 2016/10/14.
 */
/**
 * 评论插件
 * 需配合jquer或zepto使用
 *
 *
 *
 * */
//沙箱闭包
(function(global){//此处global为window
    //判断zepto是否存在
    //存在就直接使用,不存在就使用jQuery
    var $ = global.jQuery || global.Zepto;
    if(!$){
        console.warn("此插件需依靠Zepto 1.0+或 jQuery 1.7.2");
    }
    //定义全局变量
    var DOC = global.document;
    var urlConfig = {//路径配置
        baseUrl:'/comment',//基础路径
        specificUrl:{//特定路径
            'sendReply':'/add',//发表评论
            'getReply':'',//获取评论
            'getChildReply':'reply',//获取子回复
            'getCount':"/count"//获取评论数
        }
    }
    var BLIICOMMENT ='biliComment',
        pageSize = 10,//定义一页显示的评论条数
        sort,//当前页码
        type,//评论显示的排序
        ele,//评论盒子
        pn,//页码
        userFace,//用户头像路径
        platform,//设备类型
        login//登录状态
    //查询设备类型的对象
    window.browser = {
        version: (function() {
            var u = navigator.userAgent,
                app = navigator.appVersion;
            return { //移动终端信息
                mobile: (/AppleWebKit.*Mobile.*/i).test(u), //是否为移动终端
                ios: (/\(i[^;]+;( U;)? CPU.+Mac OS X/i).test(u), //ios终端
                android: (/Android/i).test(u) || (/Linux/i).test(u), //android终端或者uc浏览器
                windowsphone: (/Windows Phone/i).test(u), //Windows Phone
                iPhone: (/iPhone/i).test(u), //是否为iPhone或者QQHD浏览器
                iPad: (/iPad/i).test(u), //是否iPad
                webApp: !(/Safari/i).test(u), //是否web应该程序，没有头部与底部
                MicroMessenger: (/MicroMessenger/i).test(u), //是否为微信
                weibo: (/Weibo/i).test(u), //是否为微博
                uc: (/UCBrowser/i).test(u), //是否为UC
                qq: (/MQQBrowser/i).test(u), //是否为QQ浏览器
                baidu: (/Baidu/i).test(u) //是否为百度浏览器
            };
        })(),
        language: (navigator.browserLanguage || navigator.language).toLowerCase()
    };
    if(browser.version.mobile){
        platform = 'mobile';
    }else{
        platform = 'pc';
    }
    //入口函数
    function init(option) {
        type = option.type;
        platform = option.platform || platform;
        ele = option.ele;
        pageSize = option.pageSize || pageSize;
        userFace = option.userFace || "/images/noface.gif";
        //只有页面内没有评论区域才会执行下面的函数
        if ($('div.' + BLIICOMMENT + "").size() <= 0) {
            setOuterFrame(ele);
        }

    }
        //构建一个外框（把评论区不会变动的区域搭建出来）
        function setOuterFrame(ele) {
            var outFrame = [
                '<div class="comment-wrap biliComment' + (platform = 'mobile' ? ' mobile' : '') + '">',
                '<div class="comment-number">共<span class="number"></span>条评论</div>',
                '<ul class="comment-type">',
                '<li class="type-list current" data-sort="0">默认排序</li>',
                '<li class="type-list" data-sort="2">按赞同数</li>',
                '<li class="type-list" data-sort="1">按回复数</li>',
                '</ul>',
                '<div class="comment-pager"></div>'
            ];
            if (true) {
                //如果已经登录
                var face = userFace;
                tempDom = [
                    '<div class="comment-input show-loginout clearfix">', // 登陆之后为show-login;未登录为show-loginout
                    '<textarea class="cont-comment" placeholder="请输入3-1000个字的评论内容"></textarea>',
                    '<button type="button" class="btn-comment">发表评论</button>',
                    '</div>'
                ].join('');
                login = 1;
            } else {
                tempDom = [
                    '<div class="comment-input show-login">',
                    '<p class="tips-login">请先<a href=\'https://account.bilibili.com/login\' class="btn-login">登录</a>后发表评论 (・ω・)</p>',
                    '<button type="button" class="btn-comment disabled">发表评论</button>',
                    '</div>'
                ].join('');
                login = 0;
            }

            outFrame.push([
                tempDom + '<div class="comment-list">',
                '</div>',
                '</div>'
            ].join(''));
            //评论列表填充/评论数量获取
            $(ele).html(outFrame.join(""));
            if (platform) {
                $('.comment-wrap', $(ele)).addClass('mobile');
            }
            //获取评论列表
            getCommentList(0);
            //绑定筛选事件

            //发表评论
            publishComment();
            //绑定换页事件

            //绑定登录事件


        }
    //获取评论列表方法（ajax）
    function getCommentList(sort,pn){
        $.ajax({
            url : '/comment',
            type : 'GET',
            dataType : 'json',
            data:{
                type:"type",
                pn:pn||1,
                ps:pageSize,
                sort:sort||0,
            },
            success:function(data){
                console.log(data)
                var code = data.code;
                //总评论数
                $('span.number').html(data.length||0);
                //评论列表
                $('div.comment-list').html(setCommentList(data));
                //当评论数大于设置的显示条数时创建页码
                if(data.length>pageSize){
                    $('div.comment-flip').length
                    ?$('div.comment-flip').html(setFlipControl( pn||1 , Math.ceil(data.length/pageSize) || 0 ))
                    :$('div.comment-list').after(setFlipControl( pn||1 , Math.ceil(data.length/pageSize)  || 0 ));
                }
            },
            error:function(){
                //错误时显示
            }
        })

    }
    //定义一个生成评论区的评论列表
    //isChild：是否为回复的项
    function setCommentList(json,isChild) {
        var commentListDom = [],
            empty = '',
            item,
            member,
            content,
            childReply;
        //循环遍历传入的json,生成相应的评论
        for (var i = 0; i < json.length;i++) {
            item = json[i] || {};
            member = item.uname || {};
            content = item.content || {};
            plat = content.plat || 0;
            childReply = item.replies || []

            commentListDom.push([
                '<div class="item ' + (isChild ? "child-item" : "") + '">',
                '<div class="photo">',
                '<a href="' + (item.mid || empty) + '" target="_blank" data-mid="' + (item.mid || empty) + '" data-card="' + (member.uname || empty) + '">',
                '<img src="/images/noface.gif" class="face">',
                '</a>',
                '</div>',
                '<div class="main">',
                '<a href="' + (item.mid || empty) + '" target="_blank" class="uname">' + item.uname + '</a>',
                '<p class="content">' + content + '</p>',
                '<div class="infor clearfix">' + (isChild ? "" : "<p class=\"floor-num\">#" + (item.floor || 0) + "</p>") + "<p class=\"time\">" + human_date(item.time) + "</p>",
                '<p class="tools" data-rpid="' + (item.rpid || empty) + '">',
                '<span class="reply">' + (childReply.length > 0 ? "参与回复" : "回复") + '</span>',
                '</p>',
                '</div>' + (isChild ? "" : "<div class=\"child-reply " + (childReply.length > 0 ? '' : 'hidden') + "\">" + setCommentList(childReply, true)  + "</div>" ) + '</div>',
                '</div>'
            ].join(""))
        }
        return commentListDom.join("");
    }
    //构建页码控制组件
    function setFlipControl(pn,total){//pn为当前页数，total为总页数
        if(total>1){
            var c = ['<div class=\'comment-flip\'>'];
            if(total>5){
                if(pn<=4){
                    for(var i =1;i <=5&&i<=(pn+2);i++){
                        c.push('<a href\'javascript:void(0)\' class="' +(pn==i?'on':'')+'" >'+i+'</a>');
                    }
                    c.push('<span>......</span><a href\'javascript:void(0)\'>'+ total +'</a>')
                }else if(pn>total-3){
                    c.push('<a href\'javascript:void(0)\'>1</a><span>......</span>');
                    for(var i = pn-2;i<=total;i++){
                        c.push('<a href\'javascript:void(0)\' class="' +(pn==i?'on':'')+'" >'+i+'</a>');
                    }
                }else{
                    c.push('<a href\'javascript:void(0)\'>1</a><span>......</span>');
                    for(var i = pn-2;i<=(pn+2);i++){
                        c.push('<a href\'javascript:void(0)\' class="' +(pn==i?'on':'')+'" >'+i+'</a>');
                    }
                    c.push('<span>......</span><a href\'javascript:void(0)\'>'+total+'</a>');
                }
            }else{
                for(var i = 1;i <=total;i++){
                    c.push('<a href\'javascript:void(0)\' class="' +(pn==i?'on':'')+'" >'+i+'</a>');
                }
            }
            c.push('<div class=\'assign-page-number\'><span>共'+total+'页，跳转至</span><input total='+total+' class=\'page-number\'/><span>页</span></div>');
            c.push('</div>');
            return c.join(' ');
        }
    }
    //挂在翻页事件
    function flip(){
        $(document).on('click','.comment-wrap .comment-flip a',function(e){
            var $a = $(e.currentTarget);
            getCommentList(sort,$a.text());
            pn = $a.text();
        })
        $(document).on('keydown','.comment-wrap .assign-page-number input.page-number',function(e){
            if(e.keyCode == '13'){
                 var $a = $(e.currentTarget);
                var max = $a.attr('total');
                pn = $a.val();
                pn = pn<1?1:pn;
                pn = pn>max?max:pn;
                getCommentList(sort,pn);
            }
        });
    }
    global.comment = init
    //发表评论
    function publishComment(){
        console.log("551");
        //$(document).on('click','comment-wrap .comment-input .btn-comment',function(e){
        //
            $('.btn-comment').click(function(e){
            if($(e.currentTarget).hasClass('disabled')){
                return;
            }

            var $btn = $(e.currentTarget);
            var $holder = $btn.parents('.comment-input');
            var $val = $btn.prevAll('.cont-comment').val();
            var deep = 0;
            if($btn.hasClass('lock')){
                //feedback("正在回复中请不要重复操作");
                return;
            }
            if($val.length<3||$val.length>3000){
                //feedback('请输入3-1000个字的评论内容');
                new Tanchuang().init({
                    title:"输入错误",
                    w:300,
                    h:200,
                    dir:"center",
                    content:"请输入3-1000个字的评论内容",
                    mark:false
                })
                return
            }
            var option = {
                jsonp : 'jsonp',
                type : type,
                message : $val || '',
                plat : 1,
                time:new Date().getTime()/1000,
                //code : $captcha,
                //r : Math.random()
            };
                console.log(option);
            $btn.addClass("lock");
            $.ajax({
                url: urlConfig.baseUrl + urlConfig.specificUrl.sendReply,
                type: 'POST',
                dataType: 'json',
                xhrFields: {
                    withCredentials: true
                },
                data:option,
                success:function(data){
                    $btn.removeClass('lock');
                    //把这个评论加到页面上
                    if(true){
                        //sendMsg('发送成功');
                        $btn.prevAll('.cont-comment').val('');
                        getCommentList(sort,pn);
                        $('.captcha-holder').remove();
                    }
                },
                error:function(){
                    $btn.removeClass("lock");
                }
            });
        })
    }
    function human_date(t) {
        var now =Math.floor(new Date().getTime() / 1000);
        var td_start = new Date();
        td_start.setHours(0);
        td_start.setMinutes(0);
        td_start.setSeconds(0);
        td_start =Math.floor(td_start.getTime() / 1000);
        if (t > td_start && now - t >= 0) {
            if (now - t <= 60) {
                return  "刚刚";
            } else if (now - t < 3600) {
                return Math.floor((now - t) / 60) + "分钟前";
            } else {
                return Math.ceil((now - t) / 3600) + "小时前";
            }
        } else {
            var n_d = new Date();
            n_d.setTime(t*1000);
            var m = n_d.getMonth() + 1;
            var d = n_d.getDate();
            var H = n_d.getHours();
            var M = n_d.getMinutes();
            if (m < 10) m = "0" + m;
            if (d < 10) d = "0" + d;
            if (H < 10) H = "0" + H;
            if (M < 10) M = "0" + M;
            return n_d.getFullYear() + "-" + m + "-" + d + " " + H + ":" + M;
        }
    }

})(window)
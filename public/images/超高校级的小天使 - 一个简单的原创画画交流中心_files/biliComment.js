/**
 * 评论
 *
 * @author  liqian
 * @date    2016/06/08
 * @version 0.0.1
 * @depend  zepto 1.0以上的版本
 */
 
(function(global){
  // 判断zepto是否存在
    // 存在就直接使用
    // 不存在控制台里面加一个提示，退出
  //var $ = global.Zepto ? global.Zepto : (function(){console.warn('depend Zepto 1.0+');return;})();
  var $ = global.jQuery||global.Zepto;
  if (!$) {
    console.warn('depend Zepto 1.0+ or jQuery 1.7.2+');
  }
  // 全局变量定义
  var DOC = global.document;
  var urlConfig = {
    baseUrl: '//api.bilibili.com/x/reply',
    specificUrl: {
      'sendReply': '/add', //发表评论
      'getReply': '', //获取评论列表
      'getChildReply': '/reply', //获取子回复
      'getCount': '/count', //获取评论数
      'praise': '/action', //赞或者取消赞
      'report': '/report', //举报评论
      'getPosition': '/jump', //定位评论
      'upHide': '/hide', //隐藏评论
      'upShow': '/show', //显示评论
      'getCaptcha': '/captcha', //获取验证码
      'adminDelete': '/del' //前台删除评论
    }
  };
  var BILICOMMENT = 'biliComment';
  var pageSize = 10;
  var baseUrl = '/zzjs/20160611biliComment/';
  var CLICK = 'click.'+ BILICOMMENT +'';
  var tempDom;
  var pn,sort;//当前页码，排序方式
  var imgUrl;//验证码路径
  var type,
      aid,
      platform,
      ele,
      showMsg,
      pn,
      login,
      userLevel,
      quickReply,
      quickLogin,

      userFace;

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

  if (browser.version.mobile) {
    platform = 'mobile';
  } else{
    platform = 'pc';
  }
  // 入口
  function init(option){
    aid = option.aid;
    type = option.type;
    platform = option.platform || platform ;
    ele = option.ele;
    showMsg = option.showMsg || showMsg;
    pageSize = option.pageSize || pageSize;
    userLevel = option.userLevel ||userLevel;
    quickReply = option.quickReply || quickReply;    
    quickLogin = option.quickLogin || quickLogin;    
    userFace = option.userFace || 'http://static.hdslb.com/images/member/noface.gif';
    // 只有页面里面没有评论区域的时候才会执行下面的函数
    if($('div.'+ BILICOMMENT +'').size() <= 0) {
      //$('head').append('<link rel="stylesheet" type="text/css" href="http://www.bilibili.com'+ baseUrl +'css/index.css">');
      setOuterFrame(ele);
    }
  }

  // 构建一个外框（把评论区不会变动的区域搭建出来）
  function setOuterFrame(ele){
    
    var outFrame = [
      '<div class="comment-wrap '+ BILICOMMENT +(platform='mobile'?' mobile':'') +'">',
        '<div class="comment-number">共<span class="number"></span>条评论</div>',
        '<ul class="comment-type">',
          '<li class="type-list current" data-sort="0">默认排序</li>',
          '<li class="type-list" data-sort="2">按赞同数</li>',
          '<li class="type-list" data-sort="1">按回复数</li>',
        '</ul>',
        '<div class="comment-pager"></div>'
    ];

    if(getCookieParam("DedeUserID") && getCookieParam("DedeUserID__ckMd5") && getCookieParam("SESSDATA")) {
      // 如果已经登录
      var face = (typeof userFace == 'function') ? userFace() : userFace;
      var level = (typeof userLevel == 'function') ? userLevel() : userLevel;
      tempDom = [
        '<div class="comment-input show-loginout">', // 登陆之后为show-login;未登录为show-loginout
          '<div class=\'user-face\'>','<img src=\''+face+'\'>',
          (level>0?
            '</div><textarea class="cont-comment" placeholder="请输入3-1000个字的评论内容"></textarea>'
          : '</div><textarea class="cont-comment lock" style=\'text-align: center;line-height: 55px;color: #777;background-color:#e5e9ef\' placeholder="您的等级不足Lv1，不能发送评论" readonly=\'true\'></textarea>'
          ),
          '<button type="button" class="btn-comment '+(level>0?'':'disabled')+'">发表评论</button>',
        '</div>'
      ].join('');
      login = 1;
    }else {
      tempDom = [
        '<div class="comment-input show-login">',
          '<p class="tips-login">请先<a href=\'https://account.bilibili.com/login\' class="btn-login">登录</a>后发表评论 (・ω・)</p>',
          '<button type="button" class="btn-comment disabled">发表评论</button>',
        '</div>'
      ].join('');
      login = 0;
    }
    
    outFrame.push([
        tempDom +'<div class="comment-list">',
          '<img class="http://static.hdslb.com/images/d/loading.gif"/>',
        '</div>',
      '</div>'
    ].join(''));

    // 评论列表填充/评论数量获取
    $(ele).html(outFrame.join(''));
    if (platform) {
      $('.comment-wrap',$(ele)).addClass('mobile');
    }
    getCommentList(0);
    // 绑定筛选事件
    bindFilterEvent();
    // 发表评论
    publishComment();
    // 绑定换页事件
    flip();
    // 绑定登录事件
    commentLogin();

    //return $(outFrame.join(''))
  }

  // 获取评论列表(ajax)
  function getCommentList(sort, pn){
    //$('div.comment-list',$('div.'+ BILICOMMENT +'') ).html('');   
    $.ajax({
      url : urlConfig.baseUrl + urlConfig.specificUrl.getReply,
      type : 'GET',
      dataType : 'json',
      xhrFields: {
        withCredentials: true
      },
      data :{
              jsonp : 'jsonp',
              oid : aid,
              type : type,
              nohot : 1,
              pn : pn || 1,
              ps : pageSize,
              sort : sort || 0,
              r : Math.random()
            },
      success : function(data){
        var code = data.code;
        var $commentWrap = $('div.'+ BILICOMMENT +'');
        
        if(code === 0){
          var datas = data.data || {};
          // 如果需要验证码
          if(datas.need_captcha) {

          }

          // 总评论数
          $('span.number',$commentWrap).html(datas.page.acount || 0);
          // 评论列表
          $('div.comment-list',$commentWrap).html(setCommentList(datas.replies || {}));
          if(datas.page.acount>pageSize){
            $('div.comment-flip',$commentWrap).length
            ? $('div.comment-flip',$commentWrap).html( setFlipControl( pn||1 , Math.ceil(datas.page.count/pageSize) || 0 ) )
            : $('div.comment-list',$commentWrap).after( setFlipControl( pn||1 , Math.ceil(datas.page.count/pageSize) || 0 ) )
          }
          bindEveryListEvent();
        }else {
          tipsErrorMsg(code);
        }
      },
      error : function(){
        sendMsg('网络错误，请刷新重试');
      }
    });
  }

  // 定义一个方法生成评论区的评论列表（扔到外框里面）
  // isChild : 是否为回复的项
  function setCommentList(json, isChild){
    var commentListDom = [];
    var empty = '';
    var item;
    var member;
    var content;
    var childReply;

    for(var i = 0, len = json.length, plat; i < len; i++){
      item = json[i] || {};
      member = item.member || {};
      content = item.content || {};
      plat = content.plat || 0;
      childReply = item.replies || [];

      //'<p class="plat">'+ (plat > 1 ? "来自<a href=\'http://app.bilibili.com/\' target=\'_blank\'>"+ (plat == 2 ? '安卓客户端' : (plat == 3 ? 'iOS客户端' : 'Windows Phone客户端')) +"</a>" : "") +'</p>',
      commentListDom.push([
        '<div class="item '+ (isChild ? "child-item" : "") +'">',
          '<div class="photo">',
            '<a href="http://space.bilibili.com/'+ (item.mid || empty) +'" target="_blank" data-mid="'+ (item.mid || empty) +'" data-card="'+(member.uname || empty)+'">',
              '<img src="'+ (member.avatar || empty) +'" class="face">',
            '</a>',
          '</div>',
          '<div class="main">',
            '<a href="http://space.bilibili.com/'+ (item.mid || empty) +'" target="_blank" class="uname">'+ (member.uname || empty) +'</a>',
            '<a href="http://www.bilibili.com/html/help.html#k_'+ (member.level_info.current_level || 0) +'" class="lv lv_'+ (member.level_info.current_level || 0) +'"></a>',
            '<p class="content">'+ (detailMessage(content.message) || empty) +'</p>',
            '<div class="infor">'+ (isChild ? "" : "<p class=\"floor-num\">#"+ (item.floor || 0) +"</p>")+"<p class=\"time\">" + (human_date(item.ctime) || empty)+ "</p>",
              '<p class="tools" data-rpid="'+(item.rpid || empty) +'">', 
                '<span class=\"praise '+(login?'':'hidden')+'  \" data-action='+
                (item.action === 1 ?
                  "\"0\">已赞("+ (item.like || 0) +")</span>"  :
                  "\"1\">赞("+ (item.like || 0) +")</span>") ,
                '<span class="reply">'+ (childReply.length > 0 ? "参与回复" : "回复") +'</span>',
              '</p>',
            '</div>'+ (isChild ? "" : "<div class=\"child-reply "+ (childReply.length > 0 ? '' : 'hidden') +"\">"+ setCommentList(childReply, true) +render_recounts() +"</div>" )+'</div>',
        '</div>'
      ].join(''));
    }

    return commentListDom.join('');
    
    function render_recounts(){
      if (item.rcount>5) {
        return "<div class=\'more-rcount\' data-number=\'"+(item.rcount-childReply.length)+"\'>还有"+(item.rcount-childReply.length)+"条，<a class=\'load-more-rcount\'>点击查看</a></div>";
      } else{
        return '';
      }
    }

    function detailMessage(msg){
      var at_regexp = new RegExp(/@([^\s:：@~!#$%^&*\(\)<]{2,15})/g);
      var av_regexp = new RegExp(/av([0-9]+)/g);
      var dy_regexp = new RegExp(/dy([0-9]+)/g);

      return msg.replace(/\n/g, "<br />").replace(at_regexp, "<a href=\"javascript:;\" card=\"$1\">@$1</a>").replace(av_regexp, '<a href="/video/av$1" target="_blank" data-view="$1">av$1</a>').replace(dy_regexp, '<a href="/dy$1" target="_blank" data-view="$1">dy$1</a>');

    }
  }

  function getRootCommentList(root,pn,ele){
    $.ajax({
      url : urlConfig.baseUrl + urlConfig.specificUrl.getChildReply,
      type : 'GET',
      dataType : 'json',
      xhrFields: {
        withCredentials: true
      },
      data :{
              jsonp : 'jsonp',
              oid : aid,
              type : type,
              root : root,
              nohot : 1,
              pn : pn || 1,
              ps : 10,
              sort : sort || 0,
              r : Math.random()
            },
      success :function(data){
        var reply = $('.more-rcount',ele).attr('data-number');
        ele.html(setCommentList(data.data.replies||{},true));
        ele.append(setRootFlipControl(1,Math.ceil(data.data.page.count/10)));
      },
      error:function(){
        $('.more-rcount',ele).html('<span>加载错误，请<a class=\'reload-root-comment\'>点击重试</a></span>');
        $('a.reload-root-comment',ele).click(function(){
          getRootCommentList(root,1,ele);
        });
      }
    });
  }

  // 构建页码控制组件
  function setFlipControl(pn,total){
    if (total>1) {
      var c = ['<div class=\'comment-flip\'>'];
      if(total>5){
        if (pn<=4) {
          for(var i = 1;i <= 5&&i<=(pn+2);i++){
            c.push('<a href\'javascript:void(0)\' class="' +(pn==i?'on':'')+'" >'+i+'</a>');
          }
          c.push('<span>......</span><a href\'javascript:void(0)\'>'+ total +'</a>');
        } else if(pn>total-3){
          c.push('<a href\'javascript:void(0)\'>1</a><span>......</span>');
          for(var i = pn-2;i <= total;i++){
            c.push('<a href\'javascript:void(0)\' class="' +(pn==i?'on':'')+'" >'+i+'</a>');
          }
        } else{
          c.push('<a href\'javascript:void(0)\'>1</a><span>......</span>');
          for(var i = pn-2;i<=(pn*1+2);i++){
            c.push('<a href\'javascript:void(0)\' class="' +(pn==i?'on':'')+'" >'+i+'</a>');
          }
          c.push('<span>......</span><a href\'javascript:void(0)\'>'+total+'</a>');
        }
      }
      else{
        for(var i = 1;i <=total;i++){
          c.push('<a href\'javascript:void(0)\' class="' +(pn==i?'on':'')+'" >'+i+'</a>');
        }
      }
      c.push('<div class=\'assign-page-number\'><span>共'+total+'页，跳转至</span><input total='+total+' class=\'page-number\'/><span>页</span></div>');
      c.push('</div>');
      return c.join(' ');
    }
  }
  //子楼层页码控制
  function setRootFlipControl(pn,total){
    if (total>1) {
      var c = ['<div class=\'root-comment-flip\'>'];
      if(total>5){
        if (pn<=4) {
          for(var i = 1;i <= 5&&i<=(pn+2);i++){
            c.push('<a href\'javascript:void(0)\' class="' +(pn==i?'on':'')+'" >'+i+'</a>');
          }
          c.push('<span>......</span><a href\'javascript:void(0)\'>'+ total +'</a>');
        } else if(pn>total-3){
          c.push('<a href\'javascript:void(0)\'>1</a><span>......</span>');
          for(var i = pn-2;i <= total;i++){
            c.push('<a href\'javascript:void(0)\' class="' +(pn==i?'on':'')+'" >'+i+'</a>');
          }
        } else{
          c.push('<a href\'javascript:void(0)\'>1</a><span>......</span>');
          for(var i = pn-2;i<=(pn*1+2);i++){
            c.push('<a href\'javascript:void(0)\' class="' +(pn==i?'on':'')+'" >'+i+'</a>');
          }
          c.push('<span>......</span><a href\'javascript:void(0)\'>'+total+'</a>');
        }
      }
      else{
        for(var i = 1;i <=total;i++){
          c.push('<a href\'javascript:void(0)\' class="' +(pn==i?'on':'')+'" >'+i+'</a>');
        }
      }
      c.push('</div>');
      return c.join(' ');
    }
  }

  // 挂载翻页事件
  function flip(){
    $(document).on('click','.comment-wrap .comment-flip a',function(e){
      var $a = $(e.currentTarget);
      getCommentList(sort,$a.text());
      pn = $a.text();
    });
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
    //展开子楼层
    $(document).on('click','.comment-wrap .comment-list .child-reply .load-more-rcount',function(e){
      var $ele = $(e.currentTarget);
      var rootId = $ele.parents('.comment-list .main ').find('.infor .tools:eq(0)').attr('data-rpid');
      console.log(rootId);
      getRootCommentList(rootId,1,$ele.parents('.main:eq(0) .child-reply'));
    });
    //子楼层翻页
    $(document).on('click','.comment-wrap .root-comment-flip a',function(e){
      var $a = $(e.currentTarget);
      var $rootId=$('.infor .tools:eq(0)',$a.parents('.item')).attr('data-rpid');
      getRootCommentList($rootId,$a.text(),$a.parents('.child-reply'));
    });
  }


  // 登陆事件
  function commentLogin(){
    $(document).on('click','.comment-wrap .comment-input .btn-login',function(e){
      if (quickLogin) {
        quickLogin();

      } else if(!$(e.currentTarget).attr('href')){
        location.href = 'http://passport.bilibili.com/login?gourl='+encodeURIComponent(window.location.href);
      }
    });

  }

  // 发表评论
  function publishComment(){
    // var $commentWrap = $('div.'+ BILICOMMENT +'');
    // var $btn = $('button.btn-comment',$commentWrap);
    // var $cont = $('textarea.cont-comment',$commentWrap);
    
    $(document).on('focus.captcha','.comment-wrap .comment-input textarea',function(e){
      var $input = $(e.currentTarget).parents('.comment-wrap .comment-input');
      var level = (typeof userLevel == 'function') ? userLevel() : userLevel;
      if (level == 1) {
        _getCaptcha();
      }

      function _getCaptcha(){
        $.ajax({
          url : 'http://api.bilibili.com/x/reply/captcha',
          data : {jsonp:'jsonp'},
          xhrFields : {
            withCredentials : true
          }
        }).done(function(res){
          if (typeof res == 'object' && res.code == '0' &&res.data) {
            imgUrl = res.data.url;
            if($('.captcha-holder',$input).length){
              $('.captcha-holder img',$input).attr('src',imgUrl);
            } else{ 
              $input.append('<div class=\'captcha-holder\'>验证码：<input><img src='+imgUrl+'></div>');
            }
          } else if(res.code == '12024'){
            $(document).off('focus.captcha');
          }
        });
      }
    });

    $(document).on('click','.comment-wrap .comment-input .btn-comment',function(e){
      if($(e.currentTarget).hasClass('disabled')){
        return;
      }
      var $btn = $(e.currentTarget);
      var $holder = $btn.parents('.comment-input');
      var $val = $btn.prevAll('.cont-comment').val();
      var $captcha = $('.captcha-holder input',$holder).val();
      var deep = 0;
      if ($btn.hasClass('lock')){
        feedback('正在回复中请不要重复操作');
        return;
      }
      if($val.length < 3 || $val.length > 3000) {
        feedback('请输入3-1000个字的评论内容');
        return;
      }
      
      var option = {
          jsonp : 'jsonp',
          oid : aid,
          type : type,
          message : $val || '',
          plat : 1,
          code : $captcha,
          r : Math.random()
      };
      if ($btn.parents('.comment-list .item').length) {
        option.parent = option.root = $('.infor .tools:eq(0)',$btn.parents('.comment-list .item').not('.child-item') ).attr('data-rpid');
        deep = 1;
        if ($btn.parents('.comment-list .item.child-item').length) {
          option.parent = $('.infor .tools:eq(0)',$btn.parents('.comment-list .item.child-item')).attr('data-rpid');
          deep = 2;
        }
      }

      $btn.addClass('lock');
      $.ajax({
        url : urlConfig.baseUrl + urlConfig.specificUrl.sendReply,
        type : 'POST',
        dataType : 'json',
        xhrFields: {
          withCredentials: true
        },
        data : option,
        success : function(data){
          $btn.removeClass('lock');
          // 把这个评论加上去
          if(data.code =='0'){
            sendMsg('发送成功');
            $btn.prevAll('.cont-comment').val('');
            getCommentList(sort,pn);
            $('.captcha-holder').remove();
          }else if(data.code == '12015'){
            if ( $(e.currentTarget).parents('.comment-input').find('.captcha-holder').length ) {
              $(e.currentTarget).parents('.comment-input').find('.captcha-holder').html('<div class=\'captcha-holder\'>验证码：<input><img src="'+(data.data&&data.data.url||'')+'"></div>');
              feedback('验证码错误，请重试');
            }else{ 
              $(e.currentTarget).parent().append('<div class=\'captcha-holder\'>验证码：<input><img src="'+(data.data&&data.data.url||'')+'"></div>');
            }
          } else{
            sendMsg(tipsErrorMsg(data.code));
            feedback(tipsErrorMsg(data.code));
          }
        },
        error : function(){
          $btn.removeClass('lock');
          if(showMsg){
            showMsg('发送失败，请检查网络连接');
          } else if(window.MessageBox){
            new MessageBox().show($btn,'发送失败，请检查网络连接',3000,'error');
          }
        }
      });

      function feedback(msg){
        var tips;
        $btn = $(e.currentTarget);
        if(showMsg){
          showMsg(msg);
        } else{
          if ( $btn.parent().find('.reply-input-tips').length == 0 ){

            tips= $('<div class=\'reply-input-tips\' style=\'text-align:right;color:#ff80ad;margin-top:10px;font-weight:bold\'>'+msg+'</div>');
            $btn.after(tips);
          } else{
            tips = $btn.parent().find('.reply-input-tips');
            $btn.parent().find('.reply-input-tips').text(msg);
            tips.show();
          }
          setTimeout(function(){
            tips.hide();
          },5000);
        }
      }
    });
  }

  // 绑定筛选的事件（在构建外框完成了之后执行这个方法）
  function bindFilterEvent(){
    var CURRENT = 'current';
    var $commentWrap = $('div.'+ BILICOMMENT +'');
    var $type = $('ul.comment-type',$commentWrap);
    var $lis = $('li.type-list',$type);
    // 绑定到外框
    $type.off(CLICK).on(CLICK,function(e){
      var $target = $(e.target);
      if($target.hasClass('type-list')) {
        sort = parseInt($target.attr('data-sort')) || 0;
        getCommentList(sort);
        $lis.removeClass(CURRENT);
        $target.addClass(CURRENT);
      }
    });
  }

  // 针对每一个评论里面的功能绑定（绑定到外框上面）
  function bindEveryListEvent(){
    var $commentWrap = $('div.'+ BILICOMMENT +'');
    var $list = $('div.comment-list',$commentWrap);
    $list.off(CLICK).on(CLICK, function(e){
      if(userLevel=='0'||userLevel()=='0'){
        new MessageBox().show($0,'操作错误',3000);
        return;
      }
      var $ele = $(e.target);
      if($ele.hasClass('praise')) { // 赞/取消赞
        executePraise($ele);
      }else if($ele.hasClass('reply')) { //回复
        includedinReply($ele);
      }
    });
  }

  // 赞/取消赞
  function executePraise($ele){
    var rpid = $ele.parent().attr('data-rpid');
    var action = parseInt($ele.attr('data-action')) || 0;
    $.ajax({
      url : urlConfig.baseUrl + urlConfig.specificUrl.praise,
      type : 'POST',
      dataType : 'json',
      xhrFields: {
        withCredentials: true
      },
      data : {
        jsonp : 'jsonp',
        oid : aid,
        type : type,
        rpid : rpid,
        action : action
      },
      success : function(data){
        var code = data.code;
        if (code === 0) { //赞/取消赞成功
          var msg = action ? '赞同成功' : '取消赞同成功';
          var content = $ele.html();
          var zanNum = parseInt(/\d+/.exec(content)[0]);
          zanNum = action ? zanNum + 1 : zanNum - 1;
          // 数据更新
          $ele.attr('data-action',action === 0 ? 1 : 0);
          $ele.html((action?'已':'')+'赞('+ zanNum +')');
          sendMsg(msg);
        }else {
          if(code === 12011) { // 不合法的赞或者踩
            // TODO: 操作不合法
            sendMsg('操作不合法');
          }else if(code === 12007){ // 已经操作过了（赞或踩）
            // TODO: 已经操作过
          }else {
            sendMsg(tipsErrorMsg(code));
          }
        }
      },
      error : function(){
        sendMsg('网络错误，请刷新重试');
      }
    });
  }

  // 楼中楼回复
  function includedinReply($ele){
    if(quickReply){
      quickReply();
    } else{
      var input = !$ele.parents('.item:eq(0)').find('.comment-input').length;
      $('.comment-list .comment-input',ele).remove();
      if(input){
        var dom=$(tempDom);
        $ele.parents('.item .main:eq(0)').after(dom);
        $('textarea',dom).focus();
        var target = $ele.parents('.item .item.child-item').find('.main .uname');
        if( target.length>0 ){
          if (userLevel=='0'||userLevel()=='0') {
            $('textarea',dom).text('您的等级不足Lv1，不能发送评论');
          }else{            
            $('textarea',dom).text('回复 @'+target.text()+'：');
          }
        }
      }
    }
  }

  function sendMsg(msg){
    if (showMsg&& typeof showMsg == 'function') {
      showMsg(msg);
    }
  }

  // 错误处理（公用的错误返回值，每个接口单独的特殊返回在ajax单独处理）
  function tipsErrorMsg(code){
    var string;
    switch(code) {
      case -101: //未登录
        string =  '未登录';
        break;
      case -102: //节操不足
        string =  '节操不足';
        break;
      case -103: //用户被禁言
        string =  '您已被禁言';
        break;
      case -106: //账号没激活
        string =  '账号没有激活';
        break;
      case -107: //用户不是正式会员
        string =  '您还不是正式会员';
        break;
      case -500: //服务器内部错误 
        string =  '服务器内部错误';
        break;
      case -650: //等级太低
        string =  '等级太低';
        break; 
      case 12004: //禁止操作
        string =  '';
        break;
      case 12001:
        string = '已经存在评论主题';
        break;
      case 12002:
        string = '该作品禁止评论';
        break;
      case 12003:
        string = '该作品禁止回复';
        break;
      case 12004:
        string = '该作品无法回复';
        break;
      case 12005:
        string = '禁止举报';
        break;
      case 12006:
        string = '没有该评论';
        break;
      case 12007:
        string = '已经操作过了（赞或踩）';
        break;
      case 12008:
        string = '已经举报过了';
        break;
      case 12009:
        string = 'type参数不合法';
        break;
      case 12010:
        string = '不合法的父评论';
        break;
      case 12011:
        string = '不合法的赞或踩';
        break;
      case 12012:
        string = '不合法的举报';
        break;
      case 12013:
        string = '@人数过多';
        break;
      case 12014:
        string = 'cd时间未到不能评论';
        break;
      case 12015:
        string = '验证码错误未到不能评论';
        break;
      case 12016:
        string = '评论内容过滤到敏感词';
        break;
      case 12017:
        string = '评论内容需要审核';
        break;
      case 12018:
        string = '目前状态不能执行up主操作';
        break;
      case 12019:
        string = 'cd时间未到不能举报';
        break;
      case 12020:
        string = '举报不存在';
        break;
      case 12021:
        string = '已经处理该举报了';
        break;
      case 12022:
        string = '已经被删除了';
        break;
      case 12023:
        string = '短时间内不能发重复评论';
        break;
      case 12024:
        string = '用户不需要验证码';
        break;
      case 12025:
        string = '输入的内容过少或过多';
        break;
      case 12026:
        string = '低等级用户不能发带链接的评论';
        break;
      default: //未知错误
        string =  '未知错误';
        break;
    }
    return string;
  }

  // 时间显示计算
  function human_date(t) {
    var now = Math.floor(new Date().getTime() / 1000);
    var td_start = new Date();
    td_start.setHours(0);
    td_start.setMinutes(0);
    td_start.setSeconds(0);
    td_start = Math.floor(td_start.getTime() / 1000);
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
        n_d.setTime(t * 1000);
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
  // 获取cookie里面的值（用来判断登录）
  function getCookieParam(param) {
    var result, reg = new RegExp("(^| )" + param + "=([^;]*)(;|$)");
    return (result = DOC.cookie.match(reg)) ? result[2] : null;
  }
  console.log(' ');
  global.biliComment = init;
})(window);

var DRAW_BASE_URL = "http://h.bilibili.com";
/*消息窗*/
function FloatMessageBox(){}

FloatMessageBox.prototype = {
	wnd:null,
	result:"",
	btnText:"[ 点击返回 ]",
	show:function(type,mode,url,timeout){
		$(".container-grid-layout").removeClass("m-loading");
		$(".wnd-mask").remove();
		$(".messagebox").remove();
		var fmb=this;
		var target = $("body");
		var result_pic="";
		if(mode=="custom_err"||mode=="msg_err"||mode=="error"){ result_pic=" error";fmb.result="error"; }
		else {result_pic=" success";fmb.result="success"}
		var mask = $('<div class="wnd-mask"></div>');

		fmb.wnd = $('<div class="messagebox">'+
			'<div class="content">'+
			'<div class="title">消息框</div>'+
			'<div class="info clearfix">'+
			'<div class="msg-icon'+result_pic+'"></div>'+
			'<div class="text"></div>'+
			'</div>'+
			'<a class="a-btn">'+fmb.btnText+'</a>'+
			'</div></div>');

		fmb.init(type);
		$("a.a-btn",fmb.wnd).click(function(){
			if(typeof(url)!=="undefined"){
				if (url == 'javascript:history.go(-1);'){
					history.go(-1);
				}else if(url=="reload"){
					location.reload();
				} else{
					location.href=url;
				}
			} else if(fmb.result!="error"&&mode!="close"){
				location.reload();
			}
			fmb.close();
		});
		$("a",fmb.wnd).click(function(){
			if($(this).attr("reload")){
				location.reload();
			}
			mask.remove();
			fmb.wnd.remove();
		});
		mask.appendTo(target);
		fmb.startup_date = new Date();
		fmb.wnd.appendTo(target);
		fmb.wnd.css("margin-left",-fmb.wnd.outerWidth()/2);
		window._active_fmb = fmb;
		fmb.close = function()
		{
			mask.remove();
			fmb.wnd.remove();
			window._active_fmb = null;
		};
		/*setTimeout(function(){
		 $("a",msg).trigger("click");
		 },2000);*/
	},
	init:function(type){
		var fmb = this;
		var text = fmb.wnd.find(".text");
		switch(type){
			case "submit_video":
				text.html("投稿成功<br />查看投稿视频状态，<br />请进入——<a href='#video_manage'>「视频管理」</a>页面");
				break;
			case "edit_video":
				text.html("编辑成功<br />查看视频状态，<br />请进入——<a href='#video_manage'>「视频管理」</a>页面");
				break;
			case "submit_special":
				text.html("创建成功<br />查看创建专题状态，<br />请进入——<a href='#special_manage'>「专题管理」</a>页面");
				break;
			case "edit_special":
				text.html("编辑成功<br />查看创建专题状态，<br />请进入——<a href='#special_manage' reload=1>「专题管理」</a>页面");
				break;
			case "buy":
				text.html("购买成功！");
				break;
			case "save":
				text.html("保存成功！");
				break;
			case "exchange":
				text.html("兑换成功！");
				break;
			case "message": case "message_firend":
			text.html("发送成功！<br />你可以进入消息中心<br /><a href='#message'>「我的私信」</a>栏目中<br />查看对话记录");
			break;
			default:
				text.html(type);
				break;
		}
	},
	setBtnText:function(text){
		this.btnText = text;
	}
};

/*base.core.v2.js中的messagebox扩展*/
MessageBox.prototype.change = function(msg,timeout){
	var _mbox = this;
	$(".mini",_mbox.msg).text(msg);
	if(typeof(timeout)!="undefined"){
		_mbox.leftTimer=function()
		{
			clearTimeout(_mbox.timer);
			_mbox.timer = setTimeout(function(){
				clearTimeout(_mbox.timer);
				_mbox.close();
			},timeout);
		};
		_mbox.leftTimer();
	}
}
MessageBox.prototype.showEx = function(obj,msg,timeout,icon,onclick){
	var _mbox = this;
	_mbox.focusShowPos = "down";
	var dur=200,message="";
	if(typeof(msg)=="object"){
		message = msg.msg;
		if(typeof(msg.css)!="undefined"){
			var css = msg.css;
		}
		if(typeof(msg.animate)!="undefined"){
			var animate = msg.animate;
		}
		if(typeof(msg.dur)!="undefined"){
			dur = msg.dur;
		}
		if(typeof(msg.setPos)!="undefined"){
			var setPos = msg.setPos;
		}
	} else{
		message = msg;
	}
	_mbox.close = function(time){
		var self = this;
		var timeout = typeof(time)!="undefined"&&typeof(time)!="object"?time:500;
		$(self.bindobj).attr('hasMessageBox','');
		this.msgbox.fadeOut(timeout,_remove);
		function _remove(){
			self.msgbox.remove();
			if (self.evType == 'over')
			{
				$(self.bindobj).off('mouseover',self.incomingTimer);
			}
			$(self.bindobj).off(self.evType == 'over' ? 'mouseout' : 'blur',self.leftTimer);
		}
	}
	var msgbox = _mbox.show(obj,message,timeout,icon,onclick);
	if(typeof(msgbox)=="undefined") return;

	if(typeof(css)=="undefined"){
		css = {"height":"auto","top":"+=5","z-index":7000};
	}

	_mbox.msgbox.stop().css(css);

	function change(){
		obj.removeClass("error");
		_mbox.close();
		if(obj.is(":text")){
			obj.off("keyup",change);
		} else{
			obj.off("change",change);
		}
	}
	if(icon=="error"||icon=="warning"){
		obj.off("mouseout",_mbox.leftTimer);
		if(timeout!=0) {
			obj.off("mouseover",_mbox.incomingTimer);
		}
		_mbox.msgbox.addClass(icon);
		obj.addClass(icon);
		if(obj.is(":text")||obj.is("textarea")){
			obj.on("focus",change);
		} else if(obj.find(":text,textarea").length>0){
			obj.find(":text,textarea").on("focus",change);
		} else{
			obj.on("change",change);
		}
		if(typeof(onclick)=="function"){
			onclick();
		}
	} else if(icon=="loading"){
		_mbox.msgbox.off("mouseout",_mbox.leftTimer);
		obj.off("mouseout",_mbox.leftTimer);
		_mbox.msgbox.addClass("loading");
		obj.addClass("loading");
	} else if(icon=="finish"){
		_mbox.msgbox.addClass("finish");
	} else if(icon=="tips"){
		obj.off("mouseover",_mbox.incomingTimer);
		obj.off("mouseout",_mbox.leftTimer);
		_mbox.msgbox.addClass("finish");
	}
	if(setPos){
		setPos(_mbox.msgbox);
	}
	if(typeof(animate)=="undefined"){
		animate = {"top":"-=5"};
	}
	_mbox.msgbox.animate(animate,dur);
};
MessageBox.prototype.showLoading = function(obj,msg,timeout,icon,onclick){
	var _mbox = this;
	_mbox.show(obj,msg,timeout,icon,onclick);
	_mbox.bindobj.off("mouseout");
	_mbox.msgbox.off("mouseout");
}
MessageBox.prototype.scrollToMsg = function(obj){
	var target = null;
	if(typeof(obj)!="undefined"){
		target = obj;
	} else{
		target = $(this.bindobj);
	}
	$("html,body").animate({"scrollTop":target.offset().top-50},200);
};
MessageBox.prototype.resetPos = function(){
	var _mbox = this;
	var obj = _mbox.bindobj;
	//_mbox.focusShowPos = false;
	var effDirection = "down";
	if (_mbox.focusShowPos != "down" && ($(obj).offset().top + $(obj).outerHeight() + _mbox.msgbox.outerHeight() - $('body').scrollTop() > $(window).height() || _mbox.focusShowPos=='up'))
	{
		effDirection = "up";
		_mbox.position.top=($(obj).offset().top-_mbox.msgbox.outerHeight());
	}else
	{
		_mbox.position.top = $(obj).offset().top+$(obj).outerHeight();
	}
	_mbox.position.left = $(obj).offset().left;

	if (typeof(_mbox.sp_position)!="undefined"){
		_mbox.position=_mbox.sp_position;
	}
	_mbox.msgbox.css({"top":_mbox.position.top,"left":_mbox.position.left});
}

/*绑定说明文字tooltips*/
var bindToolTips = (function(){
	var _show = function(elem,text,pos,maxWidth){
		_remove();
		var e = elem;
		var top = e.offset().top,left = e.offset().left,offsetTop,offsetLeft;
		var tips = $('<div class="tool-tip"><div class="tip-arrow"></div><div class="tip-text"></div></div>');
		if(typeof(text)!="undefined"){
			$(".tip-text",tips).html(text);
		} else{
			$(".tip-text",tips).html(e.attr("tips"));
		}
		tips.appendTo("body");
		if(typeof(maxWidth)!="undefined"){
			$(".tip-text",tips).css("max-width",maxWidth);
		}
		var _pos;
		if(typeof(pos)!="undefined"){
			_pos = pos;
		} else{
			_pos = e.attr("tips-pos");
		}
		switch(_pos){
			case "t":
				offsetTop = -tips.outerHeight()-10;
				offsetLeft = tips.outerWidth()>e.outerWidth()?(-(tips.outerWidth()-e.outerWidth())/2):0;
				tips.addClass("tool-tip-t");
				break;
			case "b":
				offsetTop = e.outerHeight()+10;
				offsetLeft = tips.outerWidth()>e.outerWidth()?(-(tips.outerWidth()-e.outerWidth())/2):0;
				tips.addClass("tool-tip-b");
				break;
			case "l":
				offsetTop = tips.outerHeight()>e.outerHeight()?(-(tips.outerHeight()-e.outerHeight())/2):0;
				offsetLeft = -tips.outerWidth()-10;
				tips.addClass("tool-tip-l");
				break;
			case "r":
				offsetTop = tips.outerHeight()>e.outerHeight()?(-(tips.outerHeight()-e.outerHeight())/2):0;
				offsetLeft = e.outerWidth()+10;
				tips.addClass("tool-tip-r");
				break;
			default:
				offsetTop = e.outerHeight()+10;
				offsetLeft = tips.outerWidth()>e.outerWidth()?(-(tips.outerWidth()-e.outerWidth())/2):0;
				tips.addClass("tool-tip-b");
		}
		top += offsetTop;
		left += offsetLeft;
		tips.css({"top":top+5,"left":left,"opacity":0});
		tips.animate({"top":"-=5","opacity":1},200);
	};
	var _remove = function(){
		$(".tool-tip").remove();
	};
	var _mover = function(){
		var e = $(this);
		_show(e);
	};
	var _mout = function(){
		var e = $(this);
		_remove(e);
	};
	var _bind = function(parent){
		var items;
		if(typeof(parent)!="undefined"){
			items = $("[tips]",parent);
		} else{
			items = $("[tips]");
		}
		items.off("hover",_mover);
		items.off("hover",_mout);
		items.hover(_mover,_mout);
	};
	return {
		bind:_bind,
		show:_show,
		remove:_remove
	}
})();

/*统计字数*/
var bindStrLenCount = (function(){
	var _show = function(elem,maxLen){
		_remove();
		var e = elem;
		var top = e.offset().top,left = e.offset().left,offsetTop,offsetLeft;
		var count = $('<div class="strlen-count"></div>');
		var len = e.val().replace(/\r\n?/, "\n").length;
		count.html(len+"/"+maxLen);
		count.appendTo("body");
		offsetTop = -count.outerHeight()-1;
		offsetLeft = e.outerWidth()-count.outerWidth();
		top += offsetTop;
		left += offsetLeft;
		count.css({"top":top,"left":left});
		_checkLen(e,count,len,maxLen);
	};
	var _change = function(elem,maxLen){
		var e = elem;
		var count = $(".strlen-count");
		var len = e.val().replace(/\r\n?/, "\n").length;
		count.html(len+"/"+maxLen);
		var left = e.offset().left + e.outerWidth()-count.outerWidth();
		count.css({"left":left});
		_checkLen(e,count,len,maxLen);
	};
	var _checkLen = function(e,count,len,max){
		if(len>max){
			count.addClass("error");
			e.addClass("error");
		} else{
			count.removeClass("error");
			e.removeClass("error");
		}
	};
	var _remove = function(){
		$(".strlen-count").remove();
	};
	var _focus = function(){
		var e = $(this);
		var maxLen = parseInt(e.attr("maxLen"));
		_show(e,maxLen);
	};
	var _blur = function(){
		var e = $(this);
		_remove(e);
	};
	var _keyup = function(){
		var e = $(this);
		var maxLen = parseInt(e.attr("maxLen"));
		_change(e,maxLen);
	};
	var _bind = function(elem,max){
		var items = elem;
		items.attr("maxLen",max);
		items.off("focus",_focus);
		items.off("blur",_blur);
		items.focus(_focus);
		items.blur(_blur);
		items.keyup(_keyup);
	};
	return {
		bind:_bind
	};
})();

/*报错管理*/
function ErrMsgManage(){
	this.error=0;
	this.msgArray = [];
	this.firstErr = null;
}

ErrMsgManage.prototype = {
	init:function(){
		this.error=0;
		for(var i=0;i<this.msgArray.length;i++){
			if(this.msgArray[i].msgbox){
				this.msgArray[i].close(0);
			}
		}
		this.msgArray = [];
		this.firstErr = null;
	},
	showErrMsg:function(obj,msg,time,callback){
		var emm = this;
		if(emm.firstErr==null) emm.firstErr = obj;
		emm.msgArray[emm.error] = new MessageBox();
		if(typeof(msg)!="undefined"){
			var timeout = typeof(time)!="undefined"?time:0;
			emm.msgArray[emm.error].showEx(obj,msg,timeout,"error",callback);
			if(!emm.msgArray[emm.error].msgbox){
				emm.error--;
				emm.msgArray.pop();
			}
		}
		emm.error++;
	},
	removeErr:function(error){
		this.msgArray[error].needRemove = 1;
	},
	getIndex:function(target){
		var emm = this;
		for(var i=0;i<emm.msgArray.length;i++){
			if(emm.msgArray[i].bindobj.selector==target.selector){
				return i;
			}
		}
	}
}

UserStatus.onLoaded(function() {
	window.defaultDynObj = window.dynObjects.draw;
	window.dynObjects.draw.initMenu();
});

function load_img(imgs,callback){
	imgs.each(function(i,e){
		var img = $(e);
		img.css({"opacity":0});
		img.load(function(){
			var _img = $(this);
			if(typeof callback !="undefined"){
				callback(img);
			}
			_img.animate({"opacity":1},200);
		});
		img.error(function(){
			img.css({"opacity":1});
		});
	});
}

function loadNavLoginInfo(info){
	info.dynamic = {
		"v":0,"s":0,"r":0,"sp":0,"sb":0
	};
	window.biliLoginStatus = info;
	window.AttentionList = info.AttentionList;
	if (info.islogin)
	{
		var dynNum = 0;
		for(d in info.dynamic){
			dynNum += parseInt(info.dynamic[d]);
		}
		info.dynTotalNum = dynNum;
		var adminEnter = $(".admin");
		if(info.status == "ADMIN" || info.status == "CONTENT"){
			$("[admin=\"yes\"]",adminEnter).show();
		} else{
			$(adminEnter).remove();
		}
		$("#dyn_wnd").find(".notice_list").remove();
		$("li[guest=\"no\"]").show();
		$("li[guest=\"yes\"]").hide();
		var nav = $(".d_left_data");
		$("[guest=\"no\"]",nav).not("[admin=\"yes\"]").show();
		$("[guest=\"yes\"]",nav).hide();
		$(".i_face").attr("src", info.face);
		$(".index_name",nav).attr("title", info.nick);
		$(".index_name_a",nav).html(info.nick);
		$(".index_name_a",nav).attr("href", "/member?mod=space&uid="+info.uid+"&act=p_index");
		$(".i_person_space",nav).attr("href", "/member?mod=space&uid="+info.uid+"&act=p_index");
		$("#i_space_attention em",nav).html(info.attention_count||0);
		$("#i_space_fans em",nav).html(info.fans||0);
		$("#i_space_fav em",nav).html(info.favourite_count||0);
		$("#i_space_work em",nav).html(info.illust_count||0);
		var menu = $("#i_menu_profile");
		$(".uname",menu).html('<b>'+info.nick+'</b>');

		if (parseInt(__GetCookie('_cnt_at')))
		{
			$("#i_menu_msg_btn").addClass("tips");
			$("#at_num").html(parseInt(__GetCookie('_cnt_at')));
			$("#at_num").show();
		}

		if (dynNum)
		{
			$("#i_menu_msg_btn").addClass("tips");
			$("#dynamic_num").html(dynNum);
			$("#dynamic_num").show();
		}
		if (parseInt(info.dynamic.r))
		{
			$("#i_menu_msg_btn").addClass("tips");
			$("#review_num").html(parseInt(info.dynamic.r));
			$("#review_num").show();
		}
		if (parseInt(info.notify))
		{
			$("#i_menu_msg_btn").addClass("tips");
			$("#notify_num").html(parseInt(info.notify));
			$("#notify_num").show();
		}
		if (parseInt(info.pm))
		{
			$("#i_menu_msg_btn").addClass("tips");
			$("#pm_num").html(parseInt(info.pm));
			$("#pm_num").show();
		}
	}else
	{
		$("li[guest=\"no\"]").hide();
		$("li[guest=\"yes\"]").show();
		$(".d_left_data").remove();
		$(".attention_uplist").remove();
		$(".search_nav").css("margin-left","140px");
		$(".admin").remove();

	}
}

$(function(){
	var gotop = $('<div id="gotop"></div>').appendTo("body");
	gotop.click(function(){
		$("html,body").animate({"scrollTop":0},200);
	});
	$(window).scroll(function(){
		if($(this).scrollTop()>400&&$(document).height()>2.5*$(window).height()){
			gotop.fadeIn(200);
			gotop.css("left",$(".d_body").offset().left+$(".d_body").width()+20);
			gotop.css("top",$(window).height()-300);
		}
		else{
			gotop.fadeOut(200);
		}
	});
	$(window).resize(function(){
		gotop.css("left",$(".d_body").offset().left+$(".d_body").width()+20);
	});
});
$(function(){
	$("#notice").css("display","block");
});
$(function(){
	$('.uns_box').after('<div class="search_wrapper">\
		<form method="get" class="search-form" action="http://search.bilibili.com/drawyoo" id="search_frm" style="position: absolute" target="_blank">\
		<div class="search_input_wrapper"><input type="search"\
	id="search_kw"\
	class="search-field"\
	name="keyword"\
	placeholder="东方,miku,蓝白"\
	role="textbox"\
	autocomplete="off"\
	value=""\
	aria-autocomplete="list" aria-haspopup="true">\
		<input type="submit" class="search-submit" value="">\
		</div>\
		</form>\
		</div>');
	$('.b-post .i-link').attr('href','/upload.html');
	$('.b-post .s-menu').remove();
})
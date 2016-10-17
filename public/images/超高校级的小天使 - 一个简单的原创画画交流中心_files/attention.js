function setAttentionState(obj,uid,state){
	function _toAddAttention(){
		obj.removeClass("added");
		_setText(obj,"+关注");
		_setEvent(obj,0);
		obj.off("hover");
	}
	function _toDelAttention(){
		obj.addClass("added");
		_setText(obj,"已关注");
		_setEvent(obj,1);
		obj.hover(
			function(){
				_setText(obj,"取消关注");
			},
			function(){
				_setText(obj,"已关注");
			}
		);
	}
	function _setText(elem,text){
		if(elem.find("a").length>0){
			elem.find("a").html(text);
		} else{
			elem.html(text);
		}
	}
	function _setEvent(elem,event){
		if(elem.find("a").length>0){
			var a = elem.find("a");
			if(typeof event !="undefined" && event == 1){
				a.attr("href","/member?mod=attention&act=del&uid="+uid);
			} else{
				a.attr("href","/member?mod=attention&uid="+uid);
			}
		} else{
			elem.off("click");
			var url,msg,callback;
			if(typeof event !="undefined" && event == 1){
				url = "/member?mod=new_attention&mid="+uid+"&act=del";
				msg = "取消关注成功";
				callback = _toAddAttention;
			} else{
				url = "/member?mod=new_attention&mid="+uid+"&act=add";
				msg = "关注成功";
				callback = _toDelAttention;
			}
			elem.click(function(){
				$.get(url,function(data){
					if(data.code==0){
						new MessageBox({Overlap:true}).show(elem,msg);
						callback();
					} else{
						new MessageBox({Overlap:true}).show(elem,"请先登录");
					}
				});
			});
		}
	}
	if(typeof state != "undefined"){
		if(state==1){
			_toDelAttention();
		} else{
			_toAddAttention();
		}
	} else{
		if($.inArray(uid, window.AttentionList)>=0){
			_toDelAttention();
		} else{
			_toAddAttention();
		}
	}
}
function initAttentionState(elems,useAttList){
	function _bind(elems,state){
		elems.each(function(i,e){
			var e = $(e);
			if(e.attr("uid")){
				setAttentionState(e,parseInt(e.attr("uid")),state);
			}
		});
	}
	if(typeof useAttList == "undefined" || !useAttList){
		_bind(elems,1);
	} else{
		var timer = setInterval(function(){
			if(typeof window.biliLoginStatus !="undefined"){
				if(window.AttentionList){
					_bind(elems);
				}
				clearInterval(timer);
			}
		},100);	
	}
}
$(function(){
	var useAttList = useAttList || true;
	if(typeof attention_state !="undefined"){
		var mainAtt = $(".person .add_attention");
		if(mainAtt.attr("uid")){
			setAttentionState(mainAtt,parseInt(mainAtt.attr("uid")),attention_state);
		}
		var attList = $(".space_content .add_attention");
		if(attList.length>0){
			initAttentionState(attList,useAttList);
		}
	} else{
		initAttentionState($(".add_attention"),useAttList);
	}
});
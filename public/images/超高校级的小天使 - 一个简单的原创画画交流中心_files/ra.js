


function createRequestObj() {
  try {
    r = new XMLHttpRequest();
  } catch (trymicrosoft) {
    try {
      r = new ActiveXObject("Msxml2.XMLHTTP");
    } catch (othermicrosoft) {
      try {
        r = new ActiveXObject("Microsoft.XMLHTTP");
      } catch (failed) {
        r = false;
      }
    }
  }
  if (!r)
    return false;
  return r;
};
function ajaxCallback(targetFile,extraParam,targetObj)
{
	if (extraParam == undefined) extraParam = "";
	
	req = createRequestObj();
	if (!req) alert("Ajax initalize failure.");
	req.open("GET", targetFile+"?rndkey="+Math.random()+(extraParam ? "&"+extraParam : ""), true);
	req.onreadystatechange = function() {//Call a function when the state changes.
		if(this.readyState == 4 && this.status == 200) {
			targetObj(this.responseText);
		}
	}
	req.send(null);
	return false;
};
function ajaxCallback_NORAND(targetFile,extraParam,targetObj)
{
	if (extraParam == undefined) extraParam = "";
	
	req = createRequestObj();
	if (!req) alert("Ajax initalize failure.");
	req.open("GET", targetFile+(extraParam ? "?"+extraParam : ""), true);
	req.onreadystatechange = function() {//Call a function when the state changes.
		if(this.readyState == 4 && this.status == 200) {
			targetObj(this.responseText);
		}
	}
	req.send(null);
	return false;
};

function $_element(id){return document.getElementById(id);};

function loadfeeback(id,page){
	ajaxCallback('/review','il_id='+id+'&page='+page,function(msg){$(".p_review .comm").html(msg);
        $('.i_face').attr('src',biliLoginStatus.face);
    });
}

function rate(obj,oEvent){
	// if(obj.rateFlag) return;
	var e = oEvent || window.event;
	var target = e.target || e.srcElement; 
	var imgArray = obj.getElementsByTagName("a");
	for(var i=0;i<imgArray.length;i++){
	   imgArray[i]._num = i;
	   imgArray[i].onclick=function(){
			if (!confirm('是否确认要评分?每个作品只能评分一次')) return false;
			// if(obj.rateFlag) return;
			obj.rateFlag=true;
			o_rate = this._num+1;
			cl_on = 1;
			ajaxCallback("/review","il_id="+il_id+"&mod=rate&rate="+(this._num+1),function(msg){
				switch (parseInt(msg)){
					case 0: alert('评分成功'); break;
					case 1: alert('您已经评过分了'); break;
					case 2: alert('请先登陆'); break;
					default: alert('评分失败');
				}});
	   };
	}
	if(target.tagName=="A"){
	   for(var j=0;j<imgArray.length;j++){
		if(j<=parseInt(target._num)){
		 imgArray[j].className="star2";
		} else {
		 imgArray[j].className="star1";
		}
	   }
	} else {
	   for(var k=0;k<imgArray.length;k++){
		imgArray[k].className="star2";
	   }
	}
}

function sendpm(pm,title)
{
	$('.pmdiv').fadeIn(500);
	$('#pm_id').val(pm);
	if (title)
	{
		$('#pm_title').val(title);
		$('#pm_msg').focus();
	}else
	{
		$('#pm_title').focus();
	}
	return false;
}

function showjb()
{
	$('.jbdiv').fadeIn(500);
	$('#jb_msg').focus();
	return false;
}

function showpmmsg(pmid)
{
	if ($("#msg-txt-"+pmid).css("display")=="block") return false;
	$("#msg-txt-"+pmid).html("<img src=\"http://static.loli.my/images/d/loading.gif\" style=\"width:230px;height:73px\"/>");
	$("#msg-txt-"+pmid).css("display","block");
	ajaxCallback("/member","mod=msg&act=showmsg&pmid="+pmid,function(msg){$("#msg-txt-"+pmid).html(msg);});
	return false;
}

function e_showrate(d_total_rate,d_rate,cl_on){
	var man_num = Math.ceil(d_total_rate / d_rate);
	d_rate = (d_total_rate + o_rate) / (man_num + cl_on);
	_d_rate = Math.floor(d_rate);
	$star = $('.starWrapper a');
	for(var _r_i=0;_r_i<_d_rate;_r_i++)
	{
		$($star.get(_r_i)).removeClass();
		$($star.get(_r_i)).addClass('star2');
	}
}

function checkTagEditor(uid)
{
	if ($.cookie('drawyoo_admin') || $.cookie('drawyoo_id')==uid)
	{
		$("#addTag").show();
	}else
	{
		$(".comm-del").hide();
	}
}

function deleteComment(obj,rid)
{
	$(obj.parentNode.parentNode.parentNode).css("backgroundColor","#FDE");
	ajaxCallback('/member','mod=review&rid='+rid,function(msg){
		switch(parseInt(msg))
		{
			case 0: $(obj.parentNode.parentNode.parentNode).fadeOut(500); return true;
			case -1: alert("权限不足"); break;
			case -2: alert("评论不存在"); break;
			default: alert('未知错误');
		}
		$(obj.parentNode.parentNode.parentNode).css("backgroundColor","");
	});
	return false;
}

function loadNewRate()
{
	$.ajax({
	  url: '/ajax?mod=rate',
	  success: function(data) {
		$('#cNewRate').empty();
		var dat = eval(data);
		for (var i=0;i<dat.length;i++)
		{
			$("<li><a href=\"/dy"+dat[i].k+"\"><img src=\""+dat[i].i+"\" /><br />"+dat[i].t+"</a></li>").appendTo('#cNewRate');
		}
	  }
	});
	return false;
}

$(
	function(){
		$("#search_kw").attr("autocomplete","off");
		$("#search_kw").autocomplete({
					source: function( request, response ) {
						var tmp_term_lst = request.term.split(",");
						
						$.getJSON( "/suggest?jsoncallback=?", {
							term: tmp_term_lst[tmp_term_lst.length-1].replace(/　/g,""),
							rnd:Math.random()
						}, response );
					},
					search: function() {
						// custom minLength
						this.value=this.value.replace(/，/g,",");
						var term = this.value;
						var tmp_term_lst = term.split(",");
						if (tmp_term_lst[tmp_term_lst.length-1].length < 1) return false;
						
						if ( term.charCodeAt(0)<255 && term.length < 1 || term.length>10) {
							return false;
						}
					},
					focus: function() {
						// prevent value inserted on focus
						return false;
					},
					select: function( event, ui ) {
						var tmp_term_lst = this.value.split(",");
						_value = "";
						if (tmp_term_lst.length > 1)
						{
							for (i=0;i<tmp_term_lst.length-1;i++)
							{
								_value+=tmp_term_lst[i]+",";
							}
						}
						_value+=ui.item.value;
						this.value = _value;
						// $(".ui-search").submit();
						return false;
					}
				})
				.data( "autocomplete" )._renderItem = function( ul, item ) {
				return $( "<li></li>" )
					.data( "item.autocomplete", item )
					.append( "<a style=\"text-align:left\">" + item.value + "<em style=\"float:right;font-size:10px;\""+(item.match ? " title=\"(Match Token: "+item.match+")\"" : "")+">" + (item.desc ? item.desc : item.ref + "个")+"</em></a>" )
					.appendTo( ul );
			};
		if($("#frmTag_tag").size())
		{
			$("#frmTag_tag").attr("autocomplete","off");
			$("#frmTag_tag").autocomplete({
					source: function( request, response ) {
						$.getJSON( "/suggest?jsoncallback=?", {
							term: request.term.replace(/　/g,""),
							rnd:Math.random()
						}, response );
					},
					search: function() {
						// custom minLength
						var term = this.value;
						
						if ( term.charCodeAt(0)<255 && term.length < 1 || term.length>10) {
							return false;
						}
					},
					focus: function() {
						// prevent value inserted on focus
						return false;
					},
					select: function( event, ui ) {
						this.value = ui.item.value;
						return false;
					}
				})
				.data( "autocomplete" )._renderItem = function( ul, item ) {
					return $( "<li></li>" )
					.data( "item.autocomplete", item )
					.append( "<a style=\"text-align:left\">" + item.value + "<em style=\"float:right;font-size:10px;\""+(item.match ? " title=\"(Match Token: "+item.match+")\"" : "")+">" + (item.desc ? item.desc : item.ref + "个")+"</em></a>" )
					.appendTo( ul );
				};
		}
	}
);
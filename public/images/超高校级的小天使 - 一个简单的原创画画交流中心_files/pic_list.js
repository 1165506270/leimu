var select_index=0;
var mode = "default";
var MAX_HEIGHT = 600;
var MIN_HEIGHT = 400;
var page_btn_next = ".page_btn.next";
var page_btn_prev = ".page_btn.prev";

$(document).keyup(function(e)
{
	if(mode == "list") return;
    switch(e.which)
    {
        // user presses the "a"
        case 37:   prev_pic();
            break;

        // user presses the "s" key
        case 39:   next_pic();
            break;
        default :
            break;
    }
});
function prev_pic()
{
    if(select_index==0)
    {
    	if($(page_btn_prev).length>0){
    		new MessageBox().show($(page_btn_prev),"已经是第一页了哦");
    	}
        return;
    }
    else
    {
        select_index--;
        show_pic();
    }
}
function next_pic()
{
    if(select_index==list.length-1)
    {
    	if($(page_btn_next).length>0){
    		new MessageBox().show($(page_btn_next),"已经是最后一页了哦");
    	}
        return;
    }
    else
    {
        select_index++;
        show_pic();
    }
}
function show_pic(index,nohash){
	mode = "view";
	var pic_list = $(".pic_list").hide();
	if(typeof index !="undefined") select_index = index;
	if(typeof nohash == "undefined" || !nohash) location.hash = "p"+(select_index+1);
	if(typeof list[select_index] =="undefined") return;
	var img_wrapper = init_img_wrapper();
	img_wrapper.find(".img").remove();
	var loading = $('<div class="img-loading"></div>').appendTo(img_wrapper);
	var img = $('<a class="img" href="/dy'+list_id+'/'+list[select_index].id+'" target="_blank" title="点击查看原图"><img src="'+list[select_index].m_url+'" /></a>').appendTo(img_wrapper);
	load_img($("img",img),function(image){
		var height = image.height();
		if(height<MAX_HEIGHT){
			if(height>=MIN_HEIGHT){
				img_wrapper.height(height);
			} else{
				img_wrapper.height(MIN_HEIGHT);
				img.css("margin-top",(MIN_HEIGHT-img.height())/2);
			}
		} else{
			image.height(MAX_HEIGHT);
		}
		loading.fadeOut(200,function(){
			loading.remove();
		});
	});
	$(".page_btn.next").removeClass("disabled");
    $(".page_btn.prev").removeClass("disabled");
    if(select_index==0){
    	$(".page_btn.prev").addClass("disabled");
    }
    if(select_index==list.length-1){
    	$(".page_btn.next").addClass("disabled");
    }
}

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
function init_img_wrapper(){
	if($(".img_wrapper").length==0){
		var img_wrapper = $('<div class="img_wrapper"></div>').prependTo(".p_img");
	} else{
		var img_wrapper = $(".img_wrapper");
	}
	img_wrapper.height(MAX_HEIGHT);
	return img_wrapper;
}
$('<div class="pic_list"></div>').insertAfter('.img_wrapper').hide();
function toListMode(){
	mode = "list";
	location.hash = "";
	var pic_list = $(".pic_list");
	$(".img_wrapper,.page_btn").hide();
	pic_list.fadeIn();
	if(pic_list.children().length == 0){
		for(var i=0;i<list.length;i++){
			var item = $('<div class="p_block" ><img src="'+list[i].s_url+'"/></div>').appendTo(pic_list);
			(function(item){
				var index = item.index();
				load_img($("img",item));
				$("img",item).click(function(){
					init_img_wrapper();
					pic_list.hide();
					$(".page_btn").show();
					show_pic(index);
					$(".p_list_style").show();
					$(".img_wrapper").fadeIn();
				});
			})(item);
		}
	} else{

	}
}
$("#share_list .share-btn").click(function(){
	var btn = $(this);
	var id = btn.attr("id");
	switch(id){
		case "btn_weibo":
			openShareWindow('http://service.weibo.com/share/share.php?',{
			    url:wb_url,
			    type:'3',
			    count:'1', /**是否显示分享数，1显示(可选)*/
			    appkey:'1727689474', /**您申请的应用appkey,显示分享来源(可选)*/
			    title:wb_info +'    UP:'+ wb_name, /**分享的文字内容(可选，默认为所在页面的title)*/
			    pic:wb_img, /**分享图片的路径(可选)*/
				ralateUid:'', /**关联用户的UID，分享微博会@该用户(可选)*/
				language:'zh_cn', /**设置语言，zh_cn|zh_tw(可选)*/
			    rnd:new Date().valueOf()
			  });
			break;
		case "btn_qqweibo":
			openShareWindow('http://v.t.qq.com/share/share.php?',{
				title:wb_info +'    UP:'+ wb_name,
			    url:wb_url,
			    appkey:'84435a83a11c484881aba8548c6e7340', 
			    site:'http://www.bilibili.com/',
			    assname:'bilibiliweb',
			    pic:wb_img
			  });
			break;
		case "btn_qqzone":
			openShareWindow('http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?',{
			    url:wb_url,
			    showcount:1,
			    desc:wb_info,
			    summary:wb_summary,
				title:wb_info +'    UP:'+ wb_name,
				site:'哔哩哔哩',
				//pics:wb_img,
				style:'203',
				width:98,
				height:22,
				otype:"share"
			  });
			break;
		case "btn_baidu":
			openShareWindow('http://tieba.baidu.com/f/commit/share/openShareApi?',{
				title:wb_info +'    UP:'+ wb_name,
			    url:wb_url,
			    uid:726865,
			    to:'tieba',
			    type:'text',
			    relateUid:'',
			    pic:wb_img,
			    key:'', 
			    sign:'on',
			    desc:'',
			    comment:''
			  });
			break;
		default:

	}
});

function openShareWindow(base,param){
	var temp = [];
    for( var p in param ){
    	temp.push(p + '=' + encodeURIComponent( param[p] || '' ) );
    }
    var _u = base+temp.join('&');
    window.open(_u,'', 'width=700, height=680, top=0, left=0, toolbar=no, menubar=no, scrollbars=no, location=yes, resizable=no, status=no');
    return false;
}

function createShareImg(list){
	if(list.length>0){
		wb_img = list[0].s_url;
	}
}

function setRate(score){
	var scoreWrapper = $("#user_rate");
	var avgWrapper = $("#rate_avg");
	if(typeof d_rate != "undefined"){
		avgWrapper.find(".score_fill").css("width",Math.round(d_rate/10*100)+"%");
	}
	if(score!=-1){
		var score = Math.round(score / 2);
		scoreWrapper.addClass('rated');
		scoreWrapper.find("a:lt("+(score)+")").addClass("on");
		return true;
	}
	return false;
}

$(function(){
	var rated = setRate(rate);
	if(list.length>1){
		var list_style_btn = $('<a class="p_list_style m" title="返回图片列表"></a>').prependTo(".p_img").hide();
		var next_btn = $('<a class="page_btn next"></a>').prependTo(".p_img").click(function(){
			next_pic();
		});
		var prev_btn = $('<a class="page_btn prev"></a>').prependTo(".p_img").click(function(){
			prev_pic();
		});
		if(location.hash&&location.hash.indexOf("p")>=0){
			var index = parseInt(location.hash.match(/p([\d]*)/)[1]-1);
			if(index>=0&&index<list.length){
				list_style_btn.show();
				show_pic(index);
			} else{
				toListMode();
			}
		} else{
			toListMode();
		}
		list_style_btn.click(function(){
			$(this).hide();
			toListMode();
		});

	} else{
		init_img_wrapper();
		show_pic(0,true);
	}

	createShareImg(list);

	$(".fav_btn").click(function(){
		var btn = $(this);
		if(!fav){
			$.get("/member?mod=favourite&return=json&il_id="+il_id,function(response){
				if(response.state==200){
					btn.addClass("stowed").find(".txt").html("已收藏");
					fav = 1;
					new MessageBox().show(btn,"收藏成功");
				} else{
					new MessageBox().show(btn,response.data);
				}
			});
		} else{
			$.get("/member?mod=favourite&act=del&return=json&il_id="+il_id,function(response){
				if(response.state==200){
					btn.removeClass("stowed").find(".txt").html("收藏");
					fav = 0;
					new MessageBox().show(btn,"取消收藏成功");
				} else{
					new MessageBox().show(btn,response.data);
				}
			});
		}
	});
	$(".fav_btn").hover(
		function(){
			if(!fav) return;
			$(this).find(".txt").html("取消收藏");
		},
		function(){
			if(!fav) return;
			$(this).find(".txt").html("已收藏");
		}
	);
	if(!rated){
		var scoreWrapper = $("#user_rate");
		scoreWrapper.find("a").hover(
	        function(){
	            if(scoreWrapper.find('a[hasmessagebox="yes"]').length>0){
	            	return;
	            }
	            var btn = $(this);
	            var index = btn.index();
	            scoreWrapper.find("a:lt("+(index+1)+")").addClass("on");
	            scoreWrapper.find("a:gt("+(index)+")").removeClass("on");
	        },
	        function(){
	            if(scoreWrapper.find('a[hasmessagebox="yes"]').length>0){
	            	return;
	            }
	            var btn = $(this);
	            var index = btn.index();
	            if(index==0){
	                scoreWrapper.find("a").removeClass("on");
                    //scoreWrapper2.find("a").removeClass("on");
	            }
	        }
	    );
	    scoreWrapper.find("a").click(function(){
	        var btn = $(this);
	        var index = btn.index();
	        new MessageBox().show(btn,'是否确认要评分?每个作品只能评分一次',"button",function(){
		        $.ajax({
		            url:"/review",
		            data:{
		                il_id:il_id,
		                mod:"rate",
		                rate:(index+1)*2
		            },
		            success:function(data){
		                switch (parseInt(data)){
		                    case 0: 
		                    	rate=(index+1)*2;
		                    	new MessageBox().show(btn,'评分成功');
		                    	scoreWrapper.addClass("rated");
		                    	scoreWrapper.find("a").off("click");
		                    	scoreWrapper.find("a").off("hover");
		                    	break;
		                    case 1: new MessageBox().show(btn,'您已经评过分了'); break;
		                    case 2: new MessageBox().show(btn,'请先登陆'); break;
		                    default: new MessageBox().show(btn,'评分失败');
		                }
		            },
		            error:function(){
		                new MessageBox().show(btn,"网络错误");
		            }
		        });
	        });
	    });
	}
});

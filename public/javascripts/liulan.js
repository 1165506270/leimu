/**
 * Created by pl on 2016/10/9.
 */
$(function(){
    var index = 0;
    var flag = false;//传来的数据是否为空，默认false
    var flag1  = false;
    $(".borwseMode-siderBtn").click(function(){//为右部信息栏收缩按钮添加点击事件
        $(this).parent().css({"margin-right":"-222px"})//将右部信息margin-right设为-222px
        $(".borwseMode-siderBtn-back").show();//显示放大按钮
        $(".borseSiderBig").hide();//隐藏大信息栏
        $(".borwseSiderMini").css({"top":0})//把小信息栏放下
        $(".pubuliu").css("width","1300px")//为左边的图片显示盒子设置宽度，并重新瀑布流布局

    })
    $(".borwseMode-siderBtn-back").click(function(){
        $(this).parent().css({"margin-right":"0px"})//将右部信息margin-right设为0px
        $(this).hide()//隐藏这个放大按钮
        $(".borseSiderBig").show();//显示大信息栏
        $(".borwseSiderMini").css({"top":"-252px"})//将小信息栏top设为-252px，使其显示在浏览器窗口以外
        $(".pubuliu").css("width","1000px")//为左边的图片显示盒子设置宽度，并重新瀑布流布局

    })
    function getData(page){
        $.ajax({
            type:"get",
            url:"/huoqu",
            data:{"page":page},
            beforeSend:function(){
                if(flag){//当flag为true时不再发送ajax请求
                    return false;
                };
                if(flag1){
                    return false;
                };
                flag1 = true;
            },
            success:function(data){
                if(data.length==0){//当传来的数据长度为零时
                    flag=true;//将flag设为true
                    return;//跳出这个函数
                }
                for(var i=0;i<data.length;i++){//循环遍历传来的json数组，
                    $("<div>",{
                        html:"<a href='by"+data[i].uid+"'> "+
                        "<img src='http://og0ymg87t.bkt.clouddn.com/"+data[i].url+"-pic'>" +
                        "<div class='desc'>"+data[i].title+ "</div>" +
                        "</a>",
                        class:"item"
                    }).appendTo(".pubuliu");//生成元素，插入父元素最后面
                }
                $('.item img').load(function(){
                    $(this).css({
                        transition: "all 0.5s",
                        transform:"scale(1.2)"
                    }).one("transitionend",function(){
                        $(this).css({
                            transition: "all 0.2s",
                            transform:"scale(1)"
                        })
                    })
                })
                //$(".pubuliu").waterFall();//调用waterFall()进行瀑布流布局
                index++;
                flag1=false;
            }
        })
    }
    $(window).scroll(function(){
        if($(window).scrollTop()+$(window).height()>$(".pubuliu>.item:last-child").position().top+$(".pubuliu>.item:last-child").height()){
           getData(index);
        }
    })

    getData(index);//初始化
})
/**
 * Created by pl on 2016/10/9.
 */
$(function(){
    var index = 0;
    var flag = false;//�����������Ƿ�Ϊ�գ�Ĭ��false
    var flag1  = false;
    $(".borwseMode-siderBtn").click(function(){//Ϊ�Ҳ���Ϣ��������ť��ӵ���¼�
        $(this).parent().css({"margin-right":"-222px"})//���Ҳ���Ϣmargin-right��Ϊ-222px
        $(".borwseMode-siderBtn-back").show();//��ʾ�Ŵ�ť
        $(".borseSiderBig").hide();//���ش���Ϣ��
        $(".borwseSiderMini").css({"top":0})//��С��Ϣ������
        $(".pubuliu").css("width","1300px")//Ϊ��ߵ�ͼƬ��ʾ�������ÿ�ȣ��������ٲ�������

    })
    $(".borwseMode-siderBtn-back").click(function(){
        $(this).parent().css({"margin-right":"0px"})//���Ҳ���Ϣmargin-right��Ϊ0px
        $(this).hide()//��������Ŵ�ť
        $(".borseSiderBig").show();//��ʾ����Ϣ��
        $(".borwseSiderMini").css({"top":"-252px"})//��С��Ϣ��top��Ϊ-252px��ʹ����ʾ���������������
        $(".pubuliu").css("width","1000px")//Ϊ��ߵ�ͼƬ��ʾ�������ÿ�ȣ��������ٲ�������

    })
    function getData(page){
        $.ajax({
            type:"get",
            url:"/huoqu",
            data:{"page":page},
            beforeSend:function(){
                if(flag){//��flagΪtrueʱ���ٷ���ajax����
                    return false;
                };
                if(flag1){
                    return false;
                };
                flag1 = true;
            },
            success:function(data){
                if(data.length==0){//�����������ݳ���Ϊ��ʱ
                    flag=true;//��flag��Ϊtrue
                    return;//�����������
                }
                for(var i=0;i<data.length;i++){//ѭ������������json���飬
                    $("<div>",{
                        html:"<a href='by"+data[i].uid+"'> "+
                        "<img src='http://og0ymg87t.bkt.clouddn.com/"+data[i].url+"-pic'>" +
                        "<div class='desc'>"+data[i].title+ "</div>" +
                        "</a>",
                        class:"item"
                    }).appendTo(".pubuliu");//����Ԫ�أ����븸Ԫ�������
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
                //$(".pubuliu").waterFall();//����waterFall()�����ٲ�������
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

    getData(index);//��ʼ��
})
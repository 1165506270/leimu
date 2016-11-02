/**
 *
 * Created by me on 2016/10/22.
 */
$(function () {
    //选择性别
    $("#sex-ul").on("click","li",sexHandler);
    // $("#my-sb-save").on("click",mySaveHandler);
    //选择城市
    $("#province").change(createCity);
    //点击更换头像
    $("#face-change").click(function(){
        $("#file").trigger("click");
    })
    $("#file").change(function(){
        /* file：file控件
         * prvid: 图片预览容器
         */
        var fd = new FormData();
        fd.append("uid", getCookie("uid")||"");
        fd.append("upfile", this.files[0]);
        var file=this;
        var prvid = $("#face-avatar")[0];
        var filters = {
            "jpeg" : "/9j/4",
            "gif" : "R0lGOD",
            "png" : "iVBORw"
        };
        if(window.FileReader){
            //var fr = new FileReader();
            var reader = new FileReader();
            reader.onload = function(evt){prvid.src = evt.target.result;}
            reader.readAsDataURL(file.files[0]);
        }
    else { // 降级处理

        if ( !/\.jpg$|\.png$|\.gif$/i.test(file.value) ) {
            alert(tip);
        } else {
            showPrvImg(file.value);
        }
    }
        $.ajax({
            url:"/ceshi",
            data:fd,
            type:'post',
            processData: false,
            contentType: false,
            success:function(data){
                console.log(data);
            }
        })
})
    //保存信息
    //Ajax事件
    $("#my-sb-save").click(function(){
        $.ajax({
            type:"post",
            url:"/personal-save",
            data:{
                uid:getCookie("uid")||"",//获取登录用户的uid
                name:$(".user-id").val()||"",//昵称
                describe:$(".my-sign").val()||"",//个性签名
                birthday:$("#date").val()||"",//生日
                address:$("#province").val()+" "+$("#city").val()||"",//地址
                sex:$(".blue").text()||"",//性别
                maritalStatus:$("#marital").val()||""//婚姻状况
            },
            success:function(){
                alert("保存成功")
            }
        })
    })
});
/**
 * 性别点击的处理函数
 */
function sexHandler() {
    $(this).siblings().removeClass("blue").end().addClass("blue");
}


/**
 * 创建二级城市的处理函数
 * @returns {boolean}
 */
function createCity() {
    $("#city").html("<option>选择具体地区</option>");
    var city = cities[this.value];
    var options = document.createDocumentFragment();
    if (!city) return false;
    for (var i = 0; i < city.length; i++) {
        var option=document.createElement("option");
        option.innerHTML=city[i];
        options.appendChild(option);
    }
    $("#city").append(options);
}

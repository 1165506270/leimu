/**
 * Created by pl on 2016/10/28.
 */
    //var rect;
    var fd =new FormData();
var rects;
var cropper = new Cropper({
    aspectRatio: 1,
    element: document.getElementById('cropper-target'),
    previews: [
        document.getElementById('preview-large'),
        document.getElementById('preview-medium'),
        document.getElementById('preview-small')
    ],
    onCroppedRectChange: function(rect) {
       rects = rect;
        console.log(rects)
    }
});
var input = document.getElementById('cropper-input');
input.onchange = function() {
    fd.append("uid", getCookie("uid")||"");
    fd.append("upfile", this.files[0]);
    if (typeof FileReader !== 'undefined') {
        var reader = new FileReader();
        reader.onload = function (event) {
            cropper.setImage(event.target.result);
        };
        if (input.files && input.files[0]) {
            reader.readAsDataURL(input.files[0]);
        }

    } else { // IE10-
        input.select();
        input.blur();

        var src = document.selection.createRange().text;
        cropper.setImage(src);
    }
};
$(".btn-upload").click(function(){
    fd.append("left",rects.left);
    fd.append("width",rects.width);
    fd.append("height",rects.height);
    fd.append("top",rects.top);
    $.ajax({
        url:"/face_post",
        data:fd,
        type:'post',
        processData: false,
        contentType: false,
        success:function(data){
            console.log(data);
        }
    })
})
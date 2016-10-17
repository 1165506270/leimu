/**
 * Created by pl on 2016/10/19.
 */
function T() {
}
T.prototype.init = function (ipt) {
    var canvas = document.createElement("canvas");
    ipt.ele.appendChild(canvas);
    var cas = document.querySelector("canvas");
    var ctx = cas.getContext("2d");
    var data = ipt.data;
    var padding = ipt.padding;//内边距
    var color = ipt.color;//颜色
    cas.width = ipt.width;//设置canvas的宽度
    cas.height = ipt.height;//设置canvas的高度
    var x0 = 0 + padding,//设置坐标系的原点的x坐标
        y0 = ipt.height - padding,//设置坐标系原点的Y坐标
        maxWidth = cas.width - padding * 2,//坐标系横轴的最大长度
        maxHeight = cas.height - padding * 4;//坐标系竖轴最大长度
    ctx.fillStyle = color;//设置整个canvas的填充颜色
    ctx.beginPath();//开始绘制坐标系
    ctx.moveTo(x0, y0 - maxHeight - padding);
    ctx.lineTo(x0, y0);
    ctx.lineTo(x0 + maxWidth, y0);
    ctx.stroke();
    ctx.beginPath();//绘制竖轴的箭头
    ctx.moveTo(x0, y0 - maxHeight - padding / 2 - padding);
    ctx.lineTo(x0 - padding / 4, y0 - maxHeight + padding / 2 - padding);
    ctx.lineTo(x0, y0 - maxHeight - padding);
    ctx.lineTo(x0 + padding / 4, y0 - maxHeight + padding / 2 - padding);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();//绘制横轴的箭头
    ctx.moveTo(x0 + maxWidth + padding / 2, y0);
    ctx.lineTo(x0 + maxWidth - padding / 2, y0 - padding / 4);
    ctx.lineTo(x0 + maxWidth, y0);
    ctx.lineTo(x0 + maxWidth - padding / 2, y0 + padding / 4);
    ctx.closePath();
    ctx.fill();
    //开始根据数据绘制条形图
    var temp = (maxWidth / data.length) - 3;//计算出每个条形图的宽即间距
    var max = data[0]["num"];//假设最大的数值是第一个数据
    for (var i = 0; i < data.length; i++) {//遍历数组，找出最大的数值
        if (max < data[i]["num"]) {
            max = data[i]["num"];
        }
    }
    for (var i = 0; i < data.length; i++) {
        (function (i) {
            var y = y0;
            var x = x0 + temp / 2 + i * temp;//根据间距计算条形图左上角的x坐标
            var maxY = y0 - data[i]["num"] / max * maxHeight;//根据当前数值与最大值的比值计算出左上角y坐标
            var width = temp / 2;//图形的宽
            var height = data[i]["num"] / max * maxHeight;//根据当前数值与最大值的比值计算出图形高度
            var tep = height;
            var time = setInterval(function () {
                y = y - (height - tep)
                if (y < maxY) {
                    clearInterval(time);
                    y = maxY
                }
                ctx.clearRect(x, y - padding * 2, width, y0 - y + padding);
                ctx.beginPath();
                ctx.fillRect(x, y, width, y0 - y);//绘制图形
                ctx.font = ipt.font//设置字体样式
                ctx.textAlign = "center"//将字体水平对齐方式设为居中
                ctx.fillText(data[i]["title"], x + temp / 4, y0 + padding / 1.5);//该图形的文字描述
                ctx.fillText(data[i]["num"], x + temp / 4, y - padding);//该图形的数值
                tep -= 30;
            }, 100)
        })(i)
    }
}
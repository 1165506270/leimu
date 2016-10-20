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
    var padding = ipt.padding;//�ڱ߾�
    var color = ipt.color;//��ɫ
    cas.width = ipt.width;//����canvas�Ŀ��
    cas.height = ipt.height;//����canvas�ĸ߶�
    var x0 = 0 + padding,//��������ϵ��ԭ���x����
        y0 = ipt.height - padding,//��������ϵԭ���Y����
        maxWidth = cas.width - padding * 2,//����ϵ�������󳤶�
        maxHeight = cas.height - padding * 4;//����ϵ������󳤶�
    ctx.fillStyle = color;//��������canvas�������ɫ
    ctx.beginPath();//��ʼ��������ϵ
    ctx.moveTo(x0, y0 - maxHeight - padding);
    ctx.lineTo(x0, y0);
    ctx.lineTo(x0 + maxWidth, y0);
    ctx.stroke();
    ctx.beginPath();//��������ļ�ͷ
    ctx.moveTo(x0, y0 - maxHeight - padding / 2 - padding);
    ctx.lineTo(x0 - padding / 4, y0 - maxHeight + padding / 2 - padding);
    ctx.lineTo(x0, y0 - maxHeight - padding);
    ctx.lineTo(x0 + padding / 4, y0 - maxHeight + padding / 2 - padding);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();//���ƺ���ļ�ͷ
    ctx.moveTo(x0 + maxWidth + padding / 2, y0);
    ctx.lineTo(x0 + maxWidth - padding / 2, y0 - padding / 4);
    ctx.lineTo(x0 + maxWidth, y0);
    ctx.lineTo(x0 + maxWidth - padding / 2, y0 + padding / 4);
    ctx.closePath();
    ctx.fill();
    //��ʼ�������ݻ�������ͼ
    var temp = (maxWidth / data.length) - 3;//�����ÿ������ͼ�Ŀ����
    var max = data[0]["num"];//����������ֵ�ǵ�һ������
    for (var i = 0; i < data.length; i++) {//�������飬�ҳ�������ֵ
        if (max < data[i]["num"]) {
            max = data[i]["num"];
        }
    }
    for (var i = 0; i < data.length; i++) {
        (function (i) {
            var y = y0;
            var x = x0 + temp / 2 + i * temp;//���ݼ���������ͼ���Ͻǵ�x����
            var maxY = y0 - data[i]["num"] / max * maxHeight;//���ݵ�ǰ��ֵ�����ֵ�ı�ֵ��������Ͻ�y����
            var width = temp / 2;//ͼ�εĿ�
            var height = data[i]["num"] / max * maxHeight;//���ݵ�ǰ��ֵ�����ֵ�ı�ֵ�����ͼ�θ߶�
            var tep = height;
            var time = setInterval(function () {
                y = y - (height - tep)
                if (y < maxY) {
                    clearInterval(time);
                    y = maxY
                }
                ctx.clearRect(x, y - padding * 2, width, y0 - y + padding);
                ctx.beginPath();
                ctx.fillRect(x, y, width, y0 - y);//����ͼ��
                ctx.font = ipt.font//����������ʽ
                ctx.textAlign = "center"//������ˮƽ���뷽ʽ��Ϊ����
                ctx.fillText(data[i]["title"], x + temp / 4, y0 + padding / 1.5);//��ͼ�ε���������
                ctx.fillText(data[i]["num"], x + temp / 4, y - padding);//��ͼ�ε���ֵ
                tep -= 30;
            }, 100)
        })(i)
    }
}
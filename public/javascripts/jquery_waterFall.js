/**
 * Created by Administrator on 2016/9/20.
 */
/*我们需要来设置所有item项的布局*/

/*$.fn:是jquery所有对象中方法命名空间，也就意味着，这个命名空间下的方法，所有jquery对象都能使用。意味着我们如果在这个命名空间下定义方法那么所有的jquery对象都能使用*/
$.fn.waterFall=function(){
    var pad=10;//默认的边距

    /*1.获取当前调用瀑布流插件的items的宽度*/
    var totalWidth=$(this).width();
    /*2.获取所有的需要进行布局的子元素item集合*/
    var items=$(this).children();
    /*3.获取每一个item的宽度:jq中，width()获取元素的宽度，如果元素是数组，那么就会获取数组中每一个元素的宽度*/
    var itemWidth=items.width();
    /*4.计算总列数*/
    var cols=Math.floor(totalWidth/itemWidth);
    /*5.获取item的高度*/
    var itemHeight;

    /*6.创建数组存储指定列数的高度值*/
    var itemY=[]; //0-110  1-100  2-115

    /*7.遍历，为每一个item项设置定位*/
    items.each(function(index,value){ //0 蓝色
        itemHeight=$(value).height();
        /*第一行的处理方式*/
        if(index < cols){
            /*设置好item的样式*/
            $(value).css({
                top:0,
                left:pad+(pad+itemWidth)*index
            });
            console.log(cols);
            /*将当前每一列的高度值存储到数组*/
            itemY[index]=itemHeight;
        }
        else {
            /*找到数组中高度最小的索引，这个索引就是我当前这个元素需要放置的列*/
            var minCol=0;
            var minHeight=itemY[0];
            /*遍历，查询最小列*/
            for(var i=0;i<cols;i++){
                if(minHeight > itemY[i]){
                    /*说明之前的不是最小列，当前i才是*/
                    minCol=i;
                    minHeight=itemY[i];
                }
            }
            /*获取最小列之后，设置item的样式*/
            $(value).css({
                top:minHeight+pad,
                left:pad+(pad+itemWidth)*minCol
            });
            /*重新设置当前数组指定索引位置的高度值*/
            itemY[minCol]= itemY[minCol]+pad+itemHeight;
        }
    });

    /*设置整个items的高度*/
    var maxCol=0;
    var maxHeight=itemY[0];
    for(var i=0;i<cols;i++){
        if(maxHeight < itemY[i]){
            maxCol=i;
            maxHeight=itemY[i];
        }
    }
    /*设置items的高度*/
    $(this).height(270);
}
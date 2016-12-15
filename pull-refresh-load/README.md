# pull-refresh-load
轻量级下拉刷新/上拉加载

# 简介
之前做下拉刷新和上拉加载，尝试了很多方式，也包括iscroll框架等。发现总有不如意的地方。比如使用iscroll框架，会发现在旧的android设备下，数据量大的情况会出现很多问题，比如卡、闪白等等。
总结了下，不能自己通过touch事件来模拟滚动条，因为在旧设备和大数据量的情况下回出现兼容问题。而且类似iscroll的框架太重，就为了下拉刷新和上来加载就自己模拟滚动，不是很好。
总结了下就自己简单封装一个。

# demo在线预览
* http://cdn.ouchuanyu.com/pull/demo/demo.html
* ![](http://cdn.ouchuanyu.com/pull/url.jpg)

# 使用方式

* 依赖Zepto或者jquery库
* 在html中引入 css/pull.css和js/pull.js
* 通过new Pull(options)来初始化Pull组件
* Html结构参考demo/demo.html
```
<!DOCTYPE html>
<html>

<head>
    <meta charset='utf-8'>
    <title>下拉刷新/上拉加载 demo</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <link rel='stylesheet' href='../css/pull.css'>
    <link rel='stylesheet' href='./demo.css' inline>

</head>

<body>
    <div id="scroll" class="scroll">
        <!-- pull down 元素将插入到这里 -->
        <div id="list" class="device3d">
            <!-- 列表里的元素插入到这里 -->
        </div>
        <!-- pull up 元素将插入到这里 -->
    </div>

    <script type='text/javascript' src='../plugins/zepto.min.js'></script>
    <script type='text/javascript' src='../js/pull.js'></script>
    <script type='text/javascript' src='./demo.js' inline></script>
</body>

</html>

```

* Pull组件的API使用参考 demo/demo.js


# new Pull(options)中的构造参数options的字段如下
* scroller ： 滚动区域的dom
* scrollArea ： 滚动容器的dom
* pullDown ：下拉刷新监听  pullDown函数格式function(pull){}
* pullUp ： 上拉加载监听   pullDown函数格式function(pull){}

# pull实例对象的方法
* refresh(state) : 用于刷新滚动区域和上下拉条的状态, state参数格式如下
```
{
  lockUp: false, // 上拉锁定
  lockDown: false, // 下拉锁定
  hasNext: false // 是否还有下一条
}
```

# h5-AebApp-pullupRefresh-PullupLoadMore

# pull-to-refresh

一款基于iscroll5的下拉刷新，上拉加载的的插件。

## 使用

```html
  <script src="../iscroll-probe.js"></script>
  <script src="../jquery.js"</script>
  <script scr="../pulltofresh.js"></script>
  <script>
    $("#wrapper").pulltofresh();
  </script>
```

## 参数

```js
  delector: { //选择器
      container: '#wrapper', //iscroller的盒子
      headBox: '.head',   //头部更新盒子
      footBox: '.foot' //上拉刷新盒子
  },
  scrollSettings: { //给scroll传入的参数
      probeType: 3,
      mouseWheel: true
  },
  loadUrl: 'img/ajax-loader.gif', //加载图片的url
  arrowUrl: 'img/arrow.png',  //下拉刷新图片的url
  initScroll: -100,   //初始滚动大小
  pulltoload: null, // 上拉加载的ajax函数
  refresh: null //下拉刷新的ajax函数
};
```



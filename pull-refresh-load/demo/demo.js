(function(){

    var $container = null,
        pull = null;

    var PAGE_SIZE = 10,
        seq = 0;

    function query(clean, cb){
        // 模拟异步查询数据
        setTimeout(function(){
            if(clean){
                $container.children().remove();
                seq = 0;
            }

            for(var i=0;i<PAGE_SIZE;i++){
                seq++;
                var html =
                    '<article class="list-item">' +
                        '<div class="pic"><img src="./pic.jpg"/></div>' +
                        '<div class="flex">' +
                            '<header>作者:ouchuanyu@163.com</header>' +
                            '<section>简介简介简介简介简介简介简介简介简介简介简介简介简介简介</section>'
                        '</div>' +
                    '</article>';
                $container.append(html);
            }

            var hasNext = seq <= 50; // 假设只有50条数据
            cb && cb(hasNext);
        }, 1000);
    }

    function init(){
        $container = $('#list');
        pull = new Pull({
            scrollArea : window,
            scroller : document.querySelector('#scroll'),
            pullUp : function(that){
                query(false, function(hasNext){
                    that.refresh({
                        lockUp : false,// 释放上拉锁定
                        hasNext : hasNext
                    });
                });
            },

            pullDown : function(that){
                query(true, function(hasNext){
                    that.refresh({
                        lockDown : false, // 释放下拉锁定
                        hasNext : hasNext
                    });
                });
            }
        });

        query(false, function(hasNext){
            pull.refresh({
                hasNext : hasNext
            });
        });
    }

    $(init);

}());

(function(window, document) {
    var PULL_LOADING_DOM = '<div class="loading pull"><i class="icon"></i><span></span></div>';
    var PULL_UP_THRESHOLD = 10;
    var PULL_DOWN_MAX_HEIGHT = 50;

    // 上下拉状态值
    var STATE_INIT = 0, // 初始状态
        STATE_FLIP = 1, // 临界状态
        STATE_LOADING = 2, // 加载中
        STATE_DIE = 3; // 没有数据, 仅针对上拉加载

    // 上下拉的方向
    var DIRECTION_DOWN = 0,
        DIRECTION_UP = 1;

    // pull条的状态、图标和文本
    var STATES = [{
        state: STATE_INIT,
        pullUp: {
            icon: 'icon-arrow-up2',
            txt: '上拉加载更多'
        },
        pullDown: {
            icon: 'trans icon-arrow-down2',
            txt: '下拉刷新'
        }
    }, {
        state: STATE_FLIP,
        pullUp: {
            icon: 'icon-arrow-down2',
            txt: '松开加载更多'
        },
        pullDown: {
            icon: 'trans flip icon-arrow-down2',
            txt: '松开刷新'
        }
    }, {
        state: STATE_LOADING,
        pullUp: {
            icon: 'icon-spinner',
            txt: '加载中'
        },
        pullDown: {
            icon: 'icon-spinner',
            txt: '加载中'
        }
    }, {
        state: STATE_DIE,
        pullUp: {
            txt: '没有更多内容'
        }
    }];

    // 记录内容区域的高度
    function sizes(that) {
        that._contentHeight = that.scroller.height();
    }

    // 获取Y坐标
    function pointY(e) {
        return e.touches ? e.touches[0].pageY : e.pageY;
    }

    // 设置pull条的状态
    function setState(that, state, isPullUp) {
        // 上拉/下拉条的dom
        var dom = isPullUp ? that.pullUpDom : that.pullDownDom;

        // 配置信息
        var stateCfg = STATES[state];
        if (isPullUp) {
            that.state.pullUp = state;
            stateCfg = stateCfg.pullUp;
        } else {
            that.state.pullDown = state;
            stateCfg = stateCfg.pullDown;
        }

        // 设置图标和文字
        dom.children('span').text(stateCfg.txt);
        dom.children('i').prop('className', stateCfg.icon ? 'icon ' + stateCfg.icon : '');
    }

    /**
     * 下拉/上拉 刷新/加载
     * @param {Object} opts [参数]
     * {
     *     scroller : dom, // 滚动区域的dom
     *     scrollArea : dom, // 滚动区域的dom
     *
     * 	   pullDown : function(){},  //下拉刷新监听
     * 	   pullUp : function(){}  //上拉加载监听
     * }
     */
    function Pull(opts) {
        console.log('Pull组件初始化.');
        var scrollArea = $(opts.scrollArea),
            scroller = $(opts.scroller),
            // 状态信息
            state = {
                lockUp: false, // 上拉锁定
                lockDown: false, // 下拉锁定
                hasNext: false // 是否还有下一条
            };

        this.scrollArea = scrollArea; // 滚动容器区域
        this.scroller = scroller; // 滚动内容
        this.state = state;

        var that = this; //自己

        var $win = $(window),
            resetPullDownHeight = false, // 是否重置下拉刷新条的高度
            scrollTop = null, // 滚动高度
            startY = null; // 当前Y坐标

        // 开始了
        function start(event) {
            // 记录开始的滚动高度和开始坐标
            scrollTop = scrollArea.scrollTop();
            startY = pointY(event);

            // 监听事件
            scrollArea.on('touchmove', move);
            $win.one('touchend ouchcancel', end);
        }

        // 移动中
        function move(event) {
            // 下拉锁定了
            if (that.state.lockDown) {
                return;
            }

            var currY = pointY(event); // 当前坐标
            var diff = currY - startY; // 相对开始偏移了多少
            var direction = diff > 0 ? DIRECTION_DOWN : DIRECTION_UP; // 方向

            // 当前滚动高度
            var currScrollTop = scrollArea.scrollTop();
            // 如果拉到顶了，并且还要上拉，就开始把上拉刷新的条要搞出来
            if (currScrollTop <= 0 && direction === DIRECTION_DOWN) {
                event.preventDefault(); // 防止safari下的默认回弹效果


                if (diff >= PULL_DOWN_MAX_HEIGHT) { // 临界状态-松开刷新
                    if (that.state.pullDown !== STATE_FLIP) {
                        setState(that, STATE_FLIP, false);
                    }
                } else { // 初始状态-下拉刷新
                    if (that.state.pullDown !== STATE_INIT) {
                        setState(that, STATE_INIT, false);
                    }
                }

                // 设置高度
                that.pullDownDom.height(diff);
                if (resetPullDownHeight) {
                    resetPullDownHeight = false;
                }
            } else {
                // 回复高度
                if (!resetPullDownHeight) {
                    resetPullDownHeight = true;
                    that.pullDownDom.height(0);
                }
            }
        }

        // 结束
        function end() {
            // 去掉事件监听
            scrollArea.off('touchmove');

            // 锁定了下拉
            if (that.state.lockDown) {
                return;
            }

            // 触发下拉刷新函数
            if (that.state.pullDown === STATE_FLIP) {
                that.pullDownDom.css('height', 'auto');
                that.state.lockDown = true;
                setState(that, STATE_LOADING, false);
                opts.pullDown(that);
            } else if (that.pullDownDom.height() > 0) { // 不触发，回弹回去
                that.pullDownDom.height(0);
            }
        }

        // 上拉加载 - 通过scroll事件控制
        function onscroll() {
            // 锁定了或者压根没有下一条数据了
            if (state.lockUp || !state.hasNext) {
                return;
            }

            var viewHeight = scrollArea.height(); // 滚动区域高度
            var currScrollTop = scrollArea.scrollTop(); // 当前滚动高度

            // 到达临界值，触发事件
            if ((that._contentHeight - PULL_UP_THRESHOLD) <= (viewHeight + currScrollTop)) {
                state.lockUp = true;
                setState(that, STATE_LOADING, true);
                opts.pullUp(that);
            }
        }

        // 初始化上拉加载
        if (opts.pullUp) {
            console.log('初始化上拉加载DOM');
            this.pullUpDom = $(PULL_LOADING_DOM);
            this.pullUpDom.addClass('pull-up');
            scroller.append(this.pullUpDom);
            scrollArea.on('scroll', onscroll);
            setState(this, STATE_INIT, true);
        }

        // 初始化下拉刷新
        if (opts.pullDown) {
            console.log('初始化下拉刷新DOM');
            this.pullDownDom = $(PULL_LOADING_DOM);
            this.pullDownDom.addClass('pull-down');

            this.pullDownDom.insertBefore(scroller.children().first());
            setState(this, STATE_INIT, false);
            scrollArea.on('touchstart', start);
        }

        // 当window窗口高度变化了，刷新高度纪录值
        $win.on('resize', function() {
            sizes(that);
        });
        sizes(this);
    }

    Pull.prototype = {
        // 重新设置高度，重新设置状态
        refresh: function(state) {
            sizes(this);

            // 纪录高度
            if (this._contentHeight - this.scrollArea.height() > 0) {
                if (this.pullUpDom && !this.pullUpDom.is('visible')) {
                    this.pullUpDom.show();
                    sizes(this);
                }
            } else {
                if (this.pullUpDom && this.pullUpDom.is('visible')) {
                    this.pullUpDom.hide();
                    sizes(this);
                }
            }

            // 记录状态
            for (var p in state) {
                this.state[p] = state[p];
            }

            // 设置下拉条高度
            if (state.lockDown === false) {
                setState(this, STATE_INIT, false);
                this.pullDownDom.height(0);
                sizes(this);
            }

            setState(this, this.state.hasNext ? STATE_INIT : STATE_DIE, true);
        }
    };

    if (typeof module != 'undefined' && module.exports) {
        module.exports = Pull;
    } else if (typeof define == 'function' && define.amd) {
        define(function() {
            return Pull;
        });
    } else {
        window.Pull = Pull;
    }

})(window, document);

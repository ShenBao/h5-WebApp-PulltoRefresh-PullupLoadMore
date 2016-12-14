(function(factory) {
  if (typeof define !== "undefined" && define.cmd) {
    define(function(require, exports, module){
    var IScroll = require('./iscroll-probe.js');// We assume this file and iscroll-probe.js are in the same directory.
    return factory(IScroll);
    });
  } else {
    factory(IScroll);
  }  
}(function(IScroll) {
  "use strict";

  function MyScroll(wrapper, options) {
    options = options || {};
    IScroll.utils.extend(options, {
      probeType: 3,
      scrollbars: true,
      mouseWheel: true 
    });
    this.options = options;
    this.instance = new IScroll(wrapper, options);
    this.maxScrollY = this.instance.maxScrollY; // local variable
    this.orientationchangeBind = this.orientationchange.bind(this);

    if (options.pullUpEl) {
      this.pullUpEl = this.instance.wrapper.querySelector(options.pullUpEl);
      if (this.pullUpEl) {
        this.pullUpElHeight = this.pullUpEl.offsetHeight;
        this.pullUpLabel = this.pullUpEl.querySelector(".pullUpLabel");
      }
    }
    this.eventListeners = [];
    this.bindEvents();
  }

  MyScroll.prototype.bindEvents = function() {
    document.addEventListener('touchmove', preventDefault, false);
    window.addEventListener("orientationchange", this.orientationchangeBind, false);
    this.instance.on("scroll", onScrollMove);
    this.instance.on("scrollEnd", onScrollEnd);
    this.eventListeners.push(["scroll", onScrollMove]);
    this.eventListeners.push(["scrollEnd", onScrollEnd]);

    var self = this;
    var pullUpEl = this.pullUpEl,
        pullUpLabel = this.pullUpLabel,
        pullUpElHeight = this.pullUpElHeight;
    var maxScrollY = this.maxScrollY;

    function logPosition() {
      console.log("Position:", parseInt(self.instance.y));
    }

    function onScrollMove() {
      logPosition();
      var y = this.y;
      if (pullUpEl && pullUpElHeight && (y <= self.maxScrollY - pullUpElHeight) && !pullUpEl.className.match("flip") && !pullUpEl.className.match("loading")) {
        onPullUpAction();
      } else if (pullUpEl && pullUpElHeight && (y > self.maxScrollY - pullUpElHeight) && pullUpEl.className.match("flip")) {
        self.restorePullUpButton();
      }
    }

    function onScrollEnd() {
      var flipEl;
      if (pullUpEl && pullUpEl.className.match("flip")) {
        flipEl = pullUpEl;
      }
      if (flipEl) {
        setLoadingStatus(flipEl);
        if (self.options.pullUpAction) {
          self.options.pullUpAction();
        }
      }
    }

    function setLoadingStatus(flipEl) {
      flipEl.className = "loading";
      var label = flipEl.querySelector('span[class$="Label"]');
      label.innerHTML = label.getAttribute("data-loadingText");
    }

    function onPullUpAction() {
      console.log("Pull up");
      pullUpEl.className = "flip";
      pullUpLabel.innerText = pullUpLabel.getAttribute("data-flipText");
      self.instance.maxScrollY = self.instance.maxScrollY - pullUpElHeight;
    }

  };

  MyScroll.prototype.orientationchange = function() {
    var self = this;
    setTimeout(function(){
      self.maxScrollY = self.instance.maxScrollY;
    }, 500);
  };

  // Remember to refresh when contents are loaded (ie: on ajax completion)
  MyScroll.prototype.refresh = function() {
    this.instance.refresh();   
    this.maxScrollY = this.instance.maxScrollY; 
    this.restorePullUpButton();
  }

  MyScroll.prototype.restorePullUpButton = function() {
    this.pullUpEl.className = "";
    this.pullUpLabel.innerText = this.pullUpLabel.getAttribute("data-defaultText"); 
    this.instance.maxScrollY = this.maxScrollY; 
  }

  MyScroll.prototype.destroy = function() {
    this.maxScrollY = null;
    this.options = null;
    this.pullUpEl = null;
    this.pullUpElHeight = null;
    this.pullUpLabel = null;
    this.disablePull();
    this.eventListeners = null;
    document.removeEventListener('touchmove', preventDefault, false);
    window.removeEventListener("orientationchange", this.orientationchangeBind, false);
    this.orientationchangeBind = null;
    // Destroy the instance
    this.instance.destroy();
    this.isntance = null;
  };

  MyScroll.prototype.disablePull = function() {
    if (this.pullUpEl) {
      this.pullUpEl.style.display = "none";
    }
    var handlers = this.eventListeners;
    for (var i = 0; i < handlers.length; i++) {
      var handler = handlers[i];
      this.instance.off(handler[0], handler[1]);
    }
    this.eventListeners.length = 0;
  };

  MyScroll.prototype.enablePull = function() {
    if (this.eventListeners.length > 0) {
      return ;
    }
    if (this.pullUpEl) {
      this.pullUpEl.style.display = "block";
    }
    this.bindEvents();
  };

  function preventDefault(e) {
    e.preventDefault(); 
  }

  // Polyfill for Function.prototype.bind
  // This feature is not supported natively on some platforms, such as Android 2.3.5
  // from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
  if (!Function.prototype.bind) {
    Function.prototype.bind = function(oThis) {
      if (typeof this !== 'function') {
        // closest thing possible to the ECMAScript 5
        // internal IsCallable function
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
      }

      var aArgs   = Array.prototype.slice.call(arguments, 1),
          fToBind = this,
          fNOP    = function() {},
          fBound  = function() {
            return fToBind.apply(this instanceof fNOP
                ? this
                : oThis,
                aArgs.concat(Array.prototype.slice.call(arguments)));
          };

      fNOP.prototype = this.prototype;
      fBound.prototype = new fNOP();

      return fBound;
    };
  }

  if (typeof define === "function" && define.cmd) {
      return MyScroll;
  } else {
    window.MyScroll = MyScroll;
  }

}));

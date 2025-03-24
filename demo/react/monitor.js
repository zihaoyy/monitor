var monitor = (function (exports) {
    'use strict';

    var config = {
      url: 'http://localhost:8080/api',
      projectName: 'monitor',
      appId: '123',
      userId: '123',
      isImageUpload: false,
      batchSize: 5
    };
    function setConfig(options) {
      for (var key in config) {
        if (options[key]) {
          config[key] = options[key];
        }
      }
    }

    function _arrayLikeToArray(r, a) {
      (null == a || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    }
    function _createForOfIteratorHelper(r, e) {
      var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
      if (!t) {
        if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e) {
          t && (r = t);
          var n = 0,
            F = function () {};
          return {
            s: F,
            n: function () {
              return n >= r.length ? {
                done: true
              } : {
                done: false,
                value: r[n++]
              };
            },
            e: function (r) {
              throw r;
            },
            f: F
          };
        }
        throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
      }
      var o,
        a = true,
        u = false;
      return {
        s: function () {
          t = t.call(r);
        },
        n: function () {
          var r = t.next();
          return a = r.done, r;
        },
        e: function (r) {
          u = true, o = r;
        },
        f: function () {
          try {
            a || null == t.return || t.return();
          } finally {
            if (u) throw o;
          }
        }
      };
    }
    function _defineProperty(e, r, t) {
      return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
        value: t,
        enumerable: true,
        configurable: true,
        writable: true
      }) : e[r] = t, e;
    }
    function ownKeys(e, r) {
      var t = Object.keys(e);
      if (Object.getOwnPropertySymbols) {
        var o = Object.getOwnPropertySymbols(e);
        r && (o = o.filter(function (r) {
          return Object.getOwnPropertyDescriptor(e, r).enumerable;
        })), t.push.apply(t, o);
      }
      return t;
    }
    function _objectSpread2(e) {
      for (var r = 1; r < arguments.length; r++) {
        var t = null != arguments[r] ? arguments[r] : {};
        r % 2 ? ownKeys(Object(t), true).forEach(function (r) {
          _defineProperty(e, r, t[r]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
          Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
        });
      }
      return e;
    }
    function _toPrimitive(t, r) {
      if ("object" != typeof t || !t) return t;
      var e = t[Symbol.toPrimitive];
      if (void 0 !== e) {
        var i = e.call(t, r);
        if ("object" != typeof i) return i;
        throw new TypeError("@@toPrimitive must return a primitive value.");
      }
      return ("string" === r ? String : Number)(t);
    }
    function _toPropertyKey(t) {
      var i = _toPrimitive(t, "string");
      return "symbol" == typeof i ? i : i + "";
    }
    function _typeof(o) {
      "@babel/helpers - typeof";

      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
        return typeof o;
      } : function (o) {
        return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
      }, _typeof(o);
    }
    function _unsupportedIterableToArray(r, a) {
      if (r) {
        if ("string" == typeof r) return _arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
      }
    }

    function deepClone(target) {
      if (_typeof(target) === 'object') {
        var result = Array.isArray(target) ? [] : {};
        for (var key in target) {
          if (_typeof(target[key]) === 'object') {
            result[key] = deepClone(target[key]);
          } else {
            result[key] = target[key];
          }
        }
        return result;
      }
      return target;
    }
    function generateUniqueId() {
      return 'id-' + Date.now() + '-' + Math.random().toString(16).substring(2, 9);
    }

    var cache = [];
    function getCache() {
      return deepClone(cache);
    }
    function addCache(data) {
      cache.push(data);
    }
    function clearCache() {
      cache.length = 0;
    }

    var originalProto$1 = XMLHttpRequest.prototype;
    var originalOpen$1 = originalProto$1.open;
    var originalSend$1 = originalProto$1.send;
    function report(data) {
      if (!config.url) {
        console.error('请设置上报的 url 地址');
      }
      var reportData = JSON.stringify({
        id: generateUniqueId(),
        data: data
      });
      // 上报数据，使用图片的方式
      if (config.isImageUpload) {
        imageRequest(reportData);
      } else if (window.navigator.sendBeacon) {
        // 优先使用 sendBeacon
        return beaconRequest(reportData);
      } else {
        // 使用 xhr 兜底
        xhrRequest(reportData);
      }
    }

    // 批量上报数据
    function lazyReportBatch(data) {
      addCache(data);
      var caches = getCache();
      console.error('caches', caches);
      if (caches.length && caches.length > config.batchSize) {
        report(caches);
        clearCache();
      }
    }

    // 通过 图片 发送数据
    function imageRequest(data) {
      var img = new Image();
      img.src = "".concat(config.url, "?data=").concat(encodeURIComponent(JSON.stringify(data)));
    }

    // 通过 xhr 发送数据
    function xhrRequest(data) {
      if (window.requestIdleCallback) {
        window.requestIdleCallback(function () {
          var xhr = new XMLHttpRequest();
          originalOpen$1.call(xhr, 'post', config.url);
          originalSend$1.call(xhr, JSON.stringify(data));
        }, {
          timeout: 3000
        }); // 空闲时间小于 3s，立即执行
      } else {
        setTimeout(function () {
          var xhr = new XMLHttpRequest();
          originalOpen$1.call(xhr, 'post', config.url);
          originalSend$1.call(xhr, JSON.stringify(data));
        });
      }
    }

    // 通过 sendBeacon 发送数据
    function beaconRequest(data) {
      if (window.requestIdleCallback) {
        window.requestIdleCallback(function () {
          window.navigator.sendBeacon(config.url, data);
        }, {
          timeout: 3000
        } // 空闲时间小于 3s，立即执行
        );
      } else {
        setTimeout(function () {
          window.navigator.sendBeacon(config.url, data);
        });
      }
    }

    var originalFetch = window.fetch;
    function overwriteFetch() {
      window.fetch = function newFetch(url, config) {
        var startTime = Date.now();
        return originalFetch(url, config).then(function (response) {
          var reportData = {
            type: 'performance',
            subType: 'fetch',
            url: url,
            method: config.method,
            pageUrl: window.location.href,
            startTime: startTime
          };
          return originalFetch(url, config).then(function (res) {
            var endTime = Date.now();
            reportData.endTime = endTime;
            reportData.duration = endTime - startTime;
            var data = res.clone();
            reportData.status = data.status;
            reportData.success = data.ok;
            lazyReportBatch(reportData);
            return res;
          }).catch(function (error) {
            var endTime = Date.now();
            reportData.endTime = endTime;
            reportData.duration = endTime - startTime;
            reportData.status = 0;
            reportData.success = false;
            lazyReportBatch(reportData);
          });
        });
      };
    }
    function fetch() {
      overwriteFetch();
    }

    function obServerEntries() {
      if (document.readyState === 'complete') {
        observeEvent();
      } else {
        var _onLoad = function onLoad() {
          observeEvent();
          window.removeEventListener('load', _onLoad, true);
        };
        window.addEventListener('load', _onLoad, true);
      }
    }
    function observeEvent() {
      var entryHandler = function entryHandler(list) {
        var data = list.getEntries();
        var _iterator = _createForOfIteratorHelper(data),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var entry = _step.value;
            if (observer) {
              observer.disconnect();
            }
            var reportData = {
              name: entry.name,
              // 资源名字
              type: 'performance',
              subType: entry.entryType,
              // 类型
              sourceType: entry.initiatorType,
              // 资源类型
              duration: entry.duration,
              // 资源的加载时间
              dns: entry.domainLookupEnd - entry.domainLookupStart,
              // DNS解析时间
              tcp: entry.connectEnd - entry.connectStart,
              // TCP连接时间
              redirect: entry.redirectEnd - entry.redirectStart,
              // 重定向时间
              ttfb: entry.responseStart,
              // 首字节时间
              protocol: entry.nextHopProtocol,
              // 协议
              responseBodySize: entry.encodedBodySize,
              // 响应内容大小
              responseHeaderSize: entry.transferSize - entry.encodedBodySize,
              // 响应头部大小
              transferSize: entry.transferSize,
              // 请求内容大小
              resourceSize: entry.decodedBodySize,
              // 资源解压后的大小
              startTime: performance.now()
            };
            lazyReportBatch(reportData);
            console.log(entry);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      };
      var observer = new PerformanceObserver(entryHandler);
      observer.observe({
        type: ['resource'],
        buffered: true
      });
    }

    function observerFCP() {
      var entryHandler = function entryHandler(list) {
        var _iterator = _createForOfIteratorHelper(list.getEntries()),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var entry = _step.value;
            if (entry.name === 'first-contentful-paint') {
              observer.disconnect();
              var json = entry.toJSON();
              console.log(json);
              var reportData = _objectSpread2(_objectSpread2({}, json), {}, {
                type: 'performance',
                subType: entry.name,
                pageUrl: window.location.href
              });
              lazyReportBatch(reportData);
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      };

      // 统计和计算fp的时间
      var observer = new PerformanceObserver(entryHandler);
      // buffered: true 确保观察到所有paint事件
      observer.observe({
        type: 'paint',
        buffered: true
      });
    }

    function observerLCP() {
      var entryHandler = function entryHandler(list) {
        if (observer) {
          observer.disconnect();
        }
        var _iterator = _createForOfIteratorHelper(list.getEntries()),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var entry = _step.value;
            var json = entry.toJSON();
            console.log(json);
            var reportData = _objectSpread2(_objectSpread2({}, json), {}, {
              type: 'performance',
              subType: entry.name,
              pageUrl: window.location.href
            });
            lazyReportBatch(reportData);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      };

      // 统计和计算lcp的时间
      var observer = new PerformanceObserver(entryHandler);
      // buffered: true 确保观察到所有paint事件
      observer.observe({
        type: 'largest-contentful-paint',
        buffered: true
      });
    }

    function observerLoad() {
      window.addEventListener('pageShow', function (event) {
        requestAnimationFrame(function () {
          ['load'].forEach(function (type) {
            var reportData = {
              type: 'performance',
              subType: type,
              pageUrl: window.location.href,
              startTime: performance.now() - event.timeStamp
            };
            lazyReportBatch(reportData);
          });
        }, true);
      });
    }

    function observerPaint() {
      var entryHandler = function entryHandler(list) {
        var _iterator = _createForOfIteratorHelper(list.getEntries()),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var entry = _step.value;
            if (entry.name === 'first-paint') {
              observer.disconnect();
              var json = entry.toJSON();
              console.log(json);
              var reportData = _objectSpread2(_objectSpread2({}, json), {}, {
                type: 'performance',
                subType: entry.name,
                pageUrl: window.location.href
              });
              lazyReportBatch(reportData);
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      };

      // 统计和计算fp的时间
      var observer = new PerformanceObserver(entryHandler);
      // buffered: true 确保观察到所有paint事件
      observer.observe({
        type: 'paint',
        buffered: true
      });
    }

    var originalProto = XMLHttpRequest.prototype;
    var originalSend = originalProto.send;
    var originalOpen = originalProto.open;
    function overwriteOpenAndSend() {
      originalProto.open = function newOpen() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        this.url = args[1];
        this.method = args[0];
        originalOpen.apply(this, args);
      };
      originalProto.send = function newSend() {
        var _this = this;
        this.startTime = Date.now();
        var _onLoaded = function onLoaded() {
          _this.endTime = Date.now();
          _this.duration = _this.endTime - _this.startTime;
          var url = _this.url,
            method = _this.method,
            startTime = _this.startTime,
            endTime = _this.endTime,
            duration = _this.duration,
            status = _this.status;
          var reportData = {
            status: status,
            duration: duration,
            startTime: startTime,
            endTime: endTime,
            url: url,
            method: method.toLowerCase(),
            type: 'performance',
            subType: 'xhr',
            success: status >= 200 && status < 300
          };
          lazyReportBatch(reportData);
          _this.removeEventListener('loadend', _onLoaded, true);
        };
        this.addEventListener('loadend', _onLoaded, true);
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }
        originalSend.apply(this, args);
      };
    }
    function xhr() {
      overwriteOpenAndSend();
    }

    function performance$1() {
      fetch();
      obServerEntries();
      observerFCP();
      observerLCP();
      observerLoad();
      observerPaint();
      xhr();
    }

    function error() {
      // 捕获资源加载失败错误： js css
      window.addEventListener('error', function (e) {
        var target = e.target;
        if (!target) return;
        if (target.src || target.href) {
          var url = target.src || target.href;
          var reportData = {
            type: 'error',
            subType: 'resource',
            pageUrl: window.location.href,
            url: url,
            message: e.message,
            tagName: target.tagName,
            selector: target.outerHTML,
            paths: e.path
          };
          lazyReportBatch(reportData);
        }
      }, true);

      // 捕获js错误
      window.onerror = function (message, source, lineNo, colNo, error) {
        var reportData = {
          type: 'error',
          subType: 'js',
          pageUrl: window.location.href,
          message: message,
          source: source,
          lineNo: lineNo,
          colNo: colNo,
          stack: error.stack,
          startTime: performance.now()
        };
        lazyReportBatch(reportData);
      };

      // 捕获promise错误 async await
      window.addEventListener('unhandledrejection', function (e) {
        var error = e.reason;
        var reportData = {
          type: 'error',
          subType: 'promise',
          pageUrl: window.location.href,
          message: error.message,
          stack: error.stack,
          startTime: e.timeStamp
        };
        lazyReportBatch(reportData);
      }, true);
    }

    function onClick() {
      ['mousedown', 'touchstart'].forEach(function (eventType) {
        window.addEventListener(eventType, function (event) {
          var target = event.target;
          if (target.tagName) {
            var reportData = {
              scrollTop: document.documentElement.scrollTop,
              type: 'behavior',
              subType: 'click',
              target: target.tagName,
              startTime: event.timeStamp,
              innerHTML: target.innerHTML,
              outerHTML: target.outerHTML,
              width: target.offsetWidth,
              height: target.offsetHeight,
              eventType: eventType,
              path: event.path
            };
            lazyReportBatch(reportData);
          }
        });
      });
    }

    function pageChange() {
      // hash router
      var oldUrl = '';
      window.addEventListener('hashchange', function (event) {
        var newUrl = event.newURL;
        var reportData = {
          from: oldUrl,
          to: newUrl,
          type: 'behavior',
          subType: 'hashchange',
          startTime: performance.now(),
          uuid: generateUniqueId()
        };
        lazyReportBatch(reportData);
        oldUrl = newUrl;
      }, true);

      // history router
      var from = '';
      window.addEventListener('popstate', function (event) {
        var to = window.location.href;
        var reportData = {
          from: from,
          to: to,
          type: 'behavior',
          subType: 'hashchange',
          startTime: performance.now(),
          uuid: generateUniqueId()
        };
        lazyReportBatch(reportData);
        from = to;
      }, true);
    }

    function pv() {
      var reportData = {
        type: 'behavior',
        subType: 'pv',
        startTime: performance.now(),
        pageUrl: window.location.href,
        referrer: document.referrer,
        uuid: generateUniqueId()
      };
      lazyReportBatch(reportData);
    }

    function behavior() {
      onClick();
      pageChange();
      pv();
    }

    window.__monitorSDK__ = {
      version: '0.0.1'
    };

    // 针对Vue项目的错误捕获
    function install(Vue, options) {
      if (__monitorSDK__.vue) return;
      __monitorSDK__.vue = true;
      setConfig(options);
      var handler = Vue.config.errorHandler;
      // Vue项目中 通过 Vue.config.errorHandler 捕获错误
      Vue.config.errorHandler = function (err, vm, info) {
        var reportData = {
          info: info,
          error: err.stack,
          subType: 'vue',
          type: 'error',
          startTime: window.performance.now(),
          pageUrl: window.location.href
        };
        lazyReportBatch(reportData);
        if (handler) {
          handler.call(this, err, vm, info);
        }
      };
    }

    // 针对React项目的错误捕获
    function errorBoundary(err, info) {
      if (__monitorSDK__.react) return;
      __monitorSDK__.react = true;
      var reportData = {
        info: info,
        error: err === null || err === void 0 ? void 0 : err.stack,
        subType: 'react',
        type: 'error',
        startTime: window.performance.now(),
        pageUrl: window.location.href
      };
      lazyReportBatch(reportData);
    }
    function init(options) {
      setConfig(options);
      // performance()
      // error()
      behavior();
    }
    var index = {
      install: install,
      errorBoundary: errorBoundary,
      performance: performance$1,
      error: error,
      behavior: behavior,
      init: init
    };

    exports.default = index;
    exports.init = init;
    exports.install = install;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
//# sourceMappingURL=monitor.js.map

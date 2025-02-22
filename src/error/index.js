import {lazyReportBatch} from "../report";

export default function error() {
    // 捕获资源加载失败错误： js css
    window.addEventListener('error', (e) => {
        const target = e.target;
        if (!target) return;
        if (target.src || target.href) {
            const url = target.src || target.href;
            const reportData = {
                type: 'error',
                subType: 'resource',
                pageUrl: window.location.href,
                url,
                message: e.message,
                tagName: target.tagName,
                selector: target.outerHTML,
                paths: e.path,
            }
            // 发送数据
            lazyReportBatch(reportData);
        }
    }, true);

    // 捕获js错误
    window.onerror = function (message, source, lineNo, colNo, error) {
        const reportData = {
            type: 'error',
            subType: 'js',
            pageUrl: window.location.href,
            message,
            source,
            lineNo,
            colNo,
            stack: error.stack,
            startTime: performance.now(),
        }
        // 发送数据
        lazyReportBatch(reportData);
    }

    // 捕获promise错误 async await
    window.addEventListener('unhandledrejection', (e) => {
        const error = e.reason;
        const reportData = {
            type: 'error',
            subType: 'promise',
            pageUrl: window.location.href,
            message: error.message,
            stack: error.stack,
            startTime: e.timeStamp,
        }
        // 发送数据
        lazyReportBatch(reportData);
    }, true)
}
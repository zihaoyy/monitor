export default function click() {
    ['mousedown', 'touchstart'].forEach((eventType) => {
        window.addEventListener(eventType, function (event) {
            const target = event.target;
            if (target.tagName) {
                const reportData = {
                    scrollTop: document.documentElement.scrollTop,
                    type: 'behavior',
                    subType: 'click',
                    target: target.tagName,
                    startTime: event.timeStamp,
                    innerHTML: target.innerHTML,
                    outerHTML: target.outerHTML,
                    width: target.offsetWidth,
                    height: target.offsetHeight,
                    eventType,
                    path: event.path,
                }
                // 发送数据
                lazyReportBatch(reportData);
            }
        })
    })
}
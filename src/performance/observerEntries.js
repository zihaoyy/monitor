import {lazyReportBatch} from '../report'

export default function obServerEntries() {
    if (document.readyState === 'complete') {
        observeEvent()
    } else {
        const onLoad = () => {
            observeEvent()
            window.removeEventListener('load', onLoad, true)
        }
        window.addEventListener('load', onLoad, true)
    }
}

export function observeEvent() {
    const entryHandler = (list) => {
        const data = list.getEntries()
        for (const entry of data) {
            if (observer) {
                observer.disconnect()
            }
            const reportData = {
                name: entry.name, // 资源名字
                type: 'performance',
                subType: entry.entryType, // 类型
                sourceType: entry.initiatorType, // 资源类型
                duration: entry.duration, // 资源的加载时间
                dns: entry.domainLookupEnd - entry.domainLookupStart, // DNS解析时间
                tcp: entry.connectEnd - entry.connectStart, // TCP连接时间
                redirect: entry.redirectEnd - entry.redirectStart, // 重定向时间
                ttfb: entry.responseStart, // 首字节时间
                protocol: entry.nextHopProtocol, // 协议
                responseBodySize: entry.encodedBodySize, // 响应内容大小
                responseHeaderSize: entry.transferSize - entry.encodedBodySize, // 响应头部大小
                transferSize: entry.transferSize, // 请求内容大小
                resourceSize: entry.decodedBodySize, // 资源解压后的大小
                startTime: performance.now(),
            }
            lazyReportBatch(reportData)
            console.log(entry)
        }
    }

    let observer = new PerformanceObserver(entryHandler)
    observer.observe({type: ['resource'], buffered: true})
}
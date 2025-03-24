import config from './config'
import {addCache, clearCache, getCache} from './cache'
import {generateUniqueId, isSupportSendBeacon} from './utils'

export const originalProto = XMLHttpRequest.prototype
export const originalOpen = originalProto.open
export const originalSend = originalProto.send

export function report(data) {
    if (!config.url) {
        console.error('请设置上报的 url 地址')
    }
    const reportData = JSON.stringify({
        id: generateUniqueId(),
        data,
    })
    // 上报数据，使用图片的方式
    if (config.isImageUpload) {
        imageRequest(reportData)
    } else if (window.navigator.sendBeacon) {
        // 优先使用 sendBeacon
        return beaconRequest(reportData)
    } else {
        // 使用 xhr 兜底
        xhrRequest(reportData)
    }
}

// 批量上报数据
export function lazyReportBatch(data) {
    addCache(data)
    const caches = getCache()
    console.error('caches', caches)
    if (caches.length && caches.length > config.batchSize) {
        report(caches)
        clearCache()
    }
}

// 通过 图片 发送数据
export function imageRequest(data) {
    const img = new Image()
    img.src = `${config.url}?data=${encodeURIComponent(JSON.stringify(data))}`
}

// 通过 xhr 发送数据
export function xhrRequest(data) {
    if (window.requestIdleCallback) {
        window.requestIdleCallback(() => {
            const xhr = new XMLHttpRequest()
            originalOpen.call(xhr, 'post', config.url)
            originalSend.call(xhr, JSON.stringify(data))
        }, {timeout: 3000}) // 空闲时间小于 3s，立即执行
    } else {
        setTimeout(() => {
            const xhr = new XMLHttpRequest()
            originalOpen.call(xhr, 'post', config.url)
            originalSend.call(xhr, JSON.stringify(data))
        })
    }
}

const sendBeacon = isSupportSendBeacon() ? navigator.sendBeacon : xhrRequest

// 通过 sendBeacon 发送数据
export function beaconRequest(data) {
    if (window.requestIdleCallback) {
        window.requestIdleCallback(
            () => {
                window.navigator.sendBeacon(config.url, data)
            },
            {timeout: 3000} // 空闲时间小于 3s，立即执行
        )
    } else {
        setTimeout(() => {
            window.navigator.sendBeacon(config.url, data)
        })
    }
}
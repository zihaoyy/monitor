import performance from './performance/index'
import error from './error/index'
import behavior from './behavior/index'
import {setConfig} from './config'
import {lazyReportBatch} from './report'

window.__monitorSDK__ = {
    version: '0.0.1',
}

// 针对Vue项目的错误捕获
export function install(Vue, options) {
    if (__monitorSDK__.vue) return
    __monitorSDK__.vue = true
    setConfig(options)
    const handler = Vue.config.errorHandler
    // Vue项目中 通过 Vue.config.errorHandler 捕获错误
    Vue.config.errorHandler = function (err, vm, info) {
        const reportData = {
            info,
            error: err.stack,
            subType: 'vue',
            type: 'error',
            startTime: window.performance.now(),
            pageUrl: window.location.href,
        }
        lazyReportBatch(reportData)
        if (handler) {
            handler.call(this, err, vm, info)
        }
    }
}

// 针对React项目的错误捕获
function errorBoundary(err, info) {
    if (__monitorSDK__.react) return
    __monitorSDK__.react = true
    const reportData = {
        info,
        error: err?.stack,
        subType: 'react',
        type: 'error',
        startTime: window.performance.now(),
        pageUrl: window.location.href,
    }
    lazyReportBatch(reportData)
}

export function init(options) {
    setConfig(options)
    // performance()
    // error()
    behavior()
}

export default {
    install,
    errorBoundary,
    performance,
    error,
    behavior,
    init,
}
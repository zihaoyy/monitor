import {lazyReportBatch} from "../report";

const originalFetch = window.fetch;

function overwriteFetch() {
    window.fetch = function newFetch(url, config) {
        const startTime = Date.now();
        return originalFetch(url, config).then(response => {
            const reportData = {
                type: 'performance',
                subType: 'fetch',
                url,
                method: config.method,
                pageUrl: window.location.href,
                startTime,
            }
            return originalFetch(url, config).then((res) => {
                const endTime = Date.now();
                reportData.endTime = endTime;
                reportData.duration = endTime - startTime;
                const data = res.clone();
                reportData.status = data.status;
                reportData.success = data.ok;
                // 发送数据
                lazyReportBatch(reportData);
                return res;
            }).catch((error) => {
                const endTime = Date.now();
                reportData.endTime = endTime;
                reportData.duration = endTime - startTime;
                reportData.status = 0;
                reportData.success = false;
                // 发送数据
                lazyReportBatch(reportData);
            });
        });
    }
}

export default function fetch() {
    overwriteFetch();
}
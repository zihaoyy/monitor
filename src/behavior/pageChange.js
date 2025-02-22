import {lazyReportBatch} from "../report";
import {generateUniqueId} from "../utils";

export default function pageChange() {
    // hash router
    let oldUrl = '';
    window.addEventListener('hashchange', function (event) {
        const newUrl = event.newURL;
        const reportData = {
            from: oldUrl,
            to: newUrl,
            type: 'behavior',
            subType: 'hashchange',
            startTime: performance.now(),
            uuid: generateUniqueId(),
        }
        lazyReportBatch(reportData);
        oldUrl = newUrl;
    }, true);

    // history router
    let from = '';
    window.addEventListener('popstate', function (event) {
        const to = window.location.href;
        const reportData = {
            from,
            to,
            type: 'behavior',
            subType: 'hashchange',
            startTime: performance.now(),
            uuid: generateUniqueId(),
        }
        lazyReportBatch(reportData);
        from = to;
    }, true);
}
const config = {
    url: 'http://localhost:8080/api',
    projectName: 'monitor',
    appId: '123',
    userId: '123',
    isImageUpload: false,
    batchSize: 5,
}

export function setConfig(options) {
    for (const key in config) {
        if (options[key]) {
            config[key] = options[key];
        }
    }
}

export default config;
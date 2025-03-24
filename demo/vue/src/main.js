import {createApp} from 'vue'
import App from './App.vue'
import monitor from '../../../src/index'

const app = createApp(App)

app.use(monitor, {
    url: 'http://localhost:9800/reportData',
})
app.mount('#app')

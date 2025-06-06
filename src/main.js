import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import App from '@/App.vue'
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-persistedstate-plugin'
import router from '@/router'
import zhCn from 'element-plus/es/locale/lang/zh-cn'


const pinia = createPinia()
const persist = createPersistedState()

import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

pinia.use(persist)

app.use(ElementPlus, {
  locale: zhCn,
})
app.use(router)
app.use(pinia)
app.use(ElementPlus)


app.mount('#app')
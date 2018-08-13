// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import VueClipboard from 'vue-clipboard2'
import { web3 } from 'web3-api-wrap'
import 'normalize.css/normalize.css'// A modern alternative to CSS resets
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/en' // lang i18n
import '@/icons' // icon

/* eslint-disable */
Vue.config.productionTip = false

Vue.use(ElementUI, { locale })
Vue.use(VueClipboard)
Vue.use(web3)

new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})

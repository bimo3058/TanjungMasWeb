import { createApp } from 'vue'
import './styles/global.css'
import App from './App.vue'
import router from './router'
import { slideIn } from './directives/slideIn'

createApp(App).use(router).directive('slide-in', slideIn).mount('#app')

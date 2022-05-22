import { createApp } from 'vue'
import App from './App.vue'

import router from './router'

//App.use(router) //Branche le router 
createApp(App).use(router).mount('#app')

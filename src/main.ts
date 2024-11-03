import { createApp } from 'vue'
import App from './App.vue';
import { router } from '@/router/index';

import { PerfectScrollbarPlugin } from 'vue3-perfect-scrollbar';
import 'vue3-perfect-scrollbar/style.css';
import vue3GoogleLogin from 'vue3-google-login';
import axios from 'axios';
import VueAxios from 'vue-axios';
import '@/styles/index.css';
import '@/styles/button.css';
import '@/styles/play-game.css';

const CLIENT_ID = '218629800376-qf7ic2lijlkkj76802a797ctgrieimnh.apps.googleusercontent.com';

const app = createApp(App);
app.use(router);
app.use(vue3GoogleLogin, {
  clientId: CLIENT_ID,
});
app.use(VueAxios, axios);
app.use(PerfectScrollbarPlugin).mount('#app');
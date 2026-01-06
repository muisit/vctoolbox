import '@fortawesome/fontawesome-free/scss/fontawesome.scss';
import '@fortawesome/fontawesome-free/scss/brands.scss';
import '@fortawesome/fontawesome-free/scss/regular.scss';
import '@fortawesome/fontawesome-free/scss/solid.scss';
import '@fortawesome/fontawesome-free/scss/v4-shims.scss';

import MainPage from './pages/MainPage.vue';
import ElementPlus from 'element-plus';
import './styles/index.scss';
import { createApp } from 'vue';
import { createPinia } from 'pinia';

//import { Buffer } from 'buffer';
//window.Buffer = Buffer;

const pinia = createPinia();
var app = createApp(MainPage);
app.config.globalProperties.versionNumber = import.meta.env.PACKAGE_VERSION
app.use(pinia);
app.use(ElementPlus);
app.mount('#app');

//import dayjs from 'dayjs';
//import isoWeek from 'dayjs/plugin/isoWeek';
//import duration from 'dayjs/plugin/duration';
//dayjs.extend(isoWeek);
//dayjs.extend(duration);

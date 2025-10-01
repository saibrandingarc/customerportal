import App from "./App.vue";
import { createApp } from "vue";
import router from "./router";
import { createAuth0 } from "@auth0/auth0-vue";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faLink, faUser, faPowerOff } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import hljsVuePlugin from "@highlightjs/vue-plugin";
import "highlight.js/styles/github.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

import Vue3EasyDataTable from 'vue3-easy-data-table';
import 'vue3-easy-data-table/dist/style.css';

import 'material-design-icons-iconfont/dist/material-design-icons.css';
import '@mdi/font/css/materialdesignicons.css';
import { auth } from './plugins/auth';
import { createPinia } from 'pinia';
import './assets/styles.css'

hljs.registerLanguage('json', json);

const app = createApp(App);
const pinia = createPinia();

library.add(faLink, faUser, faPowerOff);
app.component('EasyDataTable', Vue3EasyDataTable);
app
  .use(hljsVuePlugin)
  .use(router)
  .use(auth)
  .use(pinia)
  .component("font-awesome-icon", FontAwesomeIcon)
  .mount("#app");

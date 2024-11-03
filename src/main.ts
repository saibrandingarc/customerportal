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
import vuetify from './plugins/vuetify';
import 'material-design-icons-iconfont/dist/material-design-icons.css';
import '@mdi/font/css/materialdesignicons.css';
import { auth } from './plugins/auth';
import { createPinia } from 'pinia';

hljs.registerLanguage('json', json);

const app = createApp(App);
const pinia = createPinia();
library.add(faLink, faUser, faPowerOff);

app
  .use(hljsVuePlugin)
  .use(router)
  .use(vuetify)
  .use(auth)
  .use(pinia)
  .component("font-awesome-icon", FontAwesomeIcon)
  .mount("#app");

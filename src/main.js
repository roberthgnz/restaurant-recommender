import { createApp } from "vue";
import Vue3Toastify from 'vue3-toastify';

import "./style.css";
import App from "./App.vue";

createApp(App).use(Vue3Toastify).mount("#app");

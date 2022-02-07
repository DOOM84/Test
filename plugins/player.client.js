import { defineNuxtPlugin } from "#app";
import VuePlyr from 'vue-plyr/dist/vue-plyr.ssr.js'
import 'vue-plyr/dist/vue-plyr.css'


export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(VuePlyr);
});
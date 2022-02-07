import { defineNuxtPlugin } from "#app";

import Vue3ChartJs from "@j-t-mcc/vue3-chartjs";

export default defineNuxtPlugin((nuxtApp) => {

    //nuxtApp.vueApp.component('Vue3ChartJs', Vue3ChartJs);
    nuxtApp.vueApp.use(Vue3ChartJs);
});
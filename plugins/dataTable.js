import {defineNuxtPlugin} from '#app';
//import VueTableLite from 'vue3-table-lite'
import {
    DataTable,
    TableBody,
    TableHead
} from "@jobinsjp/vue3-datatable";
//import "@jobinsjp/vue3-datatable/dist/style.scss";


export default defineNuxtPlugin(nuxtApp => {

   nuxtApp.vueApp.component('data-table', DataTable);
    nuxtApp.vueApp.component('table-body', TableBody);
    nuxtApp.vueApp.component('table-head', TableHead);
})




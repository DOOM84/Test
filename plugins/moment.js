import {defineNuxtPlugin, useState} from '#app'
import moment from 'moment/min/moment-with-locales.js';


export default defineNuxtPlugin(nuxtApp => {

    nuxtApp.provide('getDate', (stamp, format) => {
        prepareLocale();
        return moment(stamp).format(format)
    })
    nuxtApp.provide('startDay', (stamp) => {
        prepareLocale();
        return moment(stamp).startOf('day').format("x");
    })
    nuxtApp.provide('endDay', (stamp) => {
        prepareLocale();
        return moment(stamp).endOf('day').format("x");
    })
})

function prepareLocale() {
    let loc = useState('locale').value;
    if (loc === 'ua') {
        loc = 'uk'
    }
    moment.locale(loc);
    //return moment(stamp).fromNow()
}

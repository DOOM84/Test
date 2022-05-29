import {defineNuxtPlugin, useState} from '#app'
//import {useI18n} from 'vue-i18n';
import {createI18n} from 'vue-i18n';

import Lang from '../helpers/lang';

function customRule(choice, choicesLength, orgRule) {
    if (choice === 0) {
        return 0
    }
    const teen = choice > 10 && choice < 20;


    const endsWithOne = choice % 10 === 1;

    if (choicesLength < 4) {
        return (!teen && endsWithOne) ? 1 : 2;
    }

    /*if (teen) {
        return 0
    }*/

    if (!teen && endsWithOne) {
        return 1
    }
    if (!teen && choice % 10 >= 2 && choice % 10 <= 4) {
        return 2
    }
    //return 3;
    //console.log(choicesLength);
    return (choicesLength < 4) ? 2 : 3;
}

export default defineNuxtPlugin((nuxtApp) => {
    const locale = useState('locale').value;

    // const messages = Lang;

    const i18n = createI18n({
        pluralizationRules: {
            ru: customRule,
            ua: customRule,
        },
        globalInjection: true,
        locale: locale, // set locale
        fallbackLocale: 'ua', // set fallback locale
        messages : Lang, // set locale messages
    })

    const { t, tc } = i18n.global;

    nuxtApp.provide('t', (term) => t(term));

    nuxtApp.provide('tc', (term, count) => tc(term, count));

    nuxtApp.provide('gLoc', () => i18n.global.locale);

    nuxtApp.provide('setGloc', (loc) => {
        i18n.global.locale = loc;
    });

    nuxtApp.vueApp.use(i18n);

    nuxtApp.provide('i18n', () => i18n)

});
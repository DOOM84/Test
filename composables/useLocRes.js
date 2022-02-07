import { useNuxtApp } from '#app'

export const useLocRes = (origRes)=>{

    //const nuxtApp = useNuxtApp();

    const {$i18n} = useNuxtApp();
    const {t} = $i18n().global;

    if(origRes === 'Добре'){
        return t('good')
    }

    if(origRes === 'Задовільно'){
        return t('satisfactory')
    }

    if(origRes === 'Незадовільно'){
        return t('failing')
    }

    if(origRes === 'Відмінно'){
        return t('excellent')
    }

    return origRes;

}
import { useNuxtApp } from '#app'

export const useLocRes = (origRes)=>{

    //const nuxtApp = useNuxtApp();

    const {$t} = useNuxtApp();

    if(origRes === 'Добре'){
        return $t('good')
    }

    if(origRes === 'Задовільно'){
        return $t('satisfactory')
    }

    if(origRes === 'Незадовільно'){
        return $t('failing')
    }

    if(origRes === 'Відмінно'){
        return $t('excellent')
    }

    return origRes;

}
import {defineNuxtPlugin, useState} from '#app'

export default defineNuxtPlugin(nuxtApp => {
    const user = useUserInfo();
    const isLoggedIn = useIsloggedIn();
    const authToken = useTokenAuth();
    const isAdmin = useIsAdmin();
    const canPass = useCanpass();
    const sideLogin = useSidelogin();

    nuxtApp.provide('logOut', async () => {

        isLoggedIn.value = false;
        authToken.value = false;
        user.value = false;
        isAdmin.value = false;
        canPass.value = false;
        sideLogin.value = false;

        await $fetch('/api/signout')
        if (!process.server) {
            document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }
    })
})

import { useState } from '#app';
import getCookie from "~/helpers/getCookie";

export const useIsloggedIn = () => {
    return useState('IsloggedIn', () =>
        {
            if(process.client){
                return  !!getCookie(document.cookie, 'token')
            }
            return false
        }
        //!!getCookie(document.cookie, 'token')
    )
}


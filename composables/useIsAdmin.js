import { useState } from '#app';

export const useIsAdmin = () => {
    return useState('isAdmin ', () => false)
}
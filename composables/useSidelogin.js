import { useState } from '#app'

export const useSidelogin = () => {
    return useState('sidelogin', () => false)
}
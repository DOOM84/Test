import { useState } from '#app'

export const useDetail = () => {
    return useState('detail', () => false)
}
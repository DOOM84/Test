import { useState } from '#app'

export const useSign = () => {
    return useState('sign', () => false)
}
import { useState } from '#app'

export const useCanpass = () => {
    return useState('canpass', () => false)
}
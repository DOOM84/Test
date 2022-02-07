import { useState } from '#app'

export const useNextplace = () => {
    return useState('nextplace', () => null)
}
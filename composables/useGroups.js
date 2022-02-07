import { useState } from '#app'

export const useGroups = () => {
    return useState('groups', () => null)
}
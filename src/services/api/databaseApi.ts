import axios from 'axios'
import type { CharacterDatabaseData } from '../../types/character'
import type { CharacterBookDatabaseData } from '../../types/lorebook'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export interface DatabaseExport {
  characters: CharacterDatabaseData[]
  characterBooks: CharacterBookDatabaseData[]
}

// Database API
export const databaseApi = {
  export: async (): Promise<Blob> => {
    const response = await api.get('/database/export', {
      responseType: 'blob'
    })
    return response.data
  },

  import: async (data: DatabaseExport): Promise<{ imported: number }> => {
    const response = await api.post<{
      success: boolean
      data: { imported: number }
    }>('/database/import', data)
    return response.data.data
  },

  clear: async (): Promise<void> => {
    await api.delete('/database')
  },

  getInfo: async (): Promise<{
    characters: number
    characterBooks: number
    entries: number
    databaseSize: number
    databasePath: string
  }> => {
    const response = await api.get('/database/info')
    return response.data.data
  }
}

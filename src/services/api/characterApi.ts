import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Types
export interface CharacterData {
  name: string
  description: string
  personality: string
  mes_example: string
  scenario: string
  first_mes: string
  alternate_greetings: string[]
  creator: string
  creator_notes: string
  character_version: string
  tags: string[]
  system_prompt: string
  post_history_instructions: string
  character_book_id?: string
  extensions: Record<string, unknown>
}

export interface CharacterDatabaseData extends CharacterData {
  id: string
  image_path?: string
  created_at: string
  updated_at: string
}

export interface CharacterWithImage extends CharacterDatabaseData {
  image?: string
}

// Character API
export const characterApi = {
  getAll: async (): Promise<CharacterDatabaseData[]> => {
    const response = await api.get<{
      success: boolean
      data: CharacterDatabaseData[]
    }>('/characters')
    return response.data.data
  },

  getById: async (id: string): Promise<CharacterDatabaseData> => {
    const response = await api.get<{
      success: boolean
      data: CharacterDatabaseData
    }>(`/characters/${id}`)
    return response.data.data
  },

  create: async (data: CharacterData): Promise<CharacterDatabaseData> => {
    const response = await api.post<{
      success: boolean
      data: CharacterDatabaseData
    }>('/characters', data)
    return response.data.data
  },

  update: async (
    id: string,
    data: Partial<CharacterData>
  ): Promise<CharacterDatabaseData> => {
    const response = await api.put<{
      success: boolean
      data: CharacterDatabaseData
    }>(`/characters/${id}`, data)
    return response.data.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/characters/${id}`)
  },

  uploadImage: async (id: string, file: File): Promise<void> => {
    const formData = new FormData()
    formData.append('image', file)

    await api.post(`/characters/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  getImage: async (id: string): Promise<string> => {
    const response = await api.get(`/characters/${id}/image`, {
      responseType: 'blob'
    })
    const imageUrl = URL.createObjectURL(response.data)
    return imageUrl
  }
}

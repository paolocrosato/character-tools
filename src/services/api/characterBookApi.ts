import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Types
export interface CharacterBookEntry {
  id?: number
  name?: string
  comment?: string
  enabled: boolean
  case_sensitive?: boolean
  selective?: boolean
  constant?: boolean
  position: 'before_char' | 'after_char'
  keys: string[]
  secondary_keys: string[]
  content: string
  insertion_order: number
  priority?: number
  extensions: Record<string, unknown>
}

export interface CharacterBookData {
  name: string
  description?: string
  scan_depth?: number
  token_budget?: number
  recursive_scanning?: boolean
  extensions: Record<string, unknown>
  entries: CharacterBookEntry[]
}

export interface CharacterBookDatabaseData extends CharacterBookData {
  id: string
  created_at: string
  updated_at: string
}

// Character Book API
export const characterBookApi = {
  getAll: async (): Promise<CharacterBookDatabaseData[]> => {
    const response = await api.get<{
      success: boolean
      data: CharacterBookDatabaseData[]
    }>('/character-books')
    return response.data.data
  },

  getById: async (id: string): Promise<CharacterBookDatabaseData> => {
    const response = await api.get<{
      success: boolean
      data: CharacterBookDatabaseData
    }>(`/character-books/${id}`)
    return response.data.data
  },

  create: async (
    data: CharacterBookData
  ): Promise<CharacterBookDatabaseData> => {
    const response = await api.post<{
      success: boolean
      data: CharacterBookDatabaseData
    }>('/character-books', data)
    return response.data.data
  },

  update: async (
    id: string,
    data: Partial<CharacterBookData>
  ): Promise<CharacterBookDatabaseData> => {
    const response = await api.put<{
      success: boolean
      data: CharacterBookDatabaseData
    }>(`/character-books/${id}`, data)
    return response.data.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/character-books/${id}`)
  },

  getEntries: async (id: string): Promise<CharacterBookEntry[]> => {
    const response = await api.get<{
      success: boolean
      data: CharacterBookEntry[]
    }>(`/character-books/${id}/entries`)
    return response.data.data
  },

  createEntry: async (
    bookId: string,
    data: CharacterBookEntry
  ): Promise<CharacterBookEntry> => {
    const response = await api.post<{
      success: boolean
      data: CharacterBookEntry
    }>(`/character-books/${bookId}/entries`, data)
    return response.data.data
  },

  updateEntry: async (
    entryId: number,
    data: Partial<CharacterBookEntry>
  ): Promise<CharacterBookEntry> => {
    const response = await api.put<{
      success: boolean
      data: CharacterBookEntry
    }>(`/character-books/entries/${entryId}`, data)
    return response.data.data
  },

  deleteEntry: async (entryId: number): Promise<void> => {
    await api.delete(`/character-books/entries/${entryId}`)
  }
}

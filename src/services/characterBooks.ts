import {
  type CharacterBookData,
  characterBookApi,
  databaseApi
} from '@/services/api'
import {
  type CharacterBookDatabaseData,
  type CharacterBookEditorState
} from '@/types/lorebook'

export const createCharacterBook = async (
  characterBook: CharacterBookEditorState
): Promise<CharacterBookDatabaseData> => {
  if (characterBook.name === undefined || characterBook.name === '') {
    throw new Error('Character book name is required')
  }
  return await characterBookApi.create(characterBook as CharacterBookData)
}

export const getCharacterBook = async (
  id: string
): Promise<CharacterBookDatabaseData> => {
  return await characterBookApi.getById(id)
}

export const getAllCharacterBooks = async (): Promise<
  CharacterBookDatabaseData[]
> => {
  return await characterBookApi.getAll()
}

export const updateCharacterBook = async (
  characterBook: CharacterBookDatabaseData
): Promise<CharacterBookDatabaseData> => {
  return await characterBookApi.update(
    characterBook.id,
    characterBook as Partial<CharacterBookData>
  )
}

export const deleteCharacterBook = async (id: string): Promise<void> => {
  await characterBookApi.delete(id)
}

export const deleteAllCharacterBooks = async (): Promise<void> => {
  // Delete all character books by getting them and deleting each
  const books = await characterBookApi.getAll()
  for (const book of books) {
    await characterBookApi.delete(book.id)
  }
}

export const exportCharacterBookCollection = async (): Promise<Blob> => {
  return await databaseApi.export()
}

export const importCharacterBookCollection = async (
  file: File
): Promise<void> => {
  const text = await file.text()
  const data = JSON.parse(text)
  await databaseApi.import(data)
}

import { type CharacterData, characterApi, databaseApi } from '@/services/api'
import {
  type CharacterDatabaseData,
  type CharacterEditorState
} from '@/types/character'

export const createCharacter = async (
  character: CharacterEditorState
): Promise<CharacterDatabaseData> => {
  return await characterApi.create(character as CharacterData)
}

export const getAllCharacters = async (): Promise<CharacterDatabaseData[]> => {
  return await characterApi.getAll()
}

export const updateCharacter = async (
  character: CharacterDatabaseData
): Promise<CharacterDatabaseData> => {
  return await characterApi.update(
    character.id,
    character as Partial<CharacterData>
  )
}

export const deleteCharacter = async (id: string): Promise<void> => {
  await characterApi.delete(id)
}

export const deleteAllCharacters = async (): Promise<void> => {
  // Delete all characters by getting them and deleting each
  const characters = await characterApi.getAll()
  for (const character of characters) {
    await characterApi.delete(character.id)
  }
}

export const exportCharacterCollection = async (): Promise<Blob> => {
  return await databaseApi.export()
}

export const importCharacterCollection = async (file: File): Promise<void> => {
  const text = await file.text()
  const data = JSON.parse(text)
  await databaseApi.import(data)
}

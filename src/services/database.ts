import { type DatabaseExport, databaseApi } from '@/services/api'

export const exportDatabase = async (): Promise<Blob> => {
  return await databaseApi.export()
}

export const importDatabase = async (file: File): Promise<void> => {
  const text = await file.text()
  const data: DatabaseExport = JSON.parse(text)
  await databaseApi.import(data)
}

export const deleteDatabase = async (): Promise<void> => {
  await databaseApi.clear()
}

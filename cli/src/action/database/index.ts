import { databaseControllerExport, databaseControllerImport } from '../../api/custom'
import { AppSchema } from '../../schema/app'
import * as fs from 'fs'
import { getEmoji } from '../../util/print'
import * as path from 'path'
import { exist } from '../../util/file'
import * as FormData from 'form-data'

export async function exportDB(exportPath: string): Promise<void> {
  const appSchema = AppSchema.read()

  const res = await databaseControllerExport(appSchema.appid)
  // get absolute path
  const absPath = path.resolve(exportPath)
  res.pipe(fs.createWriteStream(path.join(absPath, `${appSchema.appid}-db.gz`)))
  console.log(`${getEmoji('✅')} database export success`)
}

export async function importDB(sourceAppid, importPath: string): Promise<void> {
  const appSchema = AppSchema.read()

  // get absolute path
  const absPath = path.resolve(importPath)
  if (!exist(absPath)) {
    console.log(`${getEmoji('❌')} import database file not exist`)
    return
  }

  const formData = new FormData()
  formData.append('file', fs.createReadStream(absPath), 'database.gz')
  formData.append('sourceAppid', sourceAppid)
  await databaseControllerImport(appSchema.appid, formData)
  console.log(`${getEmoji('✅')} database import success`)
}

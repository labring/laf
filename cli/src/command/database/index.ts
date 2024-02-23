import { Command, program } from 'commander'
import { checkApplication } from '../../common/hook'
import { exportDB, importDB } from '../../action/database'

export function command(): Command {
  const cmd = program
    .command('database')
    .alias('db')
    .hook('preAction', () => {
      checkApplication()
    })

  cmd
    .command('export')
    .argument('[exportPath]', 'exportPath')
    .description('export database')
    .action((exportPath: string) => {
      exportDB(exportPath)
    })

  cmd
    .command('import')
    .argument('[sourceAppid]', 'sourceAppid')
    .argument('[importPath]', 'importPath')
    .description('import database')
    .action((sourceAppid, importPath: string) => {
      importDB(sourceAppid, importPath)
    })

  return cmd
}

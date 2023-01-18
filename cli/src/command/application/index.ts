import { Command, program } from "commander"
import { init, list } from "../../action/application"

export function command(): Command {
  const cmd = program.command('app')

  cmd.command('init <appid>')
    .description('Initialize application')
    .option('-s, --sync', 'Sync application data', false)
    .action((appid, options) => {
      init(appid, options)
    })
  
  cmd.command('list')
    .description('List application')
    .action(() => {
      list()
    })
  
  return cmd
}
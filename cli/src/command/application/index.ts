import { Command, program } from 'commander'
import { init, list } from '../../action/application'

export function command(): Command {
  const cmd = program.command('app')

  cmd
    .command('init <appid>')
    .description('initialize application')
    .option('-s, --sync', 'sync application data', false)
    .option('-b --basic-mode', 'only create .app.yaml, do not init whole project', false)
    .action((appid, options) => {
      init(appid, options)
    })

  cmd
    .command('list')
    .description('list application')
    .action(() => {
      list()
    })

  return cmd
}

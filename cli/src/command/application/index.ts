import { Command, program } from 'commander'
import { init, list } from '../../action/application'

export function command(): Command {
  const cmd = program.command('app')

  cmd
    .command('init <appid>')
    .description('initialize application')
    .option('-s, --sync', 'sync application data', false)
    .option('--schema-only', 'only create app.yaml, do not init project', true)
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

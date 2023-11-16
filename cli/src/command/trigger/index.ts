import { Command, program } from 'commander'
import { checkApplication } from '../../common/hook'
import { create, del, list } from '../../action/trigger'

export function command(): Command {
  const cmd = program.command('trigger').hook('preAction', () => {
    checkApplication()
  })

  cmd
    .command('list')
    .description('trigger list')
    .action(() => {
      list()
    })

  cmd
    .command('create <name> <target> <cron>')
    .description('create a trigger')
    .action((name, target, cron) => {
      create(name, target, cron)
    })

  cmd
    .command('del [id]')
    .description('delete a trigger')
    .option('-n, --name <name>', 'trigger name')
    .action((id, options) => {
      if (!id && !options.name) {
        console.log('please enter an id or name to delete')
        return
      }
      del({
        id,
        name: options.name,
      })
    })

  return cmd
}

import { Command, program } from 'commander'
import { add, pull, push } from '../../action/dependency'
import { checkApplication } from '../../common/hook'

export function command(): Command {
  const cmd = program.command('dep').hook('preAction', () => {
    checkApplication()
  })

  cmd
    .command('add <dependencyName>')
    .description('add dependency')
    .option('-t, --targetVersion <type>', 'dependency target version')
    .option('-r, --remote', 'add dependency to remote only', false)
    .action((dependencyName, options) => {
      add(dependencyName, options)
    })

  cmd
    .command('pull')
    .description('pull dependency')
    .action(() => {
      pull()
    })

  cmd
    .command('push')
    .description('push dependency')
    .option('--no-updatePackage', 'do not update package.json')
    .action((options) => {
      push(options)
    })

  return cmd
}

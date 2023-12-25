import { Command, program } from 'commander'
import { checkApplication } from '../../common/hook'
import { pull, push } from '../../action/environment'

export function command(): Command {
  const cmd = program
    .command('environment')
    .alias('env')
    .hook('preAction', () => {
      checkApplication()
    })

  cmd
    .command('pull')
    .description('pull environment variables')
    .action(() => {
      pull()
    })

  cmd
    .command('push')
    .description('push environment variables')
    .action(() => {
      push()
    })

  return cmd
}

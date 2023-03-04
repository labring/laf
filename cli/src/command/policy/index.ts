import { Command, program } from 'commander'
import { list, pullOne, pushOne, pullAll, pushAll } from '../../action/policy'
import { checkApplication } from '../../common/hook'

export function command(): Command {
  const cmd = program.command('policy').hook('preAction', () => {
    checkApplication()
  })

  cmd
    .command('list')
    .description('policy list')
    .action(() => {
      list()
    })

  cmd
    .command('pull [policyName]')
    .description('pull police from server')
    .action((policyName) => {
      if (policyName) {
        pullOne(policyName)
      } else {
        pullAll()
      }
    })

  cmd
    .command('push [policyName]')
    .description('push police to server')
    .option('-f, --force', 'force to overwrite the server', false)
    .action((policyName, options) => {
      if (policyName) {
        pushOne(policyName)
      } else {
        pushAll(options)
      }
    })

  return cmd
}

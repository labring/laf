import { Command, program } from "commander"
import { list, pull, push, pullAll, pushAll } from "../../action/policy"
import { checkApplication } from "../../common/hook"

export function policyCommand(): Command {
  const cmd = program.command('policy')
    .hook('preAction', () => {
      checkApplication()
    })

  cmd.command('list')
    .description('policy list')
    .action(() => {
      list()
    })
  
  cmd.command('pull [policyName]')
    .description('pull police from server')
    .action((policyName) => {
      if (policyName) {
        pull(policyName)
      } else {
        pullAll()
      }
    })
  
  cmd.command('push [policyName]')
    .description('push police to server')
    .option('-f, --force', 'force to overwrite the server', false)
    .action((policyName, options) => {
      if (policyName) {
        push(policyName)
      } else {
        pushAll(options)
      }
    })
  
  
  
  
  return cmd
}
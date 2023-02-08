import { Command, program } from "commander"
import { add, pull, push } from "../../action/dependency"
import { checkApplication } from "../../common/hook"

export function command(): Command {
  const cmd = program.command('dep')
    .hook('preAction', () => {
      checkApplication()
    })

  cmd.command('add <dependencyName>')
    .description('add dependency')
    .option('-t, --targetVersion <type>', 'dependency target version')
    .action((dependencyName, options) => {
      add(dependencyName, options)
    })
  
    cmd.command('pull')
    .description('pull dependency')
    .action(() => {
      pull()
    })

  
    cmd.command('push')
    .description('push dependency')
    .action(() => {
      push()
    })



  return cmd
}
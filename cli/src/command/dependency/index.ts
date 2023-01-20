import { Command, program } from "commander"
import { add } from "../../action/dependency"
import { checkApplication } from "../../common/hook"

export function command(): Command {
  const cmd = program.command('dep')
    .hook('preAction', () => {
      checkApplication()
    })

  cmd.command('add <dependencyName>')
    .description('add dependency')
    .option('-v --version', 'dependency version', '')
    .action((dependencyName, options) => {
      add(dependencyName, options)
    })


  return cmd
}
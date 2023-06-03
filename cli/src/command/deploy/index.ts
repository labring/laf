import { Command, program } from 'commander'
import { deploy } from '../../action/deploy'

export function command(): Command {
  const cmd = program.command('deploy').action(() => {
    deploy()
  })

  return cmd
}

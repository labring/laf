import { program, Command } from 'commander'
import { login, logout } from '../../action/auth'

export function loginCommand(): Command {
  const cmd = program.command('login <pat>')
    .description('login client')
    .option('-r, --remote [value]', 'remote server address', '')
    .action((pat, options) => {
      login(pat, options)
    })
  return cmd
}

export function logoutCommand(): Command {
  const cmd = program.command('logout')
    .description('logout client')
    .action(() => {
      logout()
    })
  return cmd
}
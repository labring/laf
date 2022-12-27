import { program, Command } from 'commander'
import { handleLogin, handleLogout } from '../../actions/auth/auth'

export function loginCommand(): Command {
  const login = program.command('login <token>')
    .description('login client')
    .option('-r, --remote [value]', 'remote server address', '')
    .action((token, options) => {
      handleLogin(token, options)
    })
  return login
}

export function logoutCommand(): Command {
  const logout = program.command('logout')
    .description('logout client')
    .action(() => {
      handleLogout()
    })
  return logout
}
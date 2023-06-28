import { program, Command } from 'commander'
import { login, logout, list, switchUser, add, del } from '../../action/user'

export function loginCommand(): Command {
  const cmd = program
    .command('login <pat>')
    .description('login client')
    .action((pat) => {
      login(pat)
    })
  return cmd
}

export function logoutCommand(): Command {
  const cmd = program
    .command('logout')
    .description('logout client')
    .action(() => {
      logout()
    })
  return cmd
}

export function command(): Command {
  const cmd = program.command('user').description('user management')

  cmd
    .command('list')
    .description('list user')
    .action(() => {
      list()
    })

  cmd
    .command('switch <name>')
    .description('switch user')
    .action((name) => {
      switchUser(name)
    })

  cmd
    .command('add <name>')
    .description('add user')
    .option('-r, --remote [value]', 'remote server address', '')
    .action((name, options) => {
      add(name, options)
    })

  cmd
    .command('del <name>')
    .description('delete user')
    .action((name) => {
      del(name)
    })

  return cmd
}

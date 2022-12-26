import { Command } from 'commander'
import { applicationCommand } from './commands/application/application'
import { loginCommand, logoutCommand } from './commands/auth/auth'


const program = new Command()
program
  .option('-v, --version', 'output version')
  .action(() => { 
    const version = require('../package.json').version
    console.log(version)
  })

program.addCommand(applicationCommand())
program.addCommand(loginCommand())
program.addCommand(logoutCommand())

program.parse(process.argv)

import { Command } from 'commander'
import { command as applicationCommand } from './command/application/'
import { command as functionCommand } from './command/function/'
import { loginCommand, logoutCommand } from './command/auth'
import { bucketCommand } from './command/stroage'


const program = new Command()
program
  .option('-v, --version', 'output version')
  .action(() => {
    const version = require('../package.json').version
    console.log(version)
  })

program.addCommand(loginCommand())
program.addCommand(logoutCommand())
program.addCommand(applicationCommand())
program.addCommand(functionCommand())
program.addCommand(bucketCommand())


program.parse(process.argv)





import { Command } from 'commander'
import { applicationCommand } from './commands/application/application'


const program = new Command()
program
  .option('-v, --version', 'output version')
  .action(() => { 
    const version = require('../package.json').version
    console.log(version)
  })

program.addCommand(applicationCommand())

program.parse(process.argv)

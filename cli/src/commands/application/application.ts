import { program, Command } from 'commander'

import {handleInitApplication, handleListApplication} from '../../actions/application/application'

export function applicationCommand(): Command {
  const app = program.command('app')

  app
    .command('init <appid>')
    .description('Initialize application')
    .option('-s, --sync', 'Sync application', "false")
    .action((appid, options) => {
      handleInitApplication(appid, options)
    })
  
  app.command('list')
    .description('List application')
    .action(() => {
      handleListApplication()
    })
  
  return app
}



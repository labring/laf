
import { program } from 'commander'

import { handleLoginCommand } from './actions/userAction'

program
  .command('login')
  .option('-u, --username <username>', 'username')
  .option('-p, --password <password>', 'password')
  .option('-r, --remote', 'remote server', "https://console.lafyun.com/")
  .action(async (options) => {

    // check params
    const username = options.username
    const password = options.password
    if (!username) {
      console.error('username is required')
      process.exit(1)
    }
    if (!password) {
      console.error('password is required')
      process.exit(1)
    }

    await handleLoginCommand(options.remote, username, password)


  })

program.parse(process.argv)

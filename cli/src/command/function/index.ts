import { Command, program } from 'commander'
import { create, del, exec, list, pullAll, pullOne, pushAll, pushOne } from '../../action/function'
import { checkApplication, checkFunctionDebugToken } from '../../common/hook'

export function command(): Command {
  const cmd = program.command('func').hook('preAction', () => {
    checkApplication()
  })

  cmd
    .command('create <funcName>')
    .description('Create function')
    .option('-w --websocket', 'enable websocket', false)
    .option('-m --methods <items...>', 'http methods', ['GET', 'POST'])
    .option('-t --tags <items...>', 'tags', [])
    .option('-d --description <description>', 'function description', '')
    .action((funcName, options) => {
      if (!/^[_A-Za-z][A-Za-z0-9-_]+$/.test(funcName)) {
        return console.log('Function names can only contain English letters or underscores (_).')
      }
      create(funcName, options)
    })

  cmd
    .command('del <funcName>')
    .description('del function')
    .action((funcName) => {
      del(funcName)
    })

  cmd
    .command('list')
    .description('list application')
    .action(() => {
      list()
    })

  cmd
    .command('pull')
    .argument('[funcName]', 'funcName')
    .description('pull function, if funcName does not exist, pull all')
    .action((funcName) => {
      if (funcName) {
        pullOne(funcName)
      } else {
        pullAll()
      }
    })

  cmd
    .command('push')
    .argument('[funcName]', 'funcName')
    .option('-f, --force', 'force to overwrite the server', false)
    .description('push function, if funcName does not exist, push all')
    .action((funcName, options) => {
      if (funcName) {
        pushOne(funcName)
      } else {
        pushAll(options)
      }
    })

  cmd
    .command('exec <funcName>')
    .description('exec function')
    .option('-l --log <count>', 'print log')
    .option('-X --method <method>', 'request method, eg -X HEAD/GET/POST/PUT/DELETE')
    .option('-H --headers <request headers>', 'request headers, eg -H \'{"Content-Type": "application/json"}\'')
    .option('-q --query <request query params>', 'request query params, eg -q "key1=val1&key2=val2"')
    .option('-d --data <request body data>', 'request body data, eg -d \'{"key1": "val1"}\'')
    .option('-r --requestId', 'print requestId', false)
    .hook('preAction', async () => {
      await checkFunctionDebugToken()
    })
    .action((funcName, options) => {
      exec(funcName, options)
    })

  return cmd
}

import { Command, program } from "commander"
import { create, del, exec, list, pullAll, pullOne, pushAll, pushOne } from "../../action/function"
import { checkApplication, checkFunctionDebugToken } from "../../common/hook"

export function command(): Command {
  const cmd = program.command('func')
    .hook('preAction', () => {
      checkApplication()
    })

  cmd.command('create <funcName>')
    .description('create function')
    .option('-w --websocket', 'enable websocket', true)
    .option('-m --methods <items...>', 'http methods', ['GET', 'POST'])
    .option('-t --tags <items...>', 'tags', [])
    .option('-d --description <description>', 'description', '')
    .action((funcName, options) => {
      create(funcName, options)
    })

  cmd.command('del <funcName>')
    .description('del function')
    .action((funcName) => {
      del(funcName)
    })

  cmd.command('list')
    .description('List application')
    .action(() => {
      list()
    })

  cmd.command('pull')
    .argument('[funcName]', 'funcName')
    .description('Pull function, if funcName does not exist, pull all')
    .action((funcName) => {
      if (funcName) {
        pullOne(funcName)
      } else {
        pullAll()
      }
    })

  cmd.command('push')
    .argument('[FuncName]', 'funcName')
    .description('push function, if funcName does not exist, push all')
    .action((funcName) => {
      if (funcName) {
        pushOne(funcName)
      } else {
        pushAll()
      }
    })

  cmd.command('exec <funcName>')
    .description('Exec function')
    .option('-l --log <count>', 'print log')
    .option('-r --requestId', 'print requestId', false)
    .hook('preAction', () => {
      checkFunctionDebugToken()
    })
    .action((funcName, options) => {
      exec(funcName, options)
    })


  return cmd
}
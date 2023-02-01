import { Command, program } from "commander"
import { create, del, list, pull, push, update } from "../../action/storage"
import { checkApplication, checkStorageToken } from "../../common/hook"

export function bucketCommand(): Command {
  const cmd = program.command('storage')
    .hook('preAction', () => {
      checkApplication()
    })

  cmd.command('list')
    .description('bucket list')
    .action(() => {
      list()
    })

  cmd.command('create <bucketName>')
    .description('create a bucket')
    .action((bucketName, options) => {
      create(bucketName, options)
    })

  cmd.command('update <bucketName>')
    .description('update bucket')
    .action((bucketName, options) => {
      update(bucketName, options)
    })

  cmd.command('del <bucketName>')
    .description('delete bucket')
    .action((bucketName, options) => {
      del(bucketName, options)
    })
  
  cmd.command('pull <bucketName> <outPath>')
    .description('pull file from bucket')
    .option('-f, --force', 'force pull', false)
    .option('-d, --detail', 'print detail', false)
    .hook('preAction', async () => {
      await checkStorageToken()
    })
    .action((bucketName, outPath, options) => {
      pull(bucketName, outPath, options)
    })
  
    cmd.command('push <bucketName> <inPath>')
    .description('push file to bucket')
    .option('-f, --force', 'force push', false)
    .option('-d, --detail', 'print detail', false)
    .hook('preAction', async () => {
      await checkStorageToken()
    })
    .action((bucketName, inPath, options) => {
      push(bucketName, inPath, options)
    })

  return cmd
}


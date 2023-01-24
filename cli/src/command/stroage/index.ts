import { Command, program } from "commander"
import { create, del, list, update } from "../../action/stroage"
import { checkApplication } from "../../common/hook"

export function bucketCommand(): Command {
  const cmd = program.command('bucket')
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


  return cmd
}


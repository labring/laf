import { Command, program } from 'commander'
import { create, custom, del, list } from '../../action/website'
import { checkApplication } from '../../common/hook'

export function command(): Command {
  const cmd = program.command('website').hook('preAction', () => {
    checkApplication()
  })

  cmd
    .command('list')
    .description('website list')
    .action(() => {
      list()
    })

  cmd
    .command('create <bucketName>')
    .description('create a website')
    .action((bucketName, options) => {
      create(bucketName, options)
    })

  cmd
    .command('del <bucketName>')
    .description('del website')
    .action((bucketName, options) => {
      del(bucketName, options)
    })

  cmd
    .command('custom <bucketName> <domain>')
    .description('custom website domain')
    .action((bucketName, domain, options) => {
      custom(bucketName, domain, options)
    })

  return cmd
}

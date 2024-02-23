// Lock lockFileVersion to version 2 And resolve import error when import xxx from 'node:xxx'
if (process.version && +process.version.slice(1).split('.')[0] < 18) {
  console.log(
    `Required node version >= 18 not satisfied with current version ${process.version}.`
  )
  process.exit(1)
}

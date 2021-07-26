const fse = require('fs-extra')
const path = require('path')

async function main() {
  const source = path.resolve(__dirname, '../packages/less-api-framework/README.md')
  const target = path.resolve(__dirname, '../README.md')

  fse.copyFileSync(source, target)
}

main()
const { notEmpty } = require('../utils.js')
const fs = require('fs-extra')
const _ = require('lodash')
const path = require('path')
const { cwd } = require('process')

module.exports = {
  description: 'generate a view',
  prompts: [
    {
      type: 'input',
      name: 'name',
      message: 'collection name please',
      validate: notEmpty('name')
    }
  ],
  actions: data => {
    const name = data.name
    const pageName = _.chain(name).camelCase().capitalize().value()

    const tmpPath = path.join(__dirname, 'index.ejs')
    const templateStr = fs.readFileSync(tmpPath, 'utf8')

    _.templateSettings.interpolate = /<%=([\s\S]+?)%>/g
    const compiledFunc = _.template(templateStr)

    const result = compiledFunc({ pageName, collection: name, name: name })

    const destPath = path.join(cwd(), `src/views/${name}`)
    console.log(destPath)
    fs.ensureDirSync(destPath)

    fs.writeFileSync(path.join(destPath, 'index.vue'), result, 'utf8')
    return []
  }
}

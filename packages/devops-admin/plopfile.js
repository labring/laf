
const tablePageGenerator = require('./plop-templates/crud-page/prompt')

module.exports = function(plop) {
  plop.setGenerator('table-page', tablePageGenerator)
}

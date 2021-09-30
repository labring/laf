const express = require('express')
const { Entry, MongoAccessor } = require('less-api')
const util = require('util')

const rules = {
  categories: {
    '.read': true,
    '.update': {
      condition: true,
      multi: true
    },
    '.add': true,
    '.remove': true
  }
}

const app = new express()
app.use(express.json())


// init the less-api Entry & Db Accessor
const dbOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true
}
const accessor = new MongoAccessor('mydb', 'mongodb://localhost:27017', dbOptions)
const entry = new Entry(accessor)
entry.init()
entry.loadRules(rules)

app.post('/entry', async (req, res) => {
  const { role, userId } = parseToken(req.headers['authorization'])

  // console.log({body: req.body})
  // parse params
  const params = entry.parseParams(req.body)
  console.log(util.inspect(params, false, null, true /* enable colors */))

  const injections = {
    $role: role,
    $userid: userId
  } 

  // validate query
  const result = await entry.validate(params, injections)
  if (result.errors) {
    return res.send({
      code: 1,
      error: result.errors
    })
  }

  // execute query
  const data = await entry.execute(params)
  return res.send({
    code: 0,
    data
  })
})

app.listen(8080, () => console.log('listening on 8080'))


/* eslint-disable no-unused-vars */
function parseToken(_token) {
  return {
    role: 'admin',
    userId: 123
  }
}
const express = require('express')
const { Entry, MysqlAccessor } = require('less-api')
const rules = require('./rules.json')

const app = new express()
app.use(express.json())


// request pre-process, include uid parse and cross-domain set
app.all('*', function (_req, res, next) {
  // set cross domain
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  res.header('Content-Type', 'application/json;charset=utf-8')
  next()
})

function parseToken(token) {
  return {
    role: 'admin',
    userId: 123
  }
}

// init the less-api Entry & Db Accessor
const accessor = new MysqlAccessor({
  database: 'testdb',
  user: 'root',
  password: 'kissme',
  host: 'localhost',
  port: 3306
})

const entry = new Entry(accessor)
entry.init()
entry.loadRules(rules)

app.post('/entry', async (req, res) => {
  const { role, userId } = parseToken(req.headers['authorization'])

  // parse params
  const params = entry.parseParams(req.body)
  console.log(req.body)
  console.log(params)
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
  try {
    const data = await entry.execute(params)
    return res.send({
      code: 0,
      data
    })
  } catch (error) {
    return res.send({
      code: 2,
      error: error.toString()
    })
  }
})

app.listen(8088, () => console.log('listening on 8088'))

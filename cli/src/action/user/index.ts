import { DEFAULT_SERVER, TOKEN_EXPIRE } from '../../common/constant'
import { getEmoji } from '../../util/print'
import { UserSchema } from '../../schema/user'
import { pat2token } from '../../api/pat'
import * as Table from 'cli-table3'

export async function login(pat: string) {
  const user = UserSchema.getCurrentUser()

  // transfer pat to token
  const patDto = {
    pat: pat,
  }
  const token = await pat2token(user.server, patDto)

  // save user to user schema
  const userSchema = UserSchema.read()
  for (let index = 0; index < userSchema.users.length; index++) {
    if (userSchema.users[index].name === user.name) {
      userSchema.users[index].pat = pat
      userSchema.users[index].token = token
      userSchema.users[index].expire = Date.parse(new Date().toString()) / 1000 + TOKEN_EXPIRE
      UserSchema.write(userSchema)
      console.log(`${getEmoji('🎉')} login success`)
      return
    }
  }

  console.log(`${getEmoji('❌')} user not found`)
}

export async function logout() {
  const userSchema = UserSchema.read()
  userSchema.users[userSchema.selected].pat = ''
  userSchema.users[userSchema.selected].token = ''
  userSchema.users[userSchema.selected].expire = 0
  UserSchema.write(userSchema)

  console.log(`${getEmoji('👋')} logout success`)
}

export async function list() {
  const table = new Table({
    head: ['current', 'name', 'server url'],
  })

  UserSchema.read().users.forEach((user, index) => {
    table.push([index === UserSchema.read().selected ? '*' : '', user.name, user.server])
  })
  console.log(table.toString())
}

export async function add(name, options: { remote?: string }) {
  const userSchema = UserSchema.read()
  for (let index = 0; index < userSchema.users.length; index++) {
    if (userSchema.users[index].name === name) {
      console.log(`user ${name} already exist`)
      return
    }
  }

  let server = options.remote || DEFAULT_SERVER
  if (server?.endsWith('/')) {
    server = server.substring(0, server.length - 1)
  }
  userSchema.users.push({
    name: name,
    server: server,
  })
  UserSchema.write(userSchema)

  console.log(`${getEmoji('✅')} add user ${name} success`)
}

export async function del(name: string) {
  if (UserSchema.getCurrentUser.name === name) {
    console.log(`can not delete current user, please switch to another user first`)
    return
  }

  const userSchema = UserSchema.read()
  const newUsers = userSchema.users.filter((user, _) => user.name !== name)
  userSchema.users = newUsers
  UserSchema.write(userSchema)
}

export async function switchUser(name: string) {
  const userSchema = UserSchema.read()
  for (let index = 0; index < userSchema.users.length; index++) {
    if (userSchema.users[index].name === name) {
      userSchema.selected = index
      UserSchema.write(userSchema)
      console.log(`${getEmoji('✅')} switch user success`)
      return
    }
  }
  console.log(`user ${name} not exist`)
}

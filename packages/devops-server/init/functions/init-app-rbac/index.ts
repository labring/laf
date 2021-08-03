/**
 * 本函数可用于初始化一套 RBAC 必要的数据，通常不需要删除此云函数，也不要开启 HTTP 调用。
 */

 import cloud from '@/cloud-sdk'
 import * as assert from 'assert'
 import * as crypto from 'crypto'
 const db = cloud.database()
 
 
 exports.main = async function (ctx) {
   
   // 创建 RBAC 初始权限
   await createInitialPermissions()
 
   // 创建 RBAC 初始角色
   await createFirstRole()
 
   // 创建初始管理员
   await createFirstAdmin("admin", "123456")
   
   return 'ok'
 }
 
 
 
 
 /**
  * 预置 RBAC 权限
  */
  const permissions = [
   { name: 'role.create', label: '创建角色' },
   { name: 'role.read', label: '读取角色' },
   { name: 'role.edit', label: '编辑角色' },
   { name: 'role.delete', label: '删除角色' },
 
   { name: 'permission.create', label: '创建权限' },
   { name: 'permission.read', label: '读取权限' },
   { name: 'permission.edit', label: '编辑权限' },
   { name: 'permission.delete', label: '删除权限' },
 
   { name: 'admin.create', label: '创建管理员' },
   { name: 'admin.read', label: '获取管理员' },
   { name: 'admin.edit', label: '编辑管理员' },
   { name: 'admin.delete', label: '删除管理员' }
 ]
 
 
 
 // 创建初始管理员
 async function createFirstAdmin(username: string, password: string) {
   try {
 
     const { total } = await db.collection('admins').count()
     if (total > 0) {
       console.log('admin already exists')
       return
     }
 
     await cloud.mongodb.collection('admins').createIndex('username', { unique: true })
 
     const { data } = await db.collection('roles').get()
     const roles = data.map(it => it.name)
 
     const r_add = await db.collection('admins').add({
       username,
       avatar: "https://static.dingtalk.com/media/lALPDe7szaMXyv3NAr3NApw_668_701.png",
       name: 'Admin',
       roles,
       created_at: Date.now(),
       updated_at: Date.now()
     })
     assert.ok(r_add.id, 'add admin occurs error')
 
     await db.collection('password').add({
       uid: r_add.id,
       password: hashPassword(password),
       type: 'login',
       created_at: Date.now(),
       updated_at: Date.now()
     })
 
     return r_add.id
   } catch (error) {
     console.error(error.message)
   }
 }
 
 // 创建初始角色
 async function createFirstRole() {
   try {
 
     await cloud.mongodb.collection('roles').createIndex('name', { unique: true })
 
     const r_perm = await db.collection('permissions').get()
     assert(r_perm.ok, 'get permissions failed')
 
     const permissions = r_perm.data.map(it => it.name)
 
     const r_add = await db.collection('roles').add({
       name: 'superadmin',
       label: '超级管理员',
       description: '系统初始化的超级管理员',
       permissions,
       created_at: Date.now(),
       updated_at: Date.now()
     })
 
     assert.ok(r_add.id, 'add role occurs error')
 
     return r_add.id
   } catch (error) {
     if (error.code == 11000) {
       return console.log('permissions already exists')
     }
 
     console.error(error.message)
   }
 }
 
 // 创建初始权限
 async function createInitialPermissions() {
 
   // 创建唯一索引
   await cloud.mongodb.collection('permissions').createIndex('name', { unique: true })
 
   for (const perm of permissions) {
     try {
       const data = {
         ...perm,
         created_at: Date.now(),
         updated_at: Date.now()
       }
       await db.collection('permissions').add(data)
     } catch (error) {
       if (error.code == 11000) {
         console.log('permissions already exists')
         continue
       }
       console.error(error.message)
     }
   }
 
   return true
 }
 
 
 /**
  * @param {string} content
  * @return {string}
  */
 function hashPassword(content: string): string {
   return crypto
     .createHash('sha256')
     .update(content)
     .digest('hex')
 }
 
 
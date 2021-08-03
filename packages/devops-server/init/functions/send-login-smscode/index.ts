import cloud from '@/cloud-sdk'

/**
 * @api
 * @body phone string 手机号
 */

// main function
 exports.main = async function (ctx) {
  const db = cloud.database()
  const phone = ctx.body?.phone
  if (!phone) {
    return 'Error: invalid phone'
  }

  const code = Math.min(Math.floor(1000 + Math.random() * 9000), 9999)

  const r = await sendSMSCode(phone, code)
  if (r.data === 'ok') {
    await db.collection('verify_code').add({
      type: 'sms',
      phone,
      code,
      event: 'login',
      created_at: Date.now()
    })
  }
  return r
}

/**
 * 发送验证码
 * @return {Promise<string>}
 * @see cloud function: aliyun-sms-service
 */
async function sendSMSCode(phone, code) {
  const body =  { phone, code }
  const r = await cloud.invoke('aliyun-sms-service', { body })
  return r
}


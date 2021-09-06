
import cloud from '@/cloud-sdk'
import * as nodemailer from 'nodemailer'
import * as assert from 'assert'

exports.main = async function (ctx) {
  const body = ctx.body
  const db = cloud.database()
  const CONFIG = cloud.shared.get('sys.config.mail')
  assert.ok(CONFIG, 'no mail config found')

  const transporter = nodemailer.createTransport({
    host: CONFIG.host,
    port: CONFIG.port,
    secure: true, // true for 465, false for other ports
    auth: {
      user: CONFIG.user,
      pass: CONFIG.pass,
    },
  })

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: CONFIG.sender, // sender address
    to: body.email, // list of receivers
    subject: body.subject, // Subject line
    text: body.text, // plain text body
    // html: "<b>Hello world?</b>", // html body
  })

  console.log(info)

  return info
}

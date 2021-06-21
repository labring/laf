
import { v4 as uuidv4 } from 'uuid'
import * as crypto from 'crypto'
const querystring = require('querystring')

const accessKeyId = '修改为你的阿里云访问Key ID'  // 阿里云访问 Key ID
const accessKeySecret = '修改为你的阿里云访问Key密钥'  // 阿里云访问 Key Secret
const api_entrypoint = 'https://dysmsapi.aliyuncs.com'
const signName = '灼灼信息'   // 短信签名，修改为你的签名
const templateCode = 'SMS_217850726'  // 短信模板，修改为你的模板ID

/**
 * @body phone string 手机号
 * @body code string | number 验证码
 */
async function main (ctx) {
  const phone = ctx.body?.phone
  if (!phone) {
    return 'error: invalid phone'
  }
  const code = ctx.body?.code
  if (!code) {
    return 'error: invalid code'
  }

  const params = sortObjectKeys({
    AccessKeyId: accessKeyId,
    Action: 'SendSms',
    Format: 'json',
    SignatureMethod: 'HMAC-SHA1',
    SignatureNonce: uuidv4(),
    SignatureVersion: '1.0',
    Version: '2017-05-25',
    Timestamp: (new Date()).toISOString(),
    PhoneNumbers: phone,
    SignName: signName,
    TemplateCode: templateCode,
    TemplateParam: `{"code": ${code}}`
  })

  params['Signature'] = specialEncode(sign(params))

  const query = querystring.stringify(params)
  const url = `${api_entrypoint}?${query}`

  try {
    const r = await less.fetch(url)
    console.log(r.data)
    if(r.data?.Code === 'OK')
      return 'ok'
    else
      return r.data

  } catch (err) {
    console.log(err)
    return 'error: ' + err
  }
}
// 签名
function sign(raw_params) {
  const params = encode(raw_params)

  //拼接strToSign
  let strToSign = '';
  for (let i in params) {
    strToSign += i + '=' + params[i] + '&';
  }
  strToSign = strToSign.substr(0, strToSign.length - 1);
  strToSign = "GET&" + encodeURIComponent('/') + '&' + encodeURIComponent(strToSign);

  // 阿里云签名是要求 基于 hash 的原始二进制值 进行 base64编码
  const ret = crypto.createHmac('sha1', accessKeySecret + '&')
    .update(strToSign)
    .digest('base64')

  return ret
}

//对各个参数进行字典序升序排序
function sortObjectKeys(obj) {
  const tmp = {};
  Object.keys(obj).sort().forEach(k => tmp[k] = obj[k])
  return tmp;
}


//对排序之后的参数进行 uriencode + POP 编码
function encode(params) {
  const obj = {}
  //对urlencode之后的特殊字符进行替换
  for (let i in params) {
    const str = encodeURIComponent(params[i])
    obj[i] = specialEncode(str)
  }
  return obj
}

// 阿里云的特殊编码(POP编码)
function specialEncode(encoded) {
  if (encoded.indexOf('+')) {
    encoded.replace("+", "%20");
  } else if (str.indexOf('*')) {
    encoded.replace("*", "%2A");
  } else if (str.indexOf('%7E')) {
    encoded.replace("%7E", "~");
  }
  return encoded
}

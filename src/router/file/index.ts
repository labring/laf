import * as express from 'express'
import * as path from 'path'
import * as multer from 'multer'
import Config from '../../config'
import { LocalFileStorage } from '../../lib/storage/local_file_storage'
import { v4 as uuidv4 } from 'uuid'
import $ from 'validator'


export const FileRouter = express.Router()

// multer 上传配置
const uploader = multer({
  storage: multer.diskStorage({
    filename: (_req, file, cb) => {
      const { ext } = path.parse(file.originalname)
      cb(null, uuidv4() + ext)
    }
  })
})

FileRouter.use('/public', express.static(path.join(Config.LOCAL_STORAGE_ROOT_PATH, 'public')))

/**
 * 上传文件
 * @namespace {string} 上传的名字空间，做为二级目录使用，只支持一级，名字可以为数字或字母； 如 namespace=public，则文件路径为 /public/xxx.png
 */
FileRouter.post('/upload/:namespace', uploader.single('file'), async (req, res) => {
  // 非登录用户不予上传
  const auth = req['auth']
  if (!auth) {
    return res.status(401).send()
  }

  // 文件不可为空
  const file = req['file']
  if (!file) {
    return res.status(422).send({
      code: 1,
      error: 'file cannot be empty'
    })
  }

  // namespace 只可为数字或字母组合，长底不得长于 32 位
  const namespace = req.params.namespace
  if (!$.isAlphanumeric(namespace) || !$.isLength(namespace, { max: 32, min: 1 })) {
    return res.send({
      code: 1,
      error: 'invalid namespace'
    })
  }

  // 存储上传文件
  const localStorage = new LocalFileStorage(Config.LOCAL_STORAGE_ROOT_PATH, namespace)

  const filepath = path.join(file.destination, `${file.filename}`)
  const info = await localStorage.saveFile(filepath)

  // 不得暴露全路径给客户端
  delete info.fullpath
  return res.send({
    code: 0,
    data: info
  })
})

FileRouter.get('/info/:namespace/:filename', async (req, res) => {
  const { namespace, filename } = req.params
  if (!$.isAlphanumeric(namespace) || !$.isLength(namespace, { max: 32, min: 1 })) {
    return res.send({
      code: 1,
      error: 'invalid namespace'
    })
  }

  const localStorage = new LocalFileStorage(Config.LOCAL_STORAGE_ROOT_PATH, namespace)

  const info = await localStorage.getFileInfo(filename)
  delete info.fullpath
  return res.send({
    code: 0,
    data: info
  })
})

FileRouter.get('/download/:namespace/:filename', async (req, res) => {
  const { namespace, filename } = req.params
  if (!$.isAlphanumeric(namespace) || !$.isLength(namespace, { max: 32, min: 1 })) {
    return res.send({
      code: 1,
      error: 'invalid namespace'
    })
  }

  const localStorage = new LocalFileStorage(Config.LOCAL_STORAGE_ROOT_PATH, namespace)

  const info = await localStorage.getFileInfo(filename)
  return res.download(info.fullpath)
})
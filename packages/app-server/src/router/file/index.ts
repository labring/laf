import * as express from 'express'
import * as path from 'path'
import * as multer from 'multer'
import Config from '../../config'
import { LocalFileStorage } from '../../lib/storage/local_file_storage'
import { v4 as uuidv4 } from 'uuid'
import { parseToken } from '../../lib/utils/token'


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

  const namespace = req.params.namespace
  if (!checkNamespace(namespace)) {
    return res.status(422).send('invalid namespace')
  }

  // 验证访问 token
  if (namespace !== 'public') {
    // 验证上传 token
    const uploadToken = req.query?.token
    if (!uploadToken) {
      return res.status(401).send('Unauthorized')
    }

    const parsedToken = parseToken(uploadToken as string)
    if (!parsedToken) {
      return res.status(403).send('Invalid upload token')
    }

    if (!['create', 'all'].includes(parsedToken?.op)) {
      return res.status(403).send('Permission denied')
    }

    if (parsedToken?.ns != namespace) {
      return res.status(403).send('Permission denied')
    }
  }

  // 文件不可为空
  const file = req['file']
  if (!file) {
    return res.status(422).send('file cannot be empty')
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

FileRouter.get('/download/:namespace/:filename', async (req, res) => {
  const { namespace, filename } = req.params
  if (!checkNamespace(namespace)) {
    return res.status(422).send('invalid namespace')
  }

  if (!checkFilename(filename)) {
    return res.status(422).send('invalid filename')
  }

  // 验证访问 token
  if (namespace !== 'public') {
    const token = req.query?.token
    if (!token) {
      return res.status(401).send('Unauthorized')
    }

    const prasedToken = parseToken(token as string)
    if (!prasedToken) {
      return res.status(403).send('Invalid token')
    }

    if (prasedToken?.ns != namespace) {
      return res.status(403).send('Permission denied')
    }

    if (['read', 'all'].includes(prasedToken?.op)) {
      return res.status(403).send('Permission denied')
    }

    if (prasedToken?.fn && prasedToken?.fn != filename) {
      return res.status(403).send('Permission denied')
    }
  }

  const localStorage = new LocalFileStorage(Config.LOCAL_STORAGE_ROOT_PATH, namespace)

  const info = await localStorage.getFileInfo(filename)
  return res.download(info.fullpath)
})

function checkNamespace(namespace: string) {
  return (new LocalFileStorage('')).checkSafeDirectoryName(namespace)
}

function checkFilename(name: string) {
  return (new LocalFileStorage('')).checkSafeFilename(name)
}
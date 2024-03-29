import { Response } from 'express'
import { createReadStream } from 'fs'
import fs from 'fs/promises'
import fsPromises from 'fs/promises'
import os from 'os'
import path from 'path'
import tar from 'tar'
import { pipeline } from 'stream/promises'
import { DatabaseAgent } from '../db'
import { CLOUD_FUNCTION_COLLECTION, CONFIG_COLLECTION } from '../constants'
import { ICloudFunctionData } from '../support/engine/types'
import { IRequest } from '../support/types'

// Constants for file paths
const WORKSPACE_PATH = path.join(__dirname, '../../cloud_functions')

const TEMP_DIR = path.join(os.tmpdir(), 'cloud_functions')
const TAR_FILE_NAME = 'cloud_functions.tar'
const TAR_FILE_PATH = path.join(TEMP_DIR, TAR_FILE_NAME)

// Function to write cloud function data to the workspace as JSON files
async function saveFunctionsToWorkspace(): Promise<void> {
  // Check if the workspace directory exists and delete it if it does
  try {
    await fs.rm(WORKSPACE_PATH, { recursive: true, force: true })
  } catch (err) {
    console.error('Error removing the workspace directory:', err)
  }

  await fs.mkdir(WORKSPACE_PATH, { recursive: true })

  const funcs = await DatabaseAgent.db
    .collection<ICloudFunctionData>(CLOUD_FUNCTION_COLLECTION)
    .find()
    .toArray()

  for (const func of funcs) {
    const dirPath = path.join(WORKSPACE_PATH, path.dirname(func.name))
    await fs.mkdir(dirPath, { recursive: true })
    const filePath = path.join(WORKSPACE_PATH, func.name)
    await fs.writeFile(filePath, JSON.stringify(func), 'utf8')
  }
}

// Function to create a tarball of the workspace directory
async function createTarPackage(): Promise<void> {
  // Check if the tar file exists and delete it if it does
  try {
    await fs.rm(TAR_FILE_PATH, { force: true })
  } catch (err) {
    console.error('Error removing the tar file:', err)
  }

  await fs.mkdir(TEMP_DIR, { recursive: true })

  await tar.create(
    {
      gzip: false,
      file: TAR_FILE_PATH,
      cwd: WORKSPACE_PATH,
    },
    ['.'],
  )
}

// /docker-file
export async function handleCloudFunctionTarPackage(
  _: IRequest,
  res: Response,
) {
  try {
    // Save them to the workspace directory
    await saveFunctionsToWorkspace()
    // Create a tarball of the workspace
    await createTarPackage()

    // Set headers to serve the tarball as a download
    res.writeHead(200, {
      'Content-Type': 'application/x-tar',
      'Content-Disposition': `attachment; filename="${TAR_FILE_NAME}"`,
    })
    // create file stream
    const readStream = createReadStream(TAR_FILE_PATH)

    // use pipeline pipe the file stream to response
    await pipeline(readStream, res).then(() => {
      // after pipe the file stream, remove the tar file
      fsPromises.unlink(TAR_FILE_PATH).catch((unlinkError) => {
        console.error('Error removing file:', unlinkError)
      })
    })

    await test()
    // after pipe the file stream, remove the tar file
  } catch (error) {
    console.error('Error:', error)
    if (!res.headersSent) {
      return res.status(500).send('Internal Server Error')
    }
  }
}

async function test(): Promise<void> {
  const stack = [WORKSPACE_PATH]

  while (stack.length > 0) {
    const currentDir = stack.pop()
    const entries = await fs.readdir(currentDir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)
      if (entry.isDirectory()) {
        stack.push(fullPath)
      } else if (entry.isFile()) {
        const fileContent = await fs.readFile(fullPath, 'utf8')
        const iCloudFunctionData: ICloudFunctionData = JSON.parse(fileContent)
        console.log(iCloudFunctionData.name)
        console.log(JSON.stringify(iCloudFunctionData, null, 2))
      }
    }
  }
}

export async function handleDockerFile(_: IRequest, res: Response) {
  try {
    const ENV = process.env
    const keysToInclude = [
      'DB_URI',
      'APP_ID',
      'APPID',
      'RUNTIME_DOMAIN',
      'OSS_ACCESS_KEY',
      'OSS_ACCESS_SECRET',
      'OSS_INTERNAL_ENDPOINT',
      'OSS_EXTERNAL_ENDPOINT',
      'OSS_REGION',
      'DEPENDENCIES',
      'NODE_MODULES_PUSH_URL',
      'NODE_MODULES_PULL_URL',
      'NPM_INSTALL_FLAGS',
      'CUSTOM_DEPENDENCY_BASE_PATH',
      'RESTART_AT',
    ]

    let envVariablesString = 'LOG_LEVEL=debug \\\n  FORCE_COLOR=1 \\\n  '

    const conf = await DatabaseAgent.db
      .collection(CONFIG_COLLECTION)
      .findOne({})

    // 检查 conf 是否存在且包含 environments
    if (conf && conf.environments) {
      for (const env of conf.environments) {
        envVariablesString += `${env.name}=${env.value} \\\n  `
      }
    }

    for (const [key, value] of Object.entries(ENV)) {
      if (keysToInclude.includes(key)) {
        // 只包含指定的keys
        envVariablesString += `${key}=${value} \\\n  `
      }
    }

    const DOCKER_FILE = `
FROM node:20.10.0 as builder
RUN apt update && apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev git -y

# 设置自定义 依赖 目录
WORKDIR /tmp/custom_dependency
RUN npm install ${ENV.DEPENDENCIES}

# 设置工作目录为/app
WORKDIR /app

# 使用构建参数指定分支或标签，默认为 'main'
ARG LAF_BRANCH=main

# 克隆特定分支的仓库并且只克隆所需的子目录
RUN git clone --branch $LAF_BRANCH --depth 1 https://github.com/labring/laf.git && mv laf/runtimes/nodejs/* /app/ && rm -rf laf

# 安装依赖和构建应用
RUN npm install && npm run build

# 从builder阶段复制已构建的node模块和应用代码
FROM node:20.10.0

# 暴露端口8000和9000
EXPOSE 8000
EXPOSE 9000

# 创建所需目录并设置权限
RUN mkdir -p /app/functions /app/data /tmp/custom_dependency /app/cloud_functions && chown node:node /app/functions /app/data /tmp/custom_dependency /app/cloud_functions

# 从构建阶段复制node模块和应用代码
COPY --from=builder /tmp/custom_dependency /tmp/custom_dependency
COPY --from=builder /app /app

# 创建软链接
RUN ln -s /tmp/custom_dependency /app/functions/node_modules

# 设置环境变量
# 设置环境变量
ENV ${envVariablesString}

# 下载tar包并解压到cloud_functions目录
RUN curl -o /tmp/cloud_functions.tar.gz http://${ENV.RUNTIME_DOMAIN}/_/cloud-function/tar && tar -xzf /tmp/cloud_functions.tar.gz -C /app/cloud_functions && rm /tmp/cloud_functions.tar.gz

# 切换到非root用户
USER node

# 设置工作目录
WORKDIR /app

# 运行启动脚本
CMD node $FLAGS --experimental-vm-modules --experimental-fetch ./dist/index.js
`
    // 设置响应头，返回纯文本内容
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Content-Disposition': 'attachment; filename="Dockerfile"',
    })

    res.end(DOCKER_FILE)
  } catch (error) {
    // Handle errors by sending an internal server error status and the error message
    res.status(500).send(`Error generating Dockerfile: ${error.message}`)
  }
}

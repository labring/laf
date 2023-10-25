# 第一阶段：构建应用
FROM node:18-slim AS build

WORKDIR /app

# 安装应用依赖
# 使用通配符确保 package.json 和 package-lock.json（如果有的话）都被复制
COPY package*.json ./

RUN npm ci

# 打包应用源代码
COPY . .

RUN npm run build

# 第二阶段：以最小设置构建生产环境
FROM node:18-slim AS production

# 设置非 root 用户并公开端口
USER node
EXPOSE 2342

ENV NODE_ENV=production \
  LOG_LEVEL=debug

WORKDIR /app

# 从前一阶段复制构建的代码
COPY --from=build /app/dist ./dist

# 安装生产依赖并清理缓存
RUN npm ci --production && npm cache clean

# 复制生产依赖信息
COPY --chown=node:node package*.json ./

# 使用 CMD 定义运行时，设置运行应用的命令
CMD [ "npm", "run", "start" ]

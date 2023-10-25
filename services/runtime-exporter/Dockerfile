# 第一阶段：编译
FROM node:18-slim AS build

WORKDIR /app

# 利用缓存机制，只在依赖文件变化时执行 npm install
COPY package*.json ./
RUN npm install

# 复制其他文件和目录
COPY . .

# 构建应用
RUN npm run build

# 第二阶段：设置生产环境
FROM node:18-slim AS production

# 设置环境变量
ENV LOG_LEVEL=debug
ENV NODE_ENV=production

WORKDIR /app

# 从构建阶段复制构建产物
COPY --from=build /app/dist ./dist
# 复制生产依赖，忽略开发依赖
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./

# 设置非 root 用户，提高安全性
RUN chown -R node:node /app/
USER node

# 暴露应用端口
EXPOSE 2342

# 启动应用
CMD [ "npm", "run", "start" ]

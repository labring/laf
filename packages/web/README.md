## laf-web

`laf-web` 是 Laf 开发运维控制台客户端。


## 开发

```bash
# 进入项目目录
cd packages/web

# 安装依赖
pnpm install

# 启动服务
pnpm run dev
```

浏览器访问 http://localhost:9527

## 发布

```bash

# 构建生产环境
pnpm run build
```

## 其它

```bash
# 预览发布环境效果
npm run preview

# 代码格式检查
npm run lint

# 代码格式检查并自动修复
npm run lint -- --fix
```

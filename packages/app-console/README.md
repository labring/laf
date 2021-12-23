## devops-admin

`devops-admin` 是 Laf 开发运维控制台客户端，与 `devops-server` 配套使用。

## 前端优化点

- [] 云函数历史记录
- [] 云函数 diff
- [] 云函数多人协作 myer's diff & changesets(npm)
- [] 云函数监控
- [] 云函数开发体验玩出花
- [] 访问策略非全量覆盖
- [] 访问策略历史记录
- [] 集合管理增加导入导出功能

## 开发

```bash
# 进入项目目录
cd packages/devops-admin

# 安装依赖
npm install

# 建议不要直接使用 cnpm 安装依赖，会有各种诡异的 bug。可以通过如下操作解决 npm 下载速度慢的问题
npm install --registry=https://registry.npm.taobao.org

# 启动服务
npm run dev
```

浏览器访问 http://localhost:9527

## 发布

```bash
# 构建测试环境
npm run build:stage

# 构建生产环境
npm run build:prod
```

## 其它

```bash
# 预览发布环境效果
npm run preview

# 预览发布环境效果 + 静态资源分析
npm run preview -- --report

# 代码格式检查
npm run lint

# 代码格式检查并自动修复
npm run lint -- --fix
```

# less-framework deploy

## 基于 Docker Compose 快速部署

```sh
git clone https://github.com/Maslow/less-framework.git
cd less-framework

# 因 mongo 启动较慢，所以先启动 mongo 服务
docker-compose up -d mongo

# 主动等待数秒后，启动所有服务
docker-compose up

# 浏览器打开 http://locahost:8080 访问
```

## 本地部署

- 确保本地全局安装了 lerna，如未安装先全局安装一下：npm i -g lerna
- 项目根目录下安装根项目依赖：npm install
- 进入packages/devops-server, 依次执行：cp .env.development .env && npm run build && npm run init && npm start
- 进入packages/app-server, 依次执行：cp .env.development .env && npm run build && npm run init && npm start
- 进入packages/devops-admin, 执行：npm run dev 
- 浏览器打开 开发运维控制台
  
> ps：注意，以上两个server包下的 .env 的mongo端口是否跟本地mongo冲突，如有冲突可修改配置的端口。

### 本地部署部分运行截图
- ![](https://i.bmp.ovh/imgs/2021/08/0c21b3c97bd799a1.png)
- ![](https://i.bmp.ovh/imgs/2021/08/f10e7feacc47306d.png)
- ![](https://i.bmp.ovh/imgs/2021/08/49cb6b7af9ef244b.png)

# TODO

- 添加运行截图到 README.md
- 使用 lerna fixed version
### 生产部署脚本

本目录下的脚本为方便在生产上快速部署和管理 laf 服务。

脚本说明：
- `.env` 用于指配置 laf 数据库、域名等信息
- `docker-compose.yml` 用于配置和启动 laf 系统服务
- `start.sh` 运行 laf 服务
- `restart.sh` 重启 laf 服务
- `logs.sh` 查看日志
- `update.sh` 更新 laf 镜像版本，并重启服务
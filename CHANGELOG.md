##  (2021-08-09)

* chore: 优化 cloud-sdk 注释提示；优化 scheduler 调试日志； ([dcdac4e](https://github.com/Maslow/less-framework/commit/dcdac4e))
* fix: 修复菜单权限显示；优化体验； ([cf3eefb](https://github.com/Maslow/less-framework/commit/cf3eefb))
* fix: 修复发布、部署资源时事务使用错误； ([b1c350a](https://github.com/Maslow/less-framework/commit/b1c350a))



## <small>0.4.10 (2021-08-07)</small>

* v0.4.10 ([5c4fb54](https://github.com/Maslow/less-framework/commit/5c4fb54))
* fix: 修复部署面板内容多时无法滚动的问题； ([0cf8d83](https://github.com/Maslow/less-framework/commit/0cf8d83))
* fix: 修复部署时 _id 未转为 ObjectId 的问题； ([0483301](https://github.com/Maslow/less-framework/commit/0483301))



## <small>0.4.9 (2021-08-07)</small>

* v0.4.9 ([f5b039f](https://github.com/Maslow/less-framework/commit/f5b039f))
* feat(*): 新增触发器远程推送部署； ([99f027b](https://github.com/Maslow/less-framework/commit/99f027b))
* feat(fix): 新增触发器远程推送部署，远程推送改为保持 _id 一致的方式； ([655792c](https://github.com/Maslow/less-framework/commit/655792c))



## <small>0.4.8 (2021-08-07)</small>

* v0.4.8 ([c18c266](https://github.com/Maslow/less-framework/commit/c18c266))
* feat: 实现远程部署令牌、推送、接收、应用功能； ([afeb9ec](https://github.com/Maslow/less-framework/commit/afeb9ec))
* feat: 实现远程部署推送、接收、应用功能； ([281cf28](https://github.com/Maslow/less-framework/commit/281cf28))



## <small>0.4.7 (2021-08-06)</small>

* v0.4.7 ([6327f52](https://github.com/Maslow/less-framework/commit/6327f52))
* chore: 所有预置函数增加启用状态；新增发邮件、脚本执行 预置函数； ([5c1a3ce](https://github.com/Maslow/less-framework/commit/5c1a3ce))
* chore: 增加 ali-oss dayjs nodemailer ejs 预置依赖包； ([3cfeb20](https://github.com/Maslow/less-framework/commit/3cfeb20))
* fix: 修复预置函数 admin-edit 的标识错误； ([96f588e](https://github.com/Maslow/less-framework/commit/96f588e))
* fix: 修复IDE快捷键监听未销毁的问题； ([cacb1c0](https://github.com/Maslow/less-framework/commit/cacb1c0))
* fix: 优化 devops 控制台交互体验、样式、延长请求超时时间到 60秒； ([b3ea99f](https://github.com/Maslow/less-framework/commit/b3ea99f))



## <small>0.4.6 (2021-08-06)</small>

* v0.4.6 ([05704ea](https://github.com/Maslow/less-framework/commit/05704ea))
* fix: 修复 tag 页面缓存不生效；去除页面切换动画； ([f8a94c8](https://github.com/Maslow/less-framework/commit/f8a94c8))
* fix: 修复页面缓存时，函数调试页快捷键重复绑定问题； ([1a26cf3](https://github.com/Maslow/less-framework/commit/1a26cf3))
* fix: 优化页面布局，去除面包屑，腾出更多页面空间等； ([55c3a44](https://github.com/Maslow/less-framework/commit/55c3a44))



## <small>0.4.5 (2021-08-05)</small>

* v0.4.5 ([86f5e20](https://github.com/Maslow/less-framework/commit/86f5e20))
* chore: update package-lock.json; add lerna config; ([2f1498d](https://github.com/Maslow/less-framework/commit/2f1498d))
* build: 将 docker push 指令分离为三个； ([9e8ada7](https://github.com/Maslow/less-framework/commit/9e8ada7))



## <small>0.4.4 (2021-08-05)</small>

* v0.4.4 ([09e04ed](https://github.com/Maslow/less-framework/commit/09e04ed))
* build: 修改 dockerfile 给予容器工作目录以写权限； ([50f0151](https://github.com/Maslow/less-framework/commit/50f0151))
* build: update compose config ([e3717bf](https://github.com/Maslow/less-framework/commit/e3717bf))



## <small>0.4.3 (2021-08-05)</small>

* v0.4.3 ([f469c6a](https://github.com/Maslow/less-framework/commit/f469c6a))
* docs: update docs; ([ae46b18](https://github.com/Maslow/less-framework/commit/ae46b18))
* docs: update docs; ([bbdbe95](https://github.com/Maslow/less-framework/commit/bbdbe95))
* build: 减化 dockerfile 构建过程，缩短构建时间；支持 dockerize 指令； ([0d92737](https://github.com/Maslow/less-framework/commit/0d92737))
* build: 修改 docker-compose.yml 支持服务等待； ([6d845c6](https://github.com/Maslow/less-framework/commit/6d845c6))
* build: update build scripts; ([7f03b90](https://github.com/Maslow/less-framework/commit/7f03b90))



## <small>0.4.2 (2021-08-04)</small>

* v0.4.2 ([6075ce2](https://github.com/Maslow/less-framework/commit/6075ce2))
* chore: remove useless config; ([32db735](https://github.com/Maslow/less-framework/commit/32db735))
* feat: 支持保存和使用云函数调试令牌 ([ac237ef](https://github.com/Maslow/less-framework/commit/ac237ef))
* feat: 支持登陆时发放云函数调试令牌；支持配置 token 过期时间； ([2b33cc4](https://github.com/Maslow/less-framework/commit/2b33cc4))
* feat: 支持云函数调试请求令牌 ([57dedc9](https://github.com/Maslow/less-framework/commit/57dedc9))



## <small>0.4.1 (2021-08-04)</small>

* v0.4.1 ([7d2f7f9](https://github.com/Maslow/less-framework/commit/7d2f7f9))
* fix: 修复无法删除函数的问题； ([ff0d855](https://github.com/Maslow/less-framework/commit/ff0d855))
* fix: rename the client title; ([cf49d40](https://github.com/Maslow/less-framework/commit/cf49d40))
* chore: replace icons in menu ([b664266](https://github.com/Maslow/less-framework/commit/b664266))
* docs: update docs; ([c652151](https://github.com/Maslow/less-framework/commit/c652151))
* docs: update todo ([d5f6631](https://github.com/Maslow/less-framework/commit/d5f6631))



## 0.4.0 (2021-08-03)

* chore(fix+config): fix error message; unify config; ([edf1a7a](https://github.com/Maslow/less-framework/commit/edf1a7a))
* Publish ([d44c817](https://github.com/Maslow/less-framework/commit/d44c817))
* Publish ([4f4abb6](https://github.com/Maslow/less-framework/commit/4f4abb6))
* Publish ([27f8636](https://github.com/Maslow/less-framework/commit/27f8636))
* Publish ([ac33b69](https://github.com/Maslow/less-framework/commit/ac33b69))
* Publish ([9509ec5](https://github.com/Maslow/less-framework/commit/9509ec5))
* Publish ([bf5b5e0](https://github.com/Maslow/less-framework/commit/bf5b5e0))
* Publish ([d6987c0](https://github.com/Maslow/less-framework/commit/d6987c0))
* Publish ([89c1ae7](https://github.com/Maslow/less-framework/commit/89c1ae7))
* v0.4.0 ([8c596b4](https://github.com/Maslow/less-framework/commit/8c596b4))
* build: 增加 laf-devops-admin 的 docker 构建脚本； ([91ef1d0](https://github.com/Maslow/less-framework/commit/91ef1d0))
* build: add build scripts ([5eb5105](https://github.com/Maslow/less-framework/commit/5eb5105))
* build: add devops-admin to docker push script ([750595c](https://github.com/Maslow/less-framework/commit/750595c))
* build: add docker build script ([d52038b](https://github.com/Maslow/less-framework/commit/d52038b))
* build: add docker build scripts ([1468686](https://github.com/Maslow/less-framework/commit/1468686))
* build: remove copy readme script ([3f7201c](https://github.com/Maslow/less-framework/commit/3f7201c))
* build: use lerna fixed version; ([af21712](https://github.com/Maslow/less-framework/commit/af21712))
* build(docker): 修改启动命令；优化 dockerfile；增加 docker-compose 启动安全性配置； ([680476f](https://github.com/Maslow/less-framework/commit/680476f))
* feat: 实现 通用 db proxy entry，重构 policy 加载方式；实现 policy agent； ([b8f64aa](https://github.com/Maslow/less-framework/commit/b8f64aa))
* feat: 实现 npm 包类型声明解析、服务接口；重构项目结构，使用 lerna 管理； ([1dc91d2](https://github.com/Maslow/less-framework/commit/1dc91d2))
* feat: 实现触发器配置变更时，更新调度器任务； ([1d8dbe5](https://github.com/Maslow/less-framework/commit/1d8dbe5))
* feat: 实现云函数 SDK 单独依赖包； ([e3d89b1](https://github.com/Maslow/less-framework/commit/e3d89b1))
* feat: 实现云函数的部署； ([82b0783](https://github.com/Maslow/less-framework/commit/82b0783))
* feat: 实现云函数与触发器的部署脚本； ([0a8ef9e](https://github.com/Maslow/less-framework/commit/0a8ef9e))
* feat: 实现云函数与触发器自动部署到 app db；修改文档； ([3ea4713](https://github.com/Maslow/less-framework/commit/3ea4713))
* feat: 新增 dbm entry，负责 app db 的数据管理； ([f7ddae3](https://github.com/Maslow/less-framework/commit/f7ddae3))
* feat: 新增部署访问策略接口, 修改 http 测试用例； ([fbcdb90](https://github.com/Maslow/less-framework/commit/fbcdb90))
* feat: 新增发布函数、触发器接口；取消 watch 监听发布；支持发布时编译云函数； ([ba2e538](https://github.com/Maslow/less-framework/commit/ba2e538))
* feat: 新增访问策略管理页面，修复访问规则添加和删除的bug； ([06f0a2a](https://github.com/Maslow/less-framework/commit/06f0a2a))
* feat: 修改初始化脚本，增加部署访问策略初始脚本； ([3840270](https://github.com/Maslow/less-framework/commit/3840270))
* feat: 用 mongodb watch 实现数据监听机制；实现访问策略部署后自动应用； ([0650d2e](https://github.com/Maslow/less-framework/commit/0650d2e))
* feat: 增加 create 函数； ([cdafdb1](https://github.com/Maslow/less-framework/commit/cdafdb1))
* feat: 增加与平台无关的构建命令脚本；修改 nmutils 包，支持 fs/promises ([68615ff](https://github.com/Maslow/less-framework/commit/68615ff))
* feat: 支持 devops 初始化时创建云函数预置触发器 ([c1b1dde](https://github.com/Maslow/less-framework/commit/c1b1dde))
* feat: add builtin function: injector-admin; ([de48feb](https://github.com/Maslow/less-framework/commit/de48feb))
* feat: add laf-devops-admin packages; ([4f95a45](https://github.com/Maslow/less-framework/commit/4f95a45))
* feat: add query params to trigger ctx ([1280817](https://github.com/Maslow/less-framework/commit/1280817))
* fix:  cloud-function 包名不给发布，重命名； ([2c955c5](https://github.com/Maslow/less-framework/commit/2c955c5))
* fix: 补提交，去除 dbm router 的引用； ([696ed7f](https://github.com/Maslow/less-framework/commit/696ed7f))
* fix: 处理数据操作触发器参数中 _id 类型不为 string 的问题； ([9360fa8](https://github.com/Maslow/less-framework/commit/9360fa8))
* fix: 更新 less-api 版本，增加云函数变量 cloud 代替 less； ([b420bfa](https://github.com/Maslow/less-framework/commit/b420bfa))
* fix: 恢复函数调试调用、增加触发器调用编译功能； ([0eb8163](https://github.com/Maslow/less-framework/commit/0eb8163))
* fix: 将‘创建内部SDK包’的命令分离出来，在构建 docker 镜像时要单独用到； ([321b2f0](https://github.com/Maslow/less-framework/commit/321b2f0))
* fix: 修复 policy 为不存在时错误，返回404 ([f00ddba](https://github.com/Maslow/less-framework/commit/f00ddba))
* fix: 修复 trigger 函数日志 _id 类型问题；导出 编译函数； ([e0fab5b](https://github.com/Maslow/less-framework/commit/e0fab5b))
* fix: 修复获取触发器时未控制状态的问题； ([6dca01a](https://github.com/Maslow/less-framework/commit/6dca01a))
* fix: 修复引用 cloud-functin-engine 路径错误； ([a8e49cc](https://github.com/Maslow/less-framework/commit/a8e49cc))
* fix: 修复云函数调用错误返回状态码； ([145fdcd](https://github.com/Maslow/less-framework/commit/145fdcd))
* fix: 修改 policy injector_func 函数入参； ([4b80766](https://github.com/Maslow/less-framework/commit/4b80766))
* fix: 已暂时恢复云函数的调试接口（未做鉴权） ([23d359e](https://github.com/Maslow/less-framework/commit/23d359e))
* fix: 增加 cloud-function-engine 包默认类型加载； ([315f7e9](https://github.com/Maslow/less-framework/commit/315f7e9))
* fix: add default tag for builtin cloud functions ([fdf297b](https://github.com/Maslow/less-framework/commit/fdf297b))
* fix: fix deploy apis' result data; ([e9c0aac](https://github.com/Maslow/less-framework/commit/e9c0aac))
* fix: fix docker-build.js bugs; ([ca12167](https://github.com/Maslow/less-framework/commit/ca12167))
* fix: fix type error ([270f766](https://github.com/Maslow/less-framework/commit/270f766))
* fix: package node-modules-utils publish: missing dist ([9c8fb0b](https://github.com/Maslow/less-framework/commit/9c8fb0b))
* fix: update app rules; ([4167cab](https://github.com/Maslow/less-framework/commit/4167cab))
* fix: update sys rules; ([a3f4a9a](https://github.com/Maslow/less-framework/commit/a3f4a9a))
* fix: update token split method ([c43ecee](https://github.com/Maslow/less-framework/commit/c43ecee))
* fix(func engine): fix func engine bug; ([e6fa812](https://github.com/Maslow/less-framework/commit/e6fa812))
* fix(function engine): 重新使用旧引擎，解决新引擎内存泄露问题；支持 ts 函数编译； ([ff468f9](https://github.com/Maslow/less-framework/commit/ff468f9))
* fix(spell): fix spell error; ([31a93c5](https://github.com/Maslow/less-framework/commit/31a93c5))
* chore: （补充提交）去除运行缺省配置项； ([0c3557b](https://github.com/Maslow/less-framework/commit/0c3557b))
* chore: 更新 mongodb node driver 到 4.0 版；修改配置和文档； ([0095aab](https://github.com/Maslow/less-framework/commit/0095aab))
* chore: 更新 mongodb node driver 到 4.0，更新文档； ([057e046](https://github.com/Maslow/less-framework/commit/057e046))
* chore: 去除 dbm router, trigger http case ([4566e77](https://github.com/Maslow/less-framework/commit/4566e77))
* chore: 去除应用运行缺省配置； ([92a52cd](https://github.com/Maslow/less-framework/commit/92a52cd))
* chore: 去除与 devops 相关的遗留逻辑； ([e3d8524](https://github.com/Maslow/less-framework/commit/e3d8524))
* chore: 修改 docker-compose yml & docs; ([dc729de](https://github.com/Maslow/less-framework/commit/dc729de))
* chore: 修改 init 脚本，去除非 app 内容； ([095a0d6](https://github.com/Maslow/less-framework/commit/095a0d6))
* chore: 移除所有 rbac 相关代码和测试；重构 entry 为通用 entry； ([a7c3641](https://github.com/Maslow/less-framework/commit/a7c3641))
* chore: 优化获取类型文件相关； ([7bf670c](https://github.com/Maslow/less-framework/commit/7bf670c))
* chore: 增加 app rbac 相关的预置云函数；修改所有预置云函数为 ts； ([c494049](https://github.com/Maslow/less-framework/commit/c494049))
* chore: 增加预置 云函数 init-app-rbac ([81d50f7](https://github.com/Maslow/less-framework/commit/81d50f7))
* chore: 增加运行截图 /screenshot ([1a19e7f](https://github.com/Maslow/less-framework/commit/1a19e7f))
* chore: add vscode config file; ([8bcc6e4](https://github.com/Maslow/less-framework/commit/8bcc6e4))
* chore: clean build file & update docs; ([8c3fe91](https://github.com/Maslow/less-framework/commit/8c3fe91))
* chore: make lerna independent ([68a7f64](https://github.com/Maslow/less-framework/commit/68a7f64))
* chore: make lsf private: true ([9091582](https://github.com/Maslow/less-framework/commit/9091582))
* chore: remove husky & commitlint ([7e85a38](https://github.com/Maslow/less-framework/commit/7e85a38))
* chore: rename less-api-framework package -> app-server ([f110631](https://github.com/Maslow/less-framework/commit/f110631))
* chore: update docs; update sys_rules(add function remove constraint ([e467297](https://github.com/Maslow/less-framework/commit/e467297))
* chore: update less-api to 1.5.3 ([723c62a](https://github.com/Maslow/less-framework/commit/723c62a))
* chore: update less-api* version; ([1c1827f](https://github.com/Maslow/less-framework/commit/1c1827f))
* chore: update package-lock.json ([fd843cc](https://github.com/Maslow/less-framework/commit/fd843cc))
* chore: update package-lock.json ([52ca19a](https://github.com/Maslow/less-framework/commit/52ca19a))
* chore: update version to 0.1.8 ([db52568](https://github.com/Maslow/less-framework/commit/db52568))
* chore(*): rename node-modules-utils ([d4bcb1e](https://github.com/Maslow/less-framework/commit/d4bcb1e))
* chore(rename): 重命名集合名-加前缀，以支持 app db & sys db 为同一库的场景； ([29c89c3](https://github.com/Maslow/less-framework/commit/29c89c3))
* docs: add todo to doc; ([225330f](https://github.com/Maslow/less-framework/commit/225330f))
* docs: update deploy md. ([f6d726b](https://github.com/Maslow/less-framework/commit/f6d726b))
* docs: update docs; ([a48ff78](https://github.com/Maslow/less-framework/commit/a48ff78))
* docs: update docs; ([e177e3b](https://github.com/Maslow/less-framework/commit/e177e3b))
* docs: update docs; ([a81c265](https://github.com/Maslow/less-framework/commit/a81c265))
* docs: update docs( use bitnami/mongodb) ([c48c742](https://github.com/Maslow/less-framework/commit/c48c742))
* docs: update readme ([1638e24](https://github.com/Maslow/less-framework/commit/1638e24))
* docs: update README.md ([016f19f](https://github.com/Maslow/less-framework/commit/016f19f))
* docs: update README.md ([d5417e9](https://github.com/Maslow/less-framework/commit/d5417e9))
* refactor: 将 db accessor 并到 Globals 管理； ([3fba6a9](https://github.com/Maslow/less-framework/commit/3fba6a9))
* refactor: 将原 lsf 拆分为 app & devops server； ([87d68eb](https://github.com/Maslow/less-framework/commit/87d68eb))
* refactor: 微构云函数接口，将云函数引擎初步实现独立于 lsf ([5c8f5c4](https://github.com/Maslow/less-framework/commit/5c8f5c4))
* refactor: 修改 devops entry，将其规则从库中抽离至硬编码; ([851cb8e](https://github.com/Maslow/less-framework/commit/851cb8e))
* refactor: 重构 policy 结构，初始化； ([b404599](https://github.com/Maslow/less-framework/commit/b404599))
* refactor: 重构 policy 实现方式； ([0ca1794](https://github.com/Maslow/less-framework/commit/0ca1794))
* refactor: 重构云函数、触发器代码； ([a62ed37](https://github.com/Maslow/less-framework/commit/a62ed37))
* refactor: 重构云函数引擎引入方式，将其拆为独立的 npm 包维护； ([ce59086](https://github.com/Maslow/less-framework/commit/ce59086))



## <small>0.1.5 (2021-07-05)</small>

* chore: 移除 lsf 中用户登陆注册接口（已使用内置云函数代替） ([fe4b906](https://github.com/Maslow/less-framework/commit/fe4b906))
* chore: add triggers permission rule ([89359b5](https://github.com/Maslow/less-framework/commit/89359b5))
* chore: ignore ecosystem.config.js ([32ce61f](https://github.com/Maslow/less-framework/commit/32ce61f))
* chore: remove ecosystem.config ([4788112](https://github.com/Maslow/less-framework/commit/4788112))
* chore: v0.1.5 ([241941d](https://github.com/Maslow/less-framework/commit/241941d))
* chore(config): husky and commitlint ([0ea00cf](https://github.com/Maslow/less-framework/commit/0ea00cf))
* chore(npm script): commit script ([156776a](https://github.com/Maslow/less-framework/commit/156776a))
* chore(script): init script ([70aa82b](https://github.com/Maslow/less-framework/commit/70aa82b))
* feat: 去除 上传文件到 public 时的验证；增加 mongodb 对象到云函数环境； ([f266655](https://github.com/Maslow/less-framework/commit/f266655))
* feat: 新增实现指定一个触发器的调度更新（接口和功能）； ([8e3dbcf](https://github.com/Maslow/less-framework/commit/8e3dbcf))
* feat: 新增文件上传 built-in 云函数； ([9834018](https://github.com/Maslow/less-framework/commit/9834018))
* feat: 优化简化 entry 和 trigger 配置代码；忽略读取数据事件； ([fe06c74](https://github.com/Maslow/less-framework/commit/fe06c74))
* feat: 云函数支持 http和停启控制；新增函数编辑历史规则； ([56cfa8e](https://github.com/Maslow/less-framework/commit/56cfa8e))
* feat: 云函数支持 method 参数； ([560f4e8](https://github.com/Maslow/less-framework/commit/560f4e8))
* feat: 云函数支持文件上传，支持 headers 参数传入； ([f0c04ab](https://github.com/Maslow/less-framework/commit/f0c04ab))
* feat: 增加跨云函数的全局配置对象； ([8f753b8](https://github.com/Maslow/less-framework/commit/8f753b8))
* feat: 增加dbm 获取集合列表； ([20693c7](https://github.com/Maslow/less-framework/commit/20693c7))
* feat: dbm 实现删除与创建集合索引接口； ([405dfce](https://github.com/Maslow/less-framework/commit/405dfce))
* feat: dbm 新增获取集合索引信息； ([fd1d96c](https://github.com/Maslow/less-framework/commit/fd1d96c))
* feat(enhance): cloud function enhance less object ([19648ac](https://github.com/Maslow/less-framework/commit/19648ac))
* feat(file): 重构LSF 文件管理方式；新增文件访问令牌云函数；修复文件API安全漏洞； ([164ab59](https://github.com/Maslow/less-framework/commit/164ab59))
* feat(fix): 修复云函数上传文件bug；引入 jwt 库；增加云函数参数; ([c28db5d](https://github.com/Maslow/less-framework/commit/c28db5d))
* feat(init): 支持内置云函数的导入；增加用户登陆注册、小程序授权、阿里云发短信等内置云函数 ([8c4b0ec](https://github.com/Maslow/less-framework/commit/8c4b0ec))
* fix:  remove useless log; ([11f2988](https://github.com/Maslow/less-framework/commit/11f2988))
* fix: 补充 less-api 依赖； ([ebbeb8c](https://github.com/Maslow/less-framework/commit/ebbeb8c))
* fix: 去除 function_logs.requestId 的唯一索引； ([68ce1e8](https://github.com/Maslow/less-framework/commit/68ce1e8))
* fix: 完善 admin rules 中删除相关表的规则 ([83e8818](https://github.com/Maslow/less-framework/commit/83e8818))
* fix: 完善 trigger.delete 访问规则； ([502d6f1](https://github.com/Maslow/less-framework/commit/502d6f1))
* fix: 修复 init 指令修复错误的问题； ([6f1b466](https://github.com/Maslow/less-framework/commit/6f1b466))
* fix: 修复触发器 last_exec_time 字段为空时的问题； ([f3b5ada](https://github.com/Maslow/less-framework/commit/f3b5ada))
* fix: 修复登陆注册 token 过期时间错误；更新 http 用例； ([3cd5277](https://github.com/Maslow/less-framework/commit/3cd5277))
* fix: 修改 builtin cloudfunction sig ([f379369](https://github.com/Maslow/less-framework/commit/f379369))
* fix: 优化云函数调用返回结构； ([ea8e4a1](https://github.com/Maslow/less-framework/commit/ea8e4a1))
* fix: remove ali secrets ([82a47d6](https://github.com/Maslow/less-framework/commit/82a47d6))
* fix: remove wxmp app secret ([4671c36](https://github.com/Maslow/less-framework/commit/4671c36))
* fix(deps): add typescript package to dev env ([ce3ed49](https://github.com/Maslow/less-framework/commit/ce3ed49))
* fix(init): add rules & permission to init.js ([0107f03](https://github.com/Maslow/less-framework/commit/0107f03))
* #deps import log4js for less entry; ([ae9e40f](https://github.com/Maslow/less-framework/commit/ae9e40f))
* #deps update less-api 1.3.4 ([d89f6b8](https://github.com/Maslow/less-framework/commit/d89f6b8))
* #doc 更新文档； ([20c3802](https://github.com/Maslow/less-framework/commit/20c3802))
* #doc update docs; ([25f81ab](https://github.com/Maslow/less-framework/commit/25f81ab))
* #doc update README.md ([6407798](https://github.com/Maslow/less-framework/commit/6407798))
* #feat 更新 1.4.1 less-api，支持新规则语法; ([c19011e](https://github.com/Maslow/less-framework/commit/c19011e))
* #feat 更新 less-api v1.4.3，修改数据事件的实现方式； ([e8ce17f](https://github.com/Maslow/less-framework/commit/e8ce17f))
* #feat 实现 function engine 2，支持 import esmodules； ([c8a64d6](https://github.com/Maslow/less-framework/commit/c8a64d6))
* #feat 实现 LocalStorage，文件上传与下载； ([1d81e37](https://github.com/Maslow/less-framework/commit/1d81e37))
* #feat 实现云函数触发器机制； ([0eafa56](https://github.com/Maslow/less-framework/commit/0eafa56))
* #feat 新增云函数中调用云函数的功能； ([0b5c35f](https://github.com/Maslow/less-framework/commit/0b5c35f))
* #feat 修改支持 mongo ，以后以 mongo 为主； ([019d146](https://github.com/Maslow/less-framework/commit/019d146))
* #feat 增加访问规则相关接口及权限；将访问规则移至数据库管理； ([cb2b571](https://github.com/Maslow/less-framework/commit/cb2b571))
* #feat 增加函数调用时间统计； ([c3ea0de](https://github.com/Maslow/less-framework/commit/c3ea0de))
* #feat 增加添加管理员的接口；去除 user_profile 表; ([320d189](https://github.com/Maslow/less-framework/commit/320d189))
* #feat 增加云函数引擎，云函数支持； ([1b27ae8](https://github.com/Maslow/less-framework/commit/1b27ae8))
* #feat faas 支持 require ； ([231d32e](https://github.com/Maslow/less-framework/commit/231d32e))
* #feat impl init admin shell; impl admin login; impl user login/register; add http cases; ([f229879](https://github.com/Maslow/less-framework/commit/f229879))
* #fix 修复 云函数 params 参数传递错误； ([605271a](https://github.com/Maslow/less-framework/commit/605271a))
* #fix 修复获取权限列表注入 less entry 的错误； ([47a2cb7](https://github.com/Maslow/less-framework/commit/47a2cb7))
* #fix 修改 admin rules； ([9bca7bf](https://github.com/Maslow/less-framework/commit/9bca7bf))
* #fix 修改 admin.json 权限名错误； ([a7aabea](https://github.com/Maslow/less-framework/commit/a7aabea))
* #fix 修改 func/invoke 的 URL; ([8fe84ec](https://github.com/Maslow/less-framework/commit/8fe84ec))
* #fix 增加 admin entry 认证检查；增加压测用例； ([31695bf](https://github.com/Maslow/less-framework/commit/31695bf))
* #fix 增加调云函数的别名路由； ([8f34448](https://github.com/Maslow/less-framework/commit/8f34448))
* #fix fix engine.ts bug; ([7e9a0bc](https://github.com/Maslow/less-framework/commit/7e9a0bc))
* #fix fix init rules with less-api-rule-v2; ([52cdc67](https://github.com/Maslow/less-framework/commit/52cdc67))
* #fix response error fix; ([79a730d](https://github.com/Maslow/less-framework/commit/79a730d))
* #impl 实现 init.js 初始化RBAC数据表；修改 readme.md；实现 admin.json 规则；实现 admin entry； ([d069261](https://github.com/Maslow/less-framework/commit/d069261))
* #impl 实现 token 机制；管理员登陆接口； ([ad8ca96](https://github.com/Maslow/less-framework/commit/ad8ca96))
* #impl 实现编辑管理员接口； ([a5ddc4d](https://github.com/Maslow/less-framework/commit/a5ddc4d))
* #impl 实现触发器的优化与调通；优化云函数调用日志； ([4289ea3](https://github.com/Maslow/less-framework/commit/4289ea3))
* #impl 实现云函数调用日志存储； ([76c7f5a](https://github.com/Maslow/less-framework/commit/76c7f5a))
* #impl 修改 admin 与 user 结构，去除 base_user 表，新增 password 表； ([04dd4f7](https://github.com/Maslow/less-framework/commit/04dd4f7))
* #impl 修改 local storage ； ([9bbadb3](https://github.com/Maslow/less-framework/commit/9bbadb3))
* #impl 增加 rbac user 基础表设计；组织项目目录结构； ([17cff29](https://github.com/Maslow/less-framework/commit/17cff29))
* #impl 增加日志打印；增加管理员角色、权限编辑； ([4376204](https://github.com/Maslow/less-framework/commit/4376204))
* #init impl /admin/info；add http cases;  fix entry bugs; ([2a34672](https://github.com/Maslow/less-framework/commit/2a34672))
* #init init framework strcut. ([8df664c](https://github.com/Maslow/less-framework/commit/8df664c))
* feat(:sip): add dotenv , add .env file； ([098ba91](https://github.com/Maslow/less-framework/commit/098ba91))
* first commit ([dd69787](https://github.com/Maslow/less-framework/commit/dd69787))
* Update README.md ([f15e1a3](https://github.com/Maslow/less-framework/commit/f15e1a3))
* Update README.md ([f839d20](https://github.com/Maslow/less-framework/commit/f839d20))
* Update README.md ([442800e](https://github.com/Maslow/less-framework/commit/442800e))
* build: 增加 docker-compose: admin 服务配置； ([0ade47c](https://github.com/Maslow/less-framework/commit/0ade47c))
* build: 增加 dockerfile 、docker-compose 部署； ([af6cc63](https://github.com/Maslow/less-framework/commit/af6cc63))
* build: add docker-compose dev mode config; ([bbfef31](https://github.com/Maslow/less-framework/commit/bbfef31))
* build(config): add PORT to .env.{development, production} ([c454f44](https://github.com/Maslow/less-framework/commit/c454f44))
* docs: 完善说明文档； ([0cd7244](https://github.com/Maslow/less-framework/commit/0cd7244))
* docs: 修改 readme.md 文档； ([30b1f98](https://github.com/Maslow/less-framework/commit/30b1f98))
* docs(*): fix readme.md ([81ff214](https://github.com/Maslow/less-framework/commit/81ff214))
* refactor(*): 修改 faas 中代码的参数设计; ([762f92c](https://github.com/Maslow/less-framework/commit/762f92c))
* refactor(*): refactor code structure, files structre ([33e10f4](https://github.com/Maslow/less-framework/commit/33e10f4))
* refactor(faas): 优化 function incoming context 参数结构； ([2ff1bcc](https://github.com/Maslow/less-framework/commit/2ff1bcc))




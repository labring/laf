
# Testing Design

## Why?

### 为什么要编写测试用例？
- 保障开发质量，更自信的发布
- 降低迭代摩擦，提高开发效率
- 测试可回归，防止牵一而动全身、陈年旧病再现等不预期的惊吓
- 谁开发谁测试，降低 review 成本和协作风险，提高协作体验

### 为什么选择 e2e 测试？
- laf 主要的业务是应用资源管理, 其中包括很多外部资源（db, oss, domain）, 需要完整部署所有资源环境，单元测试无法覆盖
- laf 作为终端用户产品，e2e 测试能更好的模拟用户使用场景
- e2e 测试可以做为最终的交付测试

### 为什么要现在就要开始写测试？
- 当前是密集的开发阶段，对测试的需求迫切
- 越早编写测试，收益越大（即便初期代码变动大，测试用例需相应变更）
- 初期功能缺陷多，编写测试的同时进行修复
- 时间紧，发版压力大，更要有测试保障持续可靠的推进，磨刀不误砍柴功

## What?

### Design Target
- 可以在本地运行，不依赖 CI 环境
- 可以在 CI 环境运行，不依赖本地环境
- 可以做为最终交付的依据，不依赖人工检查

### Testing Types
- `Module Tests` （模块测试）
  - 一个 Module 可以是一个 Controller 也可以是一个其它 Server / Service 模块
  - Module Tests 负责细颗粒度的测试，可以保证更大的逻辑的覆盖率
  - Module Tests 保障业务功能、参数验证、错误处理等各种业务流程分支的正确性
  - Module 开发者应该负责编写对应的 Tests，代码变更时，应该修改期对应的 Module Tests
  - Module Tests 可通过 CI 运行，保证每次 PR 都能通过测试
- `Integration Testing` （集成测试）
  - Integration Testing 负责测试多个 Module 的联合与交互，保障整个系统最终用户行为的正确性
  - Integration Testing 可通过 CI 运行，保证每次 release 都能通过测试（PR 不必通过）
  
## Where?

### Directory Structure

```text
laf/
├── controllers/
    ├── application/
        ├── tests/
            ├── e2e/
                ├── create_app_test.go
                ├── update_app_test.go
                ├── delete_app_test.go
                ├── create_app_bundle_test.go
                ├── create_app_bundle_test.go
                ├── create_app_runtime_test.go
                ├── ...
            ├── api/
                ├── app.go
                ├── bundle.go
                ├── runtime.go
            ├── README.md
        ├── ...
    ├── database/
    ├── gateway/
    ├── oss/
    ├── runtime/
├── tests/
    ├── e2e/
        ├── user_signup_test.go
        ├── user_login_test.go
        ├── app_create_test.go
        ├── app_update_name_test.go
        ├── app_start_test.go
        ├── app_stop_test.go
        ├── app_upgrade_runtime_test.go
        ├── app_update_bundle.go
        ├── app_add_package_test.go
        ├── app_func_create_test.go
        ├── app_func_update_test.go
        ├── app_oss_create_bucket_test.go
        ├── app_oss_delete_bucket_test.go
        ├── ....
    ├── api/
        ├── vm.go
        ├── k8s_cluster.go
        ├── laf_cluster.go
        ├── app.go
        ├── oss.go
        ├── database.go
        ├── gateway.go
    ├── README.md
```

## How?

### Conventions and Norms

- 测试用例文件 (Test Suite) 建议优先使用 go test 的方式编写和执行，除非有更好的测试框架
- 测试用例文件 (Test Suite) 命名规范：`<module>_<action>_test.go`
- 测试用例代码应尽量保持简单，不要过度封装，不要过度抽象，不要过度优化，不要互相依赖状态或代码
- 尽可能将测试拆成到更多的独立文件中，尽量一个用例测一个功能，尽量避免一个用例测试多个功能点
- 不同测试用例文件之间，不应有依赖关系，保证每个文件的独立性，单独可执行

### Test Suite Sample

> 以下为一个测试套件的逻辑结构展示，实际应为 go test 代码。

```md
# Suite 1 - Create Application
    - BeforeSuite()
        - GetOrCreateKubernetesCluster()
        - DeployLafCluster()
    - Case 1 - Create application with DEFAULT config -> OK
        - CreateDefaultApplication()
        - !WaitAndVerifyResult(expect, actual)
        - CleanDefaultApplication()
    - Case 2 - Create application with `enterprise-bundle` -> OK
        - CreateEnterpriseBundle()
        - CreateApplicationWithBundle('enterprise-bundle')
        - !WaitAndVerifyResult(expect, actual)
        - CleanEnterpriseBundle()
        - CleanApplicationWithBundle('enterprise-bundle')
    - Case 3 - Create application with invalid bundle name -> ERROR
        # ...
    - Case 4 - Create application with invalid runtime name -> ERROR
        # ...
    - Case 5 - Create application with 
    - AfterSuite()
        - CleanLafCluster()
```

### CI / Development environment

测试所依赖的外部 kubernetes 集群可通过两种方式提供：
- 直接提供可用集群的 kube config（server & token)，未来可考虑在 sealos cloud 上创建
- 仅提供云平台的 access key 和 secret key，由 CI 在测试开始时创建服务器并安装 kubernetes 集群

可满足以下场景：
1. 在本地开发环境中，由开发者直接提供可用集群的 kube config
2. 在 CI 环境中，可配置和使用 aliyun-cli 自动创建 & 释放云服务器，并部署 kubernetes cluster 
3. 每个测试用例不关心 server or k8s 的创建部署，应该在测试用例运行前执行，测试用例运行后清理

## When?

Now - Development and testing run in parallel. 

- 先实现本地测试，后续再考虑 CI，先使用本地 kubernetes 集群，后续再考虑使用云服务器
- 先编写已实现的 `Module Tests`，后续再考虑 `Integration Testing`
- 先实现 common tests api，以便 Module 作者开始编写对应 Module Tests


# Finally

> Better test better taste.

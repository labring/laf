# 远程部署

## 介绍

  实现目标环境的推送和部署。当前主要推送部署的资源包括: 函数`functions`、 数据库访问策略 `policies`。

### 远程部署整体设计思路

**1.文档对象设计**

* 应用部署授权对象(replicate_auth)
  字段|类型|说明
  --|:--:|--:
  _id|string|主键|
  status|string|状态
  source_appid|string|源应用ID
  target_appid|string|目标应用ID
  created_at|Date|创建时间
  updated_at|Date|更新时间
* status取值说明

  ```
    1.pending 源环境向目标环境发起授权申请
    2.accepted 授权通过后的状态。当授权通过后则可以部署云函数和策略
    3.rejected 授权不通过后的状态
    ```

**2.接口设计**

* 推送(PUT /replicas)

  ```
   1.请求参数
   {
     target_app_id: string,
     functions: {
       type: all | part,
       items: [
         id: string,
         name: string
       ]
     },
     policies: {
       type: all | part,
       items: [
         id: string,
         name: string
       ]
     }
   }
   2.响应
   {
    "code":0,
    "data":"pushed"
  }
  ```

* 应用部署(POST /replicas/:replica_id)

  ```
  1.请求参数
  {  }
  2.响应
   {
    "code":0,
    "data":"deployed"
  }
  ```  

* 应用授权

  ```
  1. 应用授权资源列表查询（不需要分页）(包括我授权的和授权给我的）
  GET /replicate_auth
  2. 应用授权添加(目标环境发起授权申请) 
  PUT /replicate_auth
  3. 应用授权编辑（授权申请审批）
  POST /replicate_auth/:id
  4. 应用授权删除（删除目标应用和原应用的授权关系）源和目标都可以操作
  DELETE /replicate_auth/:id
  ```


## 关于访问规则重新设计的讨论

1. query 重定义
2. 支持 $schema 定义
3. 将 data 验证器中对 add 和 update 操作的逻辑拆分
4. data-update 不需要 required 和 default

> 重点研究 query，核心安全控制在于 query；

### data.add 

1. data 中不包含任何操作符
2. 不需要 merge 选项
3. 配置为数组时，限定只允许写入数组中指定的字段
4. data.add 即 schema，考虑两者之间的关系

### data.update

1. 默认 merge == true 为 update， merge == false 时为 set(replace)
2. update 时有 $set $unset $push $inc 等操作符
3. data.update: update & set 做区分

### data.add data.update schema

1. 可考虑弱化 data.add data.update 的用法
2. schema 还是 data 的别名实现，schema 可同时作用于 udpate & add
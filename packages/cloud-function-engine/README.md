# `cloud-function`

> 云函数引擎，在 `less-framework` 中使用，使用方法请参考 [`less-framework`](https://github.com/Maslow/less-framework)

主要特点：
  - 支持定时器触发器
  - 支持事件触发器
  - 支持在云函数中调用云函数
  - 支持 Typescript & Javascript
  - 支持扩展，自定义触发器的调度器
  - 支持自定义依赖的加载方式

## Usage

```js
const { CloudFunction, TriggerScheduler, CloudFunctionStruct, FunctionContext } = require('cloud-function');

const data = fetchFunctionData()   // data 为 `CloudFunctionStruct`
const func = new CloudFunction(data)
const ctx = {}  // ctx 为 FunctionContext 结构
func.invoke(ctx)
  .then(result => console.log(result))

```

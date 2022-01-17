import { init, Cloud, Db, EnvironmentType } from './index'

export * from './index'

// 此行是为了运行测试用例时， 报 window undefined 使用；
// 如果浏览器环境因此报错， 需要注释掉本行；
// var window: any

if (window) {
  window['LafClient'] = {
    initLessClient: init,
    Cloud,
    Db,
    EnvironmentType
  }
}
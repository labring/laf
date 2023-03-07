# Laf web 开发者快速上手文档

# 项目预览地址

[LaF 云开发](http://preview.laf.run/)

# 本地启动（只启动web项目的情况）

### 方法一：

1. 在web根目录下建立```.env.local```文件,配置接口地址

```jsx
VITE_SERVER_URL=http://dev.laf.run
```

2. 安装依赖，启动项目（项目会启动在```http://127.0.0.1:3001/ ```）

```markdown
pnpm install
pnpm run dev
```

3.  安装whistle, 以及其在浏览器的插件，启动, 

    配置如下规则, 这一步主要是把 ```127.0.0.1:3001``` 映射到```dev.laf.run``` ，可以保证接口不会跨域 ，且共享登录态。

```jsx
http://dev.laf.run/ http://127.0.0.1:3001/ excludeFilter://http://dev.laf.run/v1/
```

4. 在whistle开启模式下访问 ```http://dev.laf.run ```即可
![](/doc-images/whistle-proxy.png)

### 方法二：

 如果不想安装whistle，可以采用以下方法：

1. 由于```vite.config```已经配置了接口的转发地址，所以将```.env.local```文件设置为空，即可正常转发到dev的后端接口

```jsx
VITE_SERVER_URL=
```

2. 启动项目

```jsx
pnpm install
pnpm run dev
```

3. 访问```http://127.0.0.1:3001/``` ，由于此域名下没有登录态，会跳转到登录页

```jsx
http://login.dev.laf.run/login/oauth/authorize?client_id=c3f4dfefc8b0f912cf8d2&redirect_uri=http%3A%2F%2Fdev.laf.run%2Flogin_callback ...
```

4. 需要把地址中的redirect_uri改为```http://127.0.0.1:3001/```刷新登录页后输入用户名密码进行登录

登录成功后就会重定向到```http://127.0.0.1:3001/```。

# 项目结构简介

本节介绍laf web项目的目录结构，下面标注出的是在开发时需要了解的重要内容，未标注出的可以查看源码进一步了解

- web
    - public
        
        locales: 国际化配置文件（目前配置了en,zh,zh-CN三种语言）
        
    - src
        - apis： 接口文件
            
            v1:  根据```http://api.dev.laf.run/api/```自动生成，**不要手动修改**
            
            dependence.ts: 获取依赖列表的接口 (使用npm官方提供的接口)
            
            其他非后端提供的接口可写在当前目录下
            
        - components：组件
            - CommonIcon: 自定义svg图标
            - ConfirmButton:
            - **Content: 布局容器**
            - CopyText: 复制
            - EditableTable: 可编辑表格
            - Editor: 编辑器
            - EmptyBox: 空状态
            - FileStatusIcon: 文件类型的icon
            - FileUpload: 文件上传
            - **Grid: 布局组件（包含行列布局）**
            - IconWrap: 带tooltip的 icon
            - MoreButton： 更多操作
            - Pagination: 分页
            - **Panel：面板**
            - **SectionList: 列表**
        - constants: 常量定义
        - hooks： 自定义Hooks
            
            useAwsS3.ts：使用AWS.S3 直接操作存储
            
            useDB.ts: 使用laf-client-sdk直接操作数据库
            
        - layouts
        - pages
            - app
                - database
  
                    ![](/doc-images/web-database.png)
                    
                - functions
                    
                    ![](/doc-images/web-function.png)
                    
                - logs
                    
                    ![](/doc-images/web-log.png)
                    
                - mods
                    
                    ![](/doc-images/web-mods.png)
                    
                - setting
                    
                    ![](/doc-images/web-setting.png)
                    
                - storages
                    
                    ![](/doc-images/web-storage.png)
                        
            - home： 首页
                
                ![](/doc-images/web-home.png)
                
            **customSetting.ts: 页面布局信息的定义（侧边栏的高度、折叠与展开功能）**
            
            **globalStore.ts:** 全局信息（当前登录态，当前应用，以及totast）
            
        
        chakraTheme.ts: 配置chakra UI的自定义样式
        
    
    tailwind.config.cjs: tailwind的配置文件（可配置颜色，边距，字体大小等全局样式属性）
    

# 相关框架简介

## 基础框架: react

## 数据请求：react-query + axios

1. 链接： [Overview | TanStack Query Docs](https://tanstack.com/query/v4/docs/react/overview)

2. 为什么使用react-query? 

[refactor: react query best practice  by LeezQ · Pull Request #496 · labring/laf](https://github.com/labring/laf/pull/496#issue-1482332711)

3. 用法参考： ```web\src\pages\app\functions\service.ts```
    
    在本项目中对于每个页面都会存在service.ts文件用于管理当前页面内的请求
    

## 状态管理：zustand + immer

1. 链接： [Zustand](https://zustand-demo.pmnd.rs/)

2. 用法参考: ```web\src\pages\app\functions\store.ts```
    
    项目的全局状态管理： ```web\src\pages\globalStore.ts```
    
    每个页面的状态管理：存放在对应的store.ts中
    

## UI库：chakra

1. 链接： [Installation](https://chakra-ui.com/getting-started)

2. 自定义样式要修改：```web/src/chakraTheme.ts```

## 样式: tailwind (主要)+ sass

1. 链接： [Tailwind CSS - Rapidly build modern websites without ever leaving your HTML.](https://tailwindcss.com/)

2. 自定义样式要修改：```web/tailwind.config.cjs```

## 国际化:i18next

1. 链接： [Introduction](https://www.i18next.com/)

2. 国际化文案: ```web/public/locales```
3. 使用方法：
    
    3.1 直接写```t("test")```,鼠标hover上去后会出现如下提示框
    
    ![](/doc-images/web-i181.png)

    3.2 点击zh-CN后面的编辑icon会出现如下输入框，输入后回车就完成了zh-CN文本的翻译

    ![](/doc-images/web-i182.png)

    3.3 在所有编码结束后点击编辑器的翻译插件，可以看到EN和ZH有缺失的翻译文案，点击地球icon即可完成自动翻译

    ![](/doc-images/web-i183.png)

## ICON：react-icons + 自定义icon

1. 链接: [React Icons](https://react-icons.github.io/react-icons/)

2. 自定义ICON使用@chakra-ui/icons

# 提PR流程

主要流程可以参考： 

[三分钟学会参与开源，提交 pr | 左风的博客](https://zuofeng59556.github.io/my-blog/pages/quickStart/pr/)

需要注意的是 laf项目提交的commit格式如下:

```markdown
// () 后面有一个空格
新特性：commit -m "feat(web): this is new"
修复bug: commit -m "fix(web): fix bugs"
...
```

# Lerna 新旧机制的解释

假设一个软件由多个包构成，每个包都可以独立发布，由自己的版本号，这些包由不同人开发。如果给每个包创建一个 repo，则称为 polyrepo。如果只给整个软件创建一个 repo，把所有包都放在这个 repo 中，则称为 monorepo。

## Polyrepo

举个例子，假设有一个 Node.js 软件叫 laf：

1. 这个软件有两个包 `@lafjs/a` 和 `@lafjs/b`，分别由不同人开发。以下简称 a 和 b。
1. a 运行时依赖 b。即 b 在 a 的 `package.json` 中的 `dependencies` 或 `peerDependencies` 中，而不是 `devDependencies` 中。
1. a 只依赖 b 的最新版本，只要 b 一更新版本，a 一定去会适配而跟着更新版本。
1. 只有 a 是直接发布给客户用的。

```
laf
├── a
│   └── package.json
└── b
    └── package.json
```

```jsonc
// laf/a/package.json
{
	"name": "@lafjs/a"
}
```


```jsonc
// laf/b/package.json
{
	"name": "@lafjs/b"
}
```

上述假设在实际中是很常见的场景。可是上述假设 3

> 3. a 只依赖 b 的最新版本，只要 b 一更新版本，a 一定去会适配而跟着更新版本。

使得 polyrepo 会面临两个问题：每当 b 发布的待联调待测试的**非正式**的新版本时

1. b 不得不上传到 registry，否则 a 没法更新依赖版本。
1. a 在更新对 b 的依赖版本时，得用 `npm install @lafjs/a@latest` 手动修改自己的依赖声明。

这看起来还好，但实际工程中 a 的依赖可不只有 b，还有 cdefghijklmn，上面两个问题就会很蛋疼。

于是不得不使用 monorepo。

## Monorepo

在 Node.js 的 Monorepo 中，a 和 b 的源代码总是被一起拉下来的。关键问题在于：我如何让本地的 a 直接依赖本地的 b。这样每当 b 发布**非正式**的更新时，b 只需 `git push`，a 只需 `git pull` 就完事了。

在介绍正确方案前，先介绍两个错误方案：

1. `npm install` 支持本地路径，使用 `npm install ../b` 会
	- 在 a 的 `package.json` 的 dependencies 中写入 `"b": "../b"`
	- 在 a 的 `node_modules` 目录创建指向本地 b 目录的符号链接

	这种方法的问题在于，每次发正式版时，还得把所有包的 `package.json` 一个个改回去。

1. 在 b 中运行 `npm link`，会在 npm 全局安装包目录创建指向本地 b 目录的符号链接。然后在 a 中运行 `npm link b`，这会在 a 的 `node_modules` 中创建指向「npm 全局安装目录中 b 的符号链接」的符号链接。

	这种方式的问题在于，npm 只会在本地文件系统中创建符号链接，但根本不会在 a 的 `package.json` 中声明对 b 的依赖项。因此 a 发布正式版本的时候还得手动把对 b 的依赖声明补上。

接下来介绍正确方案。

## Lerna 新机制

npm v7 及以后的版本，原生支持 monorepo。npm 将整个 laf 软件看成一个母包，将 a 和 b 看成 laf 的子包。在母包 laf 的 `package.json` 的 `workspaces` 字段中声明哪些子目录是子包。

```jsonc
// laf/package.json
{
	"workspaces": ["./a", "./b"]
}
```

当你在 `laf/a` 目录中运行 `npm install @lafjs/b` 时，npm 会

1. 顺着当前目录 `laf/a` 往上找，一直找到 `laf` 目录，发现这个目录里的 `package.json` 中声明了 laf 是一个母包，确定了母包范围。
1. 然后检查这个母包的子包目录 `laf/a` 和 `laf/b` 进去看看这几个子包都叫什么名字，发现一个叫 `@lafjs/a` 另一个叫 `@lafjs/b`。

于是 npm 知道了 `@lafjs/a` 和 `@lafjs/b` 都是母包 laf 的子包，然后就在母包的 `node_modules` 中创建指向本地 b 目录的符号链接，这样  `@lafjs/a` 就能能导入 b。

整个过程都是 npm 原生支持的，解决了上文中的蛋疼问题 1：

	1. b 不得不上传到 registry，否则 a 没法更新依赖版本。

可是蛋疼问题 2 没有解决

	2. a 在更新对 b 的依赖版本时，得用 `npm install @lafjs/a@latest` 手动修改自己的依赖声明。

于是 Lerna 专门用来解决 2。一旦你提交了 commit 修改了 b，然后在母包内任意目录运行 `lerna version`，Lerna 就会

1. 从当前目录往上找，确定母包范围。
1. 检查母包所在 git repo，发现你提交的 commit 与上一次运行 `lerna version` 时相比修改了 b。
1. 给 b 增加版本号，类似 `npm version`。
1. 检查母包 laf 中的所有子包的 `package.json`，看看谁依赖了 b。
1. 把这些依赖了 b 的子包的 `package.json` 中对 b 的依赖项版本号更新一下。
1. 把这些依赖了 b 的子包自己的版本号也更新一下。
1. `git commit`、`git push`。可用 `--no-push` 参数跳过 `git push`。

## Lerna 旧机制

npm v6 及以前版本不原生支持 monorepo。因此两个蛋疼问题都得 Lerna 来干。

由于旧版 `npm install` 看到依赖项就无脑上 registry 去找，Lerna 没法直接调用 npm，只能 Lerna 自己接管了整个安装过程。也就是 Lerna 在 npm 之外搞了一套独立的包管理功能：Lerna 自己读 `package.json`、自己分析依赖关系，自己上 registry 去下载第三方包，自己写 `package-lock.json`……全部自己干。

由于 Lerna 自己维护了整个依赖安装的状态，于是你不得不在所有涉及依赖问题的地方都用 Lerna

- 给某个子包安装新的第三方包用 `lerna add`。而不能 `npm install`。
- 安装当前 `package.json` 中已经声明的依赖用 `lerna bootstrap`。而不能 `npm install` 或 `npm ci`。
- 删除依赖时直接在 `package.json` 中删掉那一行，然后 `lerna bootstrap`。而不能 `npm uninstall`。

如果你想背着 Lerna 偷偷用 npm 装个新依赖，在下面场景中会出问题

- 场景一
	1. 在某个子包中，npm 会在装新依赖的同时把 `package.json` 中声明的旧依赖检查一遍，一旦检查到依赖另外的某个子包，就傻了吧唧地上 registry 去找。
- 场景二
	1. 由于 npm 和 Lerna 的 `package-lock.json` 不完全兼容，npm 给子包 a 安装完依赖之后会重写 a 的 `package-lock.json`。
	1. `git commit` 后 `lerna version` 会判定 a 产生了修改，给 a 增加版本号。
	1. 你某天在子包 b 中为了删除某个依赖而运行了一次 `lerna bootstrap`，由于 Lerna 不能识别 npm 产生的 `package-lock.json`，于是给你把 a 的 `package-lock.json` 又给重写了。
	1. `git commit` 后 `lerna version` 发现 a 的 `package-lock.json` 发生了变化，判定 a 产生了修改，给 a 增加版本号。而实际上你这次对 a 什么都没改。

这就是旧机制最大的问题——你得让所有子包的开发者都用 Lerna 管理依赖，在依赖管理问题上完全脱离 npm 体系，npm 只用来 npm scripts。一旦有一个子包的开发者不小心用了一次 `npm install`，或者某个新加入的开发者在不了解 Lerna 的情况下想当然地用了一次 `npm install`，就会污染所有包的 `package-lock.json`。

另一个比较大的问题是，lerna 的包管理功能确实没有 npm 好用，比如

- Lerna 连个删除依赖的命令都没有，必须手动修改 `package.json` 然后 `lerna bootstrap` 刷新。
- 给子包安装依赖必须用 `--scope` 参数显式指定给哪个子包安装，即使你的当前目录是子包目录。而 npm 可以直接 cd 进子包目录和平时一样安装。

## Migration

由 Lerna 旧机制迁移至 Lerna 新机制很简单

- 将 repo 根目录 `lerna.json` 中的 `packages` 字段内容移动到 repo 根目录 `packages.json` 中的 `workspaces` 字段中。
- 在 repo 根目录 `lerna.json` 新增字段 `"useWorkspaces": true`

迁移之后，如果要给子包安装依赖，直接 cd 进子包目录，然后用 `npm install` 像平时一样安装。

但更新版本号时，不再像平时一样使用 `npm version` 而是使用 `lerna version`。

同时，给整个项目所有子包安装依赖，也不再使用 `lerna exec --parallel npm install`，因为 npm 将各个子包的很多公共第三方依赖安装在母包根目录的 `node_modules`，并行安装可能造成一致性问题。

### TSC

如果某个子包使用 TypeScript 开发并使用 TSC 编译的话，在这个子包的 `tsconfig.json` 中新增字段

```jsonc
{
	"compilerOptions": {
		"skipLibCheck": true
	}
}
```

这是因为 npm 将各个子包的很多公共第三方依赖安装在母包根目录的 `node_modules`，TSC 在编译某个你的子包时，发现某个 import 语句的 specifier 被 resolved 到母包的 `node_modules` 中，于是会顺便检查母包的 `node_modules` 中的所有声明文件，然而这些声明文件很多都是被其他子包依赖的，跟你这个子包一点关系都没有。

举一个例子，假设母包 laf 下有两个子包 `@lafjs/a` 和 `@lafjs/b`。其中 a 是前端项目，b 是后端项目。

```jsonc
// tsconfig.json of `@lafjs/a`
{
	"compilerOptions": {
		"lib": [
			"dom"
		]
	}
}
```

```jsonc
// tsconfig.json of `@lafjs/b`
{
	"compilerOptions": {
		"lib": [
			"es2022"
		]
	}
}
```

此时目录结构是

```
laf
├── node_modules/
├── a/
└── b/
```

当你在 b 目录中运行 tsc 时，tsc 发现 b import 了某个 laf/node_modules 中的内容，于是检查 laf/node_modules 中的所有声明文件，发现某个被 a 依赖的包 `some-dependency-of-a` 的声明文件涉及了浏览器环境的全局对象 `Window`：

```ts
// laf/node_modules/some-dependency-of-a/build/index.d.ts
export declare const abc: Window;
```

但 tsc 现在正在编译的是 b，tsc 发现 b 的 tsconfig.json 中没有 `"compilerOptions": { "lib": ["dom"] }`，于是编译报错。

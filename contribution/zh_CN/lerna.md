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

上述假设在实际中是很常见的场景。可是上述假设 3 使得 polyrepo 会面临两个问题：每当 b 发布的待联调待测试的**非正式**的新版本时

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

1. 在 b 中运行 `npm link`，会在 npm 全局安装包目录创建指向本地 b 目录的符号链接。然后在 a 中运行 `npm link b` 会在 a 的 `node_modules` 中创建指向「npm 全局安装目录中 b 的符号链接」的符号链接。

	这种方式的问题在于，npm 根本不会在 a 的 `package.json` 中写入对 b 的依赖项。

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

于是 npm 知道了 `@lafjs/a` 和 `@lafjs/b` 都是母包 laf 的子包，然后就在 a 的 `node_modules` 中创建指向本地 b 目录的符号链接。

整个过程都是 npm 原生支持的，解决了上文中的蛋疼问题 1：

	1. b 不得不上传到 registry，否则 a 没法更新依赖版本。

可是蛋疼问题 2 没有解决

	2. a 在更新对 b 的依赖版本时，得用 `npm install @lafjs/a@latest` 手动修改自己的依赖声明。

于是 Lerna 专门用来解决 2。一旦你提交了 commit 修改了 b，然后在母包内任意目录运行 `lerna version patch`，Lerna 就会

1. 从当前目录往上找，确定母包范围。
1. 检查母包所在 git repo，发现你提交的 commit 与上一次运行 `lerna version` 时相比修改了 b。
1. 给 b 增加版本号，类似 `npm version patch`。
1. 检查母包 laf 中的所有子包的 `package.json`，看看谁依赖了 b。
1. 把这些依赖了 b 的子包的 `package.json` 中对 b 的依赖项版本号更新一下。
1. 把这些依赖了 b 的子包自己的版本号也更新一下。
1. `git commit`、`git push`。可用 `--no-push` 参数跳过 `git push`。

## Lerna 旧机制

npm v6 及以前版本不原生支持 monorepo。因此两个蛋疼问题都得 Lerna 来干。

由于旧版 `npm install` 看到依赖项就无脑上 registry 去找，Lerna 没法直接调用 npm，只能 Lerna 自己接管了整个安装过程。也就是 Lerna 在 npm 之外搞了一套独立的包管理功能：Lerna 自己读 `package.json`、自己分析依赖关系，自己上 registry 去下载第三方包，自己写 `package-lock.json`……全部自己干。

由于 Lerna 自己维护了整个依赖安装的状态，于是你不得不在所有涉及依赖问题的地方都用 Lerna

- 给某个子包安装新的第三方包用 `lerna add --scope=<child-package> <new-package>`。而不能 `(cd path/to/child/package; npm install <new-package>)`。
- 安装当前 `package.json` 中已经声明的依赖用 `lerna bootstrap`。而不能 `npm install` 或 `npm ci`。
- 删除依赖时直接在 `package.json` 中删掉那一行，然后 `lerna bootstrap`。而不能 `npm uninstall <package>`。

如果你想背着 Lerna 偷偷用 npm 装个新依赖，在下面场景中会出问题

- 场景一
	1. 在某个子包中，npm 会在装新依赖的同时把 `package.json` 中声明的旧依赖检查一遍，一旦检查到依赖另外的某个子包，就傻了吧唧地上 registry 去找。
- 场景二
	1. 由于 npm 和 Lerna 的 `package-lock.json` 不完全兼容，npm 给子包 a 安装完依赖之后会重写 a 的 `package-lock.json`。
	1. commit 后 `lerna version` 会判定 a 产生了修改，给 a 增加版本号。
	1. 你某天在子包 b 中为了删除某个依赖而运行了一次 `lerna bootstrap`，由于 Lerna 不能识别 npm 产生的 `package-lock.json`，于是给你把 a 的 `package-lock.json` 又给重写了。
	1. commit 后 `lerna version` 发现 a 的 `package-lock.json` 发生了变化，判定 a 产生了修改，给 a 增加版本号。而实际上你这次对 a 什么都没改。

这就是旧机制最大的问题——你得让所有子包的开发者都用 Lerna 管理依赖，在依赖管理问题上完全脱离 npm 体系，npm 只用来 npm scripts。一旦有一个子包的开发者不小心用了一次 `npm install`，或者某个新加入的开发者在不了解 Lerna 的情况下想当然地用了一次 `npm install`，就会污染所有包的 `package-lock.json`。

另一个比较大的问题是，lerna 的包管理功能确实没有 npm 好用，比如连个删除依赖的命令都没有。给子包安装依赖必须用 `--scope` 参数显式指定给哪个子包安装，而 npm 可以直接 cd 进哪个子包和平时一样安装。

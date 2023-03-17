# 为什么要写这个指南

这个指南的目的是帮助普通计算机科班生快速熟悉 laf 所需技术栈。

简中互联网严重缺乏各个应用领域面向计算机科班生的教程。网上的教程要么面向已经了解相关技术栈的人，要么面向纯萌新。这两种教程都不适合普通计算机科班生，因为他们对教材上那一套很了解，但是对行业生态工具链一窍不通。

# 这个指南有什么用

这个指南不能代替官方教程，他的目的是告诉你应该看哪些教程，以及提示一些官方教程中没讲明白的坑。

# 前置课程

这个指南默认你已经

- 学过全部软件工程科班必修课程，包括但不限于以下课程及其全部直接或间接先修课程：
	- 《CSAPP》
	- 《算法导论》
	- 《操作系统概念》
	- 《编译原理》
	- 《自顶向下》
	- 《数据库系统概念》
	- 《APUE》《UNP》
	- 《计算机安全导论》
	- 《面向对象设计》
- 学过以下技术栈并有能力自行查阅其官方文档
	- [Shell 语言](https://pubs.opengroup.org/onlinepubs/9699919799/utilities/V3_chap01.html)
	- [Git](https://git-scm.com/book/en/v2)
	- [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
	- [Node.js](https://nodejs.org/en/docs/)
	- [TypeScript](https://www.typescriptlang.org/docs/home.html)
- 会搭梯子
	- 略

# 你需要新学习的技术栈

`*` 表示需要学到能看懂别人使用的水平，`**` 表示需要学到自己能用的水平。

- 软件工程相关
	- \**	[Monorepo](https://monorepo.tools/)
	- \**	[Lerna](https://monorepo.tools/)
	- \*	[systemd](https://systemd.io/)
- 业务相关
	- \*	[Express](https://expressjs.com)
	- \**	[NestJS](https://docs.nestjs.com)
	- \**	[Prisma](https://www.prisma.io/docs)
	- \**	[MongoDB](https://docs.mongodb.com)
	- \**	[MinIO](https://docs.min.io)
- 云原生相关
	- \*	[Linux namespace](https://man7.org/linux/man-pages/man7/namespaces.7.html)
	- \*	[Linux cgroups](https://man7.org/linux/man-pages/man7/namespaces.7.html)
	- \**	[Docker](https://docs.docker.com)
	- \*	[Kubernetes](https://kubernetes.io/docs/home/)
		- 《深入剖析 kubernetes》张磊
	- \*	[Helm](https://helm.sh/docs/)
	- \*	[Sealos](https://sealos.io/zh-Hans/)
	- \**	[Telepresence](https://www.telepresence.io)
	- \*	[APISIX](https://apisix.apache.org/zh/)
	- \*	[Casdoor](https://casdoor.org/zh/)

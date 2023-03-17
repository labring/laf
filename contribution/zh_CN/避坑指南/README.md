# 为什么要写这个指南

这个指南的目的是帮助普通计算机科班生熟悉 laf 所需技术栈，少走弯路。

简中互联网严重缺乏各个应用领域面向计算机科班生的教程。网上的教程要么面向已经了解相关技术栈的人，要么面向纯萌新。这两种教程都不适合普通计算机科班生，因为他们对教材上那一套很了解，但是对行业生态工具链一窍不通。

# 这个指南有什么用

**这个指南不能代替官方教程**，指南的目的只是告诉你应该看哪些教程，以及提示一些官方教程中没讲明白的坑。

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
		- [npm](https://docs.npmjs.com/)
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
	- \**	[OpenAPI](https://swagger.io)
	- \**	[Prisma](https://www.prisma.io/docs)
	- \**	[MongoDB](https://docs.mongodb.com)
	- \**	[MinIO](https://docs.min.io)
- 云原生相关
	- \*	[Linux namespaces](https://man7.org/linux/man-pages/man7/namespaces.7.html)
	- \*	[Linux virtual ethernet device](https://man7.org/linux/man-pages/man4/veth.4.html)
	- \*	[Linux cgroups](https://man7.org/linux/man-pages/man7/namespaces.7.html)
	- \**	[Docker](https://docs.docker.com)
	- \*	[Kubernetes](https://kubernetes.io/docs/home/)
		- 《深入剖析 kubernetes》张磊
	- \*	[Helm](https://helm.sh/docs/)
	- \*	[Sealos](https://sealos.io/zh-Hans/)
	- \**	[Telepresence](https://www.telepresence.io)
	- \*	[APISIX](https://apisix.apache.org/zh/)
	- \*	[Casdoor](https://casdoor.org/zh/)

# 避坑小技巧

- 完善程度：知名教材 > 官方文档 > 培训机构网课 > 绝大部分学校自编野鸡教材 > 简中互联网 18 手资料。
- 官方文档尽量看原文不看译文，原文是英文就看英文版，原文是中文就看中文版。

你没有看错，官方教材的完善程度是低于知名教材的。这是因为官方教材的作者受到[知识的诅咒](https://zh.wikipedia.org/zh-cn/%E7%9F%A5%E8%AD%98%E7%9A%84%E8%A9%9B%E5%92%92)，而知名教材的作者通常受过专业的教育学训练，能克服知识的诅咒。

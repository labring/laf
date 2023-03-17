# 安装

在 dockerd 的配置文件 `/etc/docker/daemon.json` 中 `registry-mirrors` 设置 Docker Hub 国内镜像。

<https://docs.docker.com/engine/reference/commandline/dockerd/#daemon-configuration-file>

常用的国内镜像是阿里云容器镜像加速。

# docker build

每一个命令在镜像上覆盖一层，成为新镜像。

> 如果你不理解「层」的概念，请谷歌「UnionFS」。

# docker image

- `docker image ls`
- `docker pull`
- `docker push`

## docker tag

tag 作为名词，是指镜像名后面的标签。

但 `docker tag` 命令，用于给镜像取名顺便打标签，默认标签是 latest。

推送时，将镜像推送为 registry 中的同名镜像。

因此在本地，镜像名及标签就是一个用于标识的字符串，没有任何语义。但在 registry 中，镜像名前面的 scope 是你的用户名，你往别人的 scope 推送就没有权限。这类似 npm，如果你不打算推送上传，那么 scope 可以随便填。

# docker container

停止重启容器后，文件不会丢。只有删除并重开容器，才会清空容器内文件系统，这一点[官方教程](https://docs.docker.com/get-started/05_persisting_data/)里写错了。

> In case you didn’t notice, our todo list is being wiped clean every single time we launch the container.

此处应为

> In case you didn’t notice, our todo list is being wiped clean every single time we launch the image as a container.

只不过容器内文件系统难以迁移，所以一般不会直接用这个容器内文件系统来持久化数据。

## 参数

### dit

- `-d`: detach
- `-i`: keep stdin open
- `-t`: pseudo tty line discipline，提供回显，颜色，C-c 等特殊字符特别处理等功能。

> 如果你不记得什么是 line discipline，请复习《APUE》的《终端》章节。

显然，没有 `-i` 时，`-t` 没有意义，因为 stdin 都关了，line discipline 始终空闲。

`-di` 会使得容器内 stdin 始终未就绪，如果容器内进程读 stdin，就会一直阻塞。

#### detach

不管有没有 `-d`，docker 都会给容器一个新的宿主机 session。而 attach 的功能是 docker 自己用 IPC 实现的，容器根进程的 stdio 设备并不是你敲 `docker run` 命令的当前终端，因此容器根进程不会开启 line discipline。

使用选项 `-t` 使得容器根进程认为自己的 stdio 设备是 pseudo terminal。例如

```shell
docker run -it <image-name> 2> ./error.txt
```

虽然容器根进程的 stdout 被重定向到了文件，但容器根进程仍然认为 stdout 是 tty，因此会向 `./error.txt` 中输出各种终端控制字符，比如颜色控制码。

detached 容器只要 stdio 没关，将来还可以再 attach 回去。

### 其他常用

- `--rm` 容器退出自动删除。
- `--name` 指定容器名字，而不使用随机名字。

## docker exec

docker exec 运行的进程，与容器内根进程在进程树上同级，他们的 ppid 都是 0，都由 runtime 回收 zombie。区别在于根进程挂了之后 runtime 会把其他进程都 sigkill，而 docker exec 进程挂了就挂了。

# docker volume

可以挂载一个由 docker 管理的卷，也可以挂载一个宿主机目录。

# docker network

可以建立一个虚拟的 IP 层局域网，让多个容器接入这个网络。

容器接入时 `--network-alias` 设置自己的 hostname。这个 option 名有误导性，让人误以为是「alias of the network」，实际意思是「alias of myself in the network」。

> 如果你不记得什么是虚拟网络，请复习 `man 7 network_namespaces` 和 `man 4 veth`。

`--network host` 表示不给容器启动独立的 Linux network namespace，留在宿主机命名空间。

## hostname

- `--hostname` 设置容器自己的 hostname，但不会在虚拟网络的 DNS 中注册。
- `--network-alias` 在虚拟网络中注册一个 alias 作为自己的 hostname。

# docker compose

用一个 yaml 配置文件描述一个由多个镜像构成的软件。这只是一个描述性文件，不能像 Dockerfile 一样将整个多镜像软件打包成一个超级镜像。因此软件内每一个镜像都必须上传到 registry，否则用户拿到 compose yaml 之后安装不了。

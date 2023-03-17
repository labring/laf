# docker build

每一个命令在镜像上覆盖一层，成为新镜像，类似函数式文件系统。

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

停止重启容器后，文件不会丢。只有删除重开容器，才会清空容器内文件系统，这一点文档里写错了。

只不过容器内文件系统难以迁移，所以一般不会直接用这个容器内文件系统来持久化数据。

## 参数

### dti

- `-d`: detach
- `-i`: keep stdin open
- `-t`: pseudo tty line discipline，提供回显，颜色，C-c 等特殊字符特别处理等功能。

显然，没有 `-i` 时 `-t` 没有意义，因为 stdin 都关了，line dicipline 始终空闲。

`-di` 会使得容器内 stdin，但什么都读不到一直阻塞。

#### detach

不管有没有 `-d`，docker 都会给容器新 session in host。而 attach 功能是 docker 自己用 IPC 实现的。

```shell
docker run -it <image-name> 2> ./error.txt
```

虽然是在宿主机 shell 的进程组管道中 attach 运行，但容器根进程仍然认为 stdio 是 tty。

detached 容器只要 stdio 没关，将来还可以再 attach 回去。

### 其他常用

- `--rm` 容器退出自动删除。
- `--name` 指定容器名字，而不使用随机名字。

## docker exec

docker exec 运行的进程，与容器内根进程在进程树上同级，他们的 ppid 都是 0，都由 runtime 回收 zombie。区别在于根进程挂了之后 runtime 会把其他进程都 sigkill，而 docker exec 进程挂了就挂了。

# docker volume

可以挂载一个空卷，也可以挂载一个宿主机目录。

# docker network

可以建立一个 IP 层虚拟局域网，让多个容器接入这个网络。

容器接入时 `--network-alias` 设置自己的 hostname。这个 option 名有误导性，让人误以为是「alias of the network」，实际意思是「alias of me in the network」。

## hostname

- `--hostname` 设置容器自己的 hostname，但不会在虚拟网络的 DNS 中注册。
- `--network-alias` 在虚拟网络中注册一个 alias 作为自己的 hostname。

# docker compose

用一个 yaml 配置文件描述一个由多个镜像构成的软件。这只是一个描述性文件，不能像 dockerfile 一样将整个多镜像软件打包成一个超级镜像。因此软件内每一个镜像都必须上传到 registry，否则用户拿到 compose yaml 之后安装不了。

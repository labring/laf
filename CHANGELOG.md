# [](https://github.com/labring/laf/compare/v1.0.0-beta.0...v) (2023-01-20)



# [1.0.0-beta.0](https://github.com/labring/laf/compare/v1.0.0-alpha.5...v1.0.0-beta.0) (2023-01-20)


### Bug Fixes

* **deploy:** fix minio ingress in build charts ([#658](https://github.com/labring/laf/issues/658)) ([de0a86b](https://github.com/labring/laf/commit/de0a86ba84be39a911f647fa1117aa15c24413db))
* **server:** fix bucket-udpate bug & server deploy issue ([#641](https://github.com/labring/laf/issues/641)) ([f6e2c35](https://github.com/labring/laf/commit/f6e2c3572d9fd22cc00a18b4302a4b361788a8ee))
* **server:** fix response check error in bucket-updating ([#642](https://github.com/labring/laf/issues/642)) ([c4d994e](https://github.com/labring/laf/commit/c4d994e89fbf74483aae3f78750d2c5d0b82abea))
* **server:** fix storage endpoint & ingress error ([#638](https://github.com/labring/laf/issues/638)) ([5506965](https://github.com/labring/laf/commit/5506965d942fb91358f6aa698ec85a2d906eee58))
* **web:** encode function debug header & button theme ([#646](https://github.com/labring/laf/issues/646)) ([a0a2497](https://github.com/labring/laf/commit/a0a2497dc5e28d45411772de0f74ff49b159742d))
* **web:** fix bucket name pattern ([#662](https://github.com/labring/laf/issues/662)) ([1f58446](https://github.com/labring/laf/commit/1f5844637fe3f88a375a900fe706bfcdeca624bb))
* **web:** fix function page ui, update triger modal ([#652](https://github.com/labring/laf/issues/652)) ([a7fcfa5](https://github.com/labring/laf/commit/a7fcfa5f11d1dfb615e409b945eb220b42afa688))
* **web:** fix pagination & favcon, optimize the ui styles ([#656](https://github.com/labring/laf/issues/656)) ([56cd541](https://github.com/labring/laf/commit/56cd541d8cd04448fc03e1040629bb0032cb5055))
* **web:** replace gateway crd data with app domain object ([#660](https://github.com/labring/laf/issues/660)) ([5d411bb](https://github.com/labring/laf/commit/5d411bb315b3695cbe7c1d5306583bf94d2330e7))


### Features

* **cli:** add function delete ([#664](https://github.com/labring/laf/issues/664)) ([b4002ba](https://github.com/labring/laf/commit/b4002ba1c703bcbccc9d6cc2ad026ac44e6f7b31))
* **cli:** refactor and impl function actions([#647](https://github.com/labring/laf/issues/647)) ([d49b15e](https://github.com/labring/laf/commit/d49b15e1e7cc4705316d49271f3744cf415b9ee4))
* **cli:** support dependency install ([#663](https://github.com/labring/laf/issues/663)) ([ac0be96](https://github.com/labring/laf/commit/ac0be967795d22f12d9f87be2f162473ed6bbf68))
* **gateway:** refactor gateway in server instead of crd ([#649](https://github.com/labring/laf/issues/649)) ([5207aa4](https://github.com/labring/laf/commit/5207aa45291cbecf4059fa995f4a4cbb4fae0890))
* **server:** impl bucket domain service ([#661](https://github.com/labring/laf/issues/661)) ([aa8a3af](https://github.com/labring/laf/commit/aa8a3af2e566163882056634cfd58111f6df0056))
* **server:** support multi-region cluster ([#648](https://github.com/labring/laf/issues/648)) ([ba5698c](https://github.com/labring/laf/commit/ba5698c04d2af69fccca8a6e8433379091da3bf8))
* **web:** add row & col layout ([#619](https://github.com/labring/laf/issues/619)) ([a016f4e](https://github.com/labring/laf/commit/a016f4e7044bff8159581b3eae9141aef27fd41a))
* **web:** add trigger panel ([#643](https://github.com/labring/laf/issues/643)) ([fbf850f](https://github.com/labring/laf/commit/fbf850f9e5be11517a6c3412a778d62f600d2bd7))
* **web:** fix function layout & more button ([#655](https://github.com/labring/laf/issues/655)) ([9813ca3](https://github.com/labring/laf/commit/9813ca3c467b377f54bb63a49e1e645b39770d31))
* **web:** policy panel & log new UI ([#624](https://github.com/labring/laf/issues/624)) ([dc5df96](https://github.com/labring/laf/commit/dc5df96e82bed00918fac31e8c56a20f50365d1f))
* **web:** support toggle panels in function page ([#623](https://github.com/labring/laf/issues/623)) ([fda7b0d](https://github.com/labring/laf/commit/fda7b0d3e5c0a89ea78abcff3deb538d4749de56))



# [1.0.0-alpha.5](https://github.com/labring/laf/compare/v1.0.0-alpha.4...v1.0.0-alpha.5) (2023-01-11)


### Bug Fixes

* **core:** remove bucket route pass host ([#600](https://github.com/labring/laf/issues/600)) ([a75a61f](https://github.com/labring/laf/commit/a75a61f467b33321d3c419bcca85af7c4fdfeba0))
* default load typedefiniiton ([#606](https://github.com/labring/laf/issues/606)) ([e2d0967](https://github.com/labring/laf/commit/e2d09673d4a1a27afc0b81a66dea04c91a7da1f4))
* **server:** fix function websocket error; add tags for function ([#611](https://github.com/labring/laf/issues/611)) ([6abee36](https://github.com/labring/laf/commit/6abee366d85d6396137fd4bdbaf79838c696d2c1))
* **web:** create same function cause page error ([#603](https://github.com/labring/laf/issues/603)) ([caa2a5d](https://github.com/labring/laf/commit/caa2a5d04d833ec701cdb4575a45dbb8fd1c1b00))


### Features

* **server:** add enviroments apis ([#605](https://github.com/labring/laf/issues/605)) ([acf5d34](https://github.com/labring/laf/commit/acf5d34f23bb6958ca61c0b52e19532459283aa5))
* **server:** add update-deps api ([#613](https://github.com/labring/laf/issues/613)) ([a1f67ae](https://github.com/labring/laf/commit/a1f67aefaab8bd1a80b70f573cbe910dcee404d5))
* **server:** implement policy rule schema & crud ([#612](https://github.com/labring/laf/issues/612)) ([5e3789c](https://github.com/labring/laf/commit/5e3789c30f6caf50459a9aaeaccb64261d019ee7))
* **web:** add AppEnvList and PATList ([#608](https://github.com/labring/laf/issues/608)) ([7d9cd82](https://github.com/labring/laf/commit/7d9cd8250aed493a820415fbac6fe87b8b86efc5))
* **web:** fix database & storage bug ([#595](https://github.com/labring/laf/issues/595)) ([4ff0d9b](https://github.com/labring/laf/commit/4ff0d9ba85cfa588f2a7bd0a4b2e5ea0d9a6e8b1))
* **web:** fix hotKey bug & hidden some buttons ([#602](https://github.com/labring/laf/issues/602)) ([f0bcbe6](https://github.com/labring/laf/commit/f0bcbe69709ceaac8e72378346fb502dcf35d095))
* **web:** hide patList edit button & show copy token button ([#609](https://github.com/labring/laf/issues/609)) ([8772314](https://github.com/labring/laf/commit/8772314b493cb79f1ba8772ecd792b3d3beb9858))
* **web:** new ui application page ([#614](https://github.com/labring/laf/issues/614)) ([e4c524a](https://github.com/labring/laf/commit/e4c524a769f85e39b692b081561687b3d4d6208d))
* **web:** new ui function page ([#615](https://github.com/labring/laf/issues/615)) ([593481a](https://github.com/labring/laf/commit/593481a06598991dc780053a1aedb6d4c78165dd))
* **web:** optimize hotkey function ([#604](https://github.com/labring/laf/issues/604)) ([f429c2a](https://github.com/labring/laf/commit/f429c2a299743d2e85e23f5c8d2a734d8d0ec1ae))



# [1.0.0-alpha.4](https://github.com/labring/laf/compare/v1.0.0-alpha.3...v1.0.0-alpha.4) (2023-01-01)


### Bug Fixes

* **runtime:** add func data header for debug api, support multiple-method for debug request ([#594](https://github.com/labring/laf/issues/594)) ([db9eacd](https://github.com/labring/laf/commit/db9eacd8015a2a4b428230456588e11f51fdcf09))


### Features

* **cli:** init cli project ([#488](https://github.com/labring/laf/issues/488)) ([90b177f](https://github.com/labring/laf/commit/90b177ff63697bc76591ebfbd40577adf0959acb))
* **cli:** login and logout & update work dir ([#587](https://github.com/labring/laf/issues/587)) ([792a0f3](https://github.com/labring/laf/commit/792a0f31794cb44d5d3489456237080571edc50e))
* **server:** implement pat schema & apis ([#597](https://github.com/labring/laf/issues/597)) ([d4da55a](https://github.com/labring/laf/commit/d4da55a9305547496a64c64e1c7c9ddbff68a36d))
* **web:** add custom url for page ([#592](https://github.com/labring/laf/issues/592)) ([41916f9](https://github.com/labring/laf/commit/41916f973078926ee1556c839a8cdf9707b9cc76))
* **web:** add function ide console panel ([#593](https://github.com/labring/laf/issues/593)) ([03846e7](https://github.com/labring/laf/commit/03846e759430192f86174cec6a78a29705717043))
* **web:** adjust dependence add、remove、get interface ([#582](https://github.com/labring/laf/issues/582)) ([7795fb1](https://github.com/labring/laf/commit/7795fb1a739b027c53161b86612d37944b9406e0))
* **web:** disabled upload button when fileList is empty ([#589](https://github.com/labring/laf/issues/589)) ([5de333c](https://github.com/labring/laf/commit/5de333c76513783b911a0094bc52a652a586a40b))
* **web:** fix functionPannel & dataPannel ([#586](https://github.com/labring/laf/issues/586)) ([7dcc72a](https://github.com/labring/laf/commit/7dcc72a31745ddf47e5c47c30d59a92c243a4365))
* **web:** impl storage page ([5c42bc6](https://github.com/labring/laf/commit/5c42bc6e4c967a526547ac6bfb0284c658768209))



# [1.0.0-alpha.3](https://github.com/labring/laf/compare/v1.0.0-alpha.2...v1.0.0-alpha.3) (2022-12-24)


### Bug Fixes

* **server:** add policy service to module provider ([#576](https://github.com/labring/laf/issues/576)) ([7911ba0](https://github.com/labring/laf/commit/7911ba0a0475804982f5d1bb050346f647657b5a))
* **server:** fix build error in policy service ([#575](https://github.com/labring/laf/issues/575)) ([88ae17d](https://github.com/labring/laf/commit/88ae17d718f37def429b17e141bd0137c4e33ce9))
* **server:** support array input param for adding deps ([#577](https://github.com/labring/laf/issues/577)) ([a7c0dc8](https://github.com/labring/laf/commit/a7c0dc893305248276d33abc359758b95f25640f))
* **web:** fix to use new function debug token header & url ([99cf35c](https://github.com/labring/laf/commit/99cf35c504383af67c947ea74f9e57b24f405820))


### Features

* **runtime:** support interceptor function [#341](https://github.com/labring/laf/issues/341) ([#579](https://github.com/labring/laf/issues/579)) ([17f7606](https://github.com/labring/laf/commit/17f7606642c511e85824537a97c4ca3b502fb561))
* **sdk:** add cloud sdk package ([c98aaec](https://github.com/labring/laf/commit/c98aaec086ae023da544ca7b23068464fc29d13a))
* **server:** implement cron trigger schema & crud apis ([#578](https://github.com/labring/laf/issues/578)) ([3f6927c](https://github.com/labring/laf/commit/3f6927c34e5526c16c41c68c9d4fae3d823106be))
* **server:** implement policy schema & apis ([#574](https://github.com/labring/laf/issues/574)) ([0d1d090](https://github.com/labring/laf/commit/0d1d090d330bb33f89fa2f04c4f8476f6d68b30f))
* **web:** add app restart ([#571](https://github.com/labring/laf/issues/571)) ([c53d76a](https://github.com/labring/laf/commit/c53d76a4db1ddd2c6d49759f1b4c6f780933d447))
* **web:** add page cache when switch sidebar page ([#563](https://github.com/labring/laf/issues/563)) ([c499afe](https://github.com/labring/laf/commit/c499afeacf913d08b9ebb99cd9fc90d9812a5bad))



# [1.0.0-alpha.2](https://github.com/labring/laf/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2022-12-19)


### Bug Fixes

* **runtime:** update deps installation impl to new design ([#553](https://github.com/labring/laf/issues/553)) ([cdda443](https://github.com/labring/laf/commit/cdda44352ce0435efbc6782e291c7caa84c9376d))
* **web:** error when no function data ([#556](https://github.com/labring/laf/issues/556)) ([8d2e4b6](https://github.com/labring/laf/commit/8d2e4b6ed6ba3d17b8cd7e9ac4a55c5cea8fff1b))
* **web:** fix function compile res data error ([#549](https://github.com/labring/laf/issues/549)) ([9d6f8b0](https://github.com/labring/laf/commit/9d6f8b036006f8136dc67795ed66d4d11763059e))
* **web:** pagination ts error ([#560](https://github.com/labring/laf/issues/560)) ([3380690](https://github.com/labring/laf/commit/3380690041930a7bc0181be2b16ea3b26b643bfb))


### Features

* **server:** add app restart api & handler ([#558](https://github.com/labring/laf/issues/558)) ([5764029](https://github.com/labring/laf/commit/57640292a5e1d46618eccdb22ab00d70f7f87874))
* **server:** add dependency module & apis ([#552](https://github.com/labring/laf/issues/552)) ([24a497d](https://github.com/labring/laf/commit/24a497d26859c754bcb6d161ea8c5a1acec9de12))
* **web:** add func deploy confirm  &  code diff info ([#550](https://github.com/labring/laf/issues/550)) ([682dcc5](https://github.com/labring/laf/commit/682dcc528af18951c689a0c4e9bc80904f608196))
* **web:** impl function logs page ([#559](https://github.com/labring/laf/issues/559)) ([97c4728](https://github.com/labring/laf/commit/97c4728c846ca4c8725e4f56edfae3fd535dd7e2))



# [1.0.0-alpha.1](https://github.com/labring/laf/compare/v1.0.0-alpha.0...v1.0.0-alpha.1) (2022-12-15)


### Bug Fixes

* **core:** fix gateway bucket name issue & minio deploy domain config ([#537](https://github.com/labring/laf/issues/537)) ([b08b4e2](https://github.com/labring/laf/commit/b08b4e2e5c661fee77846bcd6b77022d96bf714a))
* **runtime:** impv runtime logging struct; add func logs api ([#538](https://github.com/labring/laf/issues/538)) ([c9d2292](https://github.com/labring/laf/commit/c9d22925cd4222a5088b388ff068fad8b2644a9b))
* **server:** fix compile function api params schema error ([#540](https://github.com/labring/laf/issues/540)) ([37c049c](https://github.com/labring/laf/commit/37c049ccff0dbcb9e0c66b967dfb9f87301341ba))
* **server:** fix prisma bin engine error in amd64 ([#547](https://github.com/labring/laf/issues/547)) ([4c76333](https://github.com/labring/laf/commit/4c7633302e78072881a3fdac708fb8e74eb00e58))
* **server:** func compile api response struct dismatch standard ([#543](https://github.com/labring/laf/issues/543)) ([97de760](https://github.com/labring/laf/commit/97de760e57820f6418e82fdb1c75f23ce61f0121))
* **web:** replace aws client sdk v3 with v2 ([#546](https://github.com/labring/laf/issues/546)) ([3282894](https://github.com/labring/laf/commit/328289416920ae0685ec2bd9f25fd937a8f01fb4))


### Features

* **web:** complete function compile ([#545](https://github.com/labring/laf/issues/545)) ([7c712e8](https://github.com/labring/laf/commit/7c712e86163117e97aee262fd4edf1bc9877f3d9))
* **web:** impl db crud; impl file crud; ([#542](https://github.com/labring/laf/issues/542)) ([9782423](https://github.com/labring/laf/commit/978242306449121c1e493e0e57136cee15850ae7)), closes [#535](https://github.com/labring/laf/issues/535) [#536](https://github.com/labring/laf/issues/536) [#537](https://github.com/labring/laf/issues/537) [#538](https://github.com/labring/laf/issues/538) [#539](https://github.com/labring/laf/issues/539)



# [1.0.0-alpha.0](https://github.com/labring/laf/compare/v0.8.13...v1.0.0-alpha.0) (2022-12-13)


### Bug Fixes

* add logs & fix finalizer deletion logic ([#301](https://github.com/labring/laf/issues/301)) ([fe25ee8](https://github.com/labring/laf/commit/fe25ee8264fd36590953cb1075d1622823b5386f))
* add missing cache control ([#248](https://github.com/labring/laf/issues/248)) ([61bc054](https://github.com/labring/laf/commit/61bc0540cf24e28baadf544acc71caf913a925ba))
* app layout height ([79155a3](https://github.com/labring/laf/commit/79155a304563bdd970526ff671cfed4d5ef65af7))
* cann't open 'view logs' ([#263](https://github.com/labring/laf/issues/263)) ([489152b](https://github.com/labring/laf/commit/489152b35fee558f89c108d342f0c6e26c19d11f))
* code format ([bffff2c](https://github.com/labring/laf/commit/bffff2cd2e01ccc1a6f40a86c2df1e708a16801f))
* **core:** fix app route serviceName and port ([#506](https://github.com/labring/laf/issues/506)) ([72c4182](https://github.com/labring/laf/commit/72c4182d731a68344611f0f3f9ac4af9de4c613c))
* **core:** fix oss cr name of app ([#455](https://github.com/labring/laf/issues/455)) ([5c766d7](https://github.com/labring/laf/commit/5c766d7b31577e247120b60078019a9ecf5286dc))
* **core:** fix oss user namespace error, fix rbac for crd ([#411](https://github.com/labring/laf/issues/411)) ([2040ec4](https://github.com/labring/laf/commit/2040ec42d3c452fa5f927fc733f3fa25c3b9a22c))
* **core:** fix rbac to gateway controller & fix sa config of server charts ([#518](https://github.com/labring/laf/issues/518)) ([0e0fd77](https://github.com/labring/laf/commit/0e0fd779411587d992b32fb40bb7caf46a9f95c9))
* **core:** gateway enable cors ([#525](https://github.com/labring/laf/issues/525)) ([495eb88](https://github.com/labring/laf/commit/495eb883d7fb875523f23b359195625d23987bcd))
* **deploy:** fix [#360](https://github.com/labring/laf/issues/360)  k8s deployment nginx ingress default resovler   ([#364](https://github.com/labring/laf/issues/364) ) ([ae4a26a](https://github.com/labring/laf/commit/ae4a26af5de380b574716298b3de1da464549b5a))
* error of `process is not defined` ([#146](https://github.com/labring/laf/issues/146)) ([8efa257](https://github.com/labring/laf/commit/8efa257007811648718759a0a4cbdc569663c336))
* eslint ([abdf388](https://github.com/labring/laf/commit/abdf388c78e71bd31a42779ea5388226fc5e4a38))
* fix controllers' makefile & docker configs ([022c4ed](https://github.com/labring/laf/commit/022c4ed1dad103584aebcade86391af94a5ec79e))
* Fix problem when click enter app detail in apps page ([#249](https://github.com/labring/laf/issues/249)) ([5680d38](https://github.com/labring/laf/commit/5680d387f1cd505e374691d3a9ea03b7092e48a0))
* JsonEditor add min height & line numbers ([#256](https://github.com/labring/laf/issues/256)) ([1ee5720](https://github.com/labring/laf/commit/1ee5720462bb5f20b5fe5baaeca27056be7caf1a))
* multi event bind [#241](https://github.com/labring/laf/issues/241) ([#255](https://github.com/labring/laf/issues/255)) ([9885f71](https://github.com/labring/laf/commit/9885f716a7db2905d1bcf9606540405dabb927ae))
* **oss:** fix api fields error ([7cfe30e](https://github.com/labring/laf/commit/7cfe30e5ceed7beb9f4b3b90c929e6cd3b5fb97b))
* refactor theme & ui, add prism editor, ([#279](https://github.com/labring/laf/issues/279)) ([57d40f1](https://github.com/labring/laf/commit/57d40f15b48f4d238ad8ad124576046d7d6a416d))
* remove deploy code ([9b5a834](https://github.com/labring/laf/commit/9b5a83420503fbe4659440c293f125ffe25435ea))
* **server:** add region api, fix init image version ([#503](https://github.com/labring/laf/issues/503)) ([91250c0](https://github.com/labring/laf/commit/91250c05702760c4f4c2ac5fb26c460d89094f55))
* **server:** fix app api error, fix dto & entity transform ([d80a8f9](https://github.com/labring/laf/commit/d80a8f9f201542ce0977b6821b658a27ebda09eb))
* **server:** fix create app api & tests; fix deploy docs; ([#413](https://github.com/labring/laf/issues/413)) ([69f04ac](https://github.com/labring/laf/commit/69f04ac7c8cd80276e113a1baffd5e7f1c7f59ee))
* **server:** fix dto validation method, fix cors config ([#446](https://github.com/labring/laf/issues/446)) ([d147a73](https://github.com/labring/laf/commit/d147a73812f74905a0f5b3a4890396cad72596ec))
* **server:** fix error log in server ([#505](https://github.com/labring/laf/issues/505)) ([7eaefd5](https://github.com/labring/laf/commit/7eaefd5c411db5624f96c8583f5c27f5d07f65e4))
* **server:** fix user db schema unique error ([#464](https://github.com/labring/laf/issues/464)) ([ac679c8](https://github.com/labring/laf/commit/ac679c8885d950601b19ff21c1d803ecf0eddf58))
* **server:** improve & fix instance service; fix runtime service ([#495](https://github.com/labring/laf/issues/495)) ([1abe50c](https://github.com/labring/laf/commit/1abe50cb8c596b6853af758ad7e5c33b77c8ee23))
* **web:** add nextjs env viriable & fix next build errors([#517](https://github.com/labring/laf/issues/517)) ([b8122a2](https://github.com/labring/laf/commit/b8122a2a52ba5cadaa72e2401881f556df55275a))
* **web:** build error, change pnpm to npm([#520](https://github.com/labring/laf/issues/520)) ([6dbd5c7](https://github.com/labring/laf/commit/6dbd5c7f8175e3eda729f8f534f25eccb93f9375))


### Features

* add application controllers ([2a1ace7](https://github.com/labring/laf/commit/2a1ace7f89fe5a6d0da26d90b247f6860185928a))
* add controllers ([5c488c8](https://github.com/labring/laf/commit/5c488c8143f3e60d28275fcd733fe5ea3c57e1c6))
* add custom layout ([0642cb5](https://github.com/labring/laf/commit/0642cb5b7af7240afc76a6de97e3258e3ce97e32))
* add filter ([60e48d3](https://github.com/labring/laf/commit/60e48d32e3075fd27097205f1d974f2c50a6fd0c))
* add function create ([1ec4d0c](https://github.com/labring/laf/commit/1ec4d0ca7eeff41798e8b121067e2c14e3f500ad))
* add function page ([66a5015](https://github.com/labring/laf/commit/66a501597b7a3d0ad769d7707d15be5a0d1f096f))
* add function panel ([fe68b29](https://github.com/labring/laf/commit/fe68b2976d7f8a378339336ad1a798b2df73c62d))
* add go workspace and move containsString to pkg/util ([#300](https://github.com/labring/laf/issues/300)) ([88bae41](https://github.com/labring/laf/commit/88bae41e74c9de95edbc56d5b5860629201a66b7))
* add monaco editor ([16a058f](https://github.com/labring/laf/commit/16a058fdcaf76bf962338b2eea5ca662d1faf91b))
* add more app status process for release action ([#251](https://github.com/labring/laf/issues/251)) ([dfed3e5](https://github.com/labring/laf/commit/dfed3e56d05e54c55bbb9a8f2d3d482fe6e6a63e))
* add multitab layout ([#237](https://github.com/labring/laf/issues/237)) ([fd59030](https://github.com/labring/laf/commit/fd590301541049f2395a2185d0579ce694329f62))
* add new function modal ([03a90db](https://github.com/labring/laf/commit/03a90db4439cfa3cf1b6819d3fac40f7b015952a))
* App side menus ([#157](https://github.com/labring/laf/issues/157)) ([0022283](https://github.com/labring/laf/commit/0022283326be5d9cf6b385789f1907d2a6f2062f))
* **app:** add app, func, runtime, spec crd design ([#296](https://github.com/labring/laf/issues/296)) ([08c3bd7](https://github.com/labring/laf/commit/08c3bd7377b6427c9685f7579e9e95a7d194a731))
* **app:** impl creation form crd, update app crds ([#317](https://github.com/labring/laf/issues/317)) ([802aa0e](https://github.com/labring/laf/commit/802aa0e025cccc7b1660b918d280d718ebd80698))
* **app:** impl main login of app controller ([#350](https://github.com/labring/laf/issues/350)) ([821e875](https://github.com/labring/laf/commit/821e875801d9f03dbb872f8c38fab9a726dfcbc2))
* **app:** impl part of app controller ([#322](https://github.com/labring/laf/issues/322)) ([00e434d](https://github.com/labring/laf/commit/00e434dd37e6508f82efb7bd9e9d65f68584be7f))
* **app:** impl the app resources creation logic in controller ([#351](https://github.com/labring/laf/issues/351)) ([501a62a](https://github.com/labring/laf/commit/501a62a3994cd0fb071146e26da27c193281f15c))
* **core:** enable websocket in app gateway ([#508](https://github.com/labring/laf/issues/508)) ([2e80e39](https://github.com/labring/laf/commit/2e80e39f9532aa34e848ea8898152c0c6c42ca74))
* **core:** instance add instance bundler ossuer runtime ([#449](https://github.com/labring/laf/issues/449)) ([894c57b](https://github.com/labring/laf/commit/894c57bbb2d5fdf69dbe3a1074a70bc3d836c6d0))
* **core:** refresh apisix ssl ([#513](https://github.com/labring/laf/issues/513)) ([8baaae5](https://github.com/labring/laf/commit/8baaae5313a50789a9d888ce62b5d5672db7bc5f))
* **core:** support gateway ssl ([#507](https://github.com/labring/laf/issues/507)) ([cec9454](https://github.com/labring/laf/commit/cec94542e25e334091db7f509b90036a745a743d))
* **db:** impl database controller ([e6a6436](https://github.com/labring/laf/commit/e6a643686cb7090d0d0ce5e0a4e591262e441d03))
* **doc:** refact entity & interfaces to support swagger struct ([#426](https://github.com/labring/laf/issues/426)) ([4d56e64](https://github.com/labring/laf/commit/4d56e6421bd6791d96db4f7355ce3a5163c3ee08))
* **gateway:** add gateway crds ([#295](https://github.com/labring/laf/issues/295)) ([9a1133f](https://github.com/labring/laf/commit/9a1133f9de3374b31fb955e05e19e8fd621728f7))
* **gateway:** add gateway e2e test ([#343](https://github.com/labring/laf/issues/343)) ([e823060](https://github.com/labring/laf/commit/e8230602c352184bfbeff650abf89dd48b2b36bf))
* **gateway:** impl basic functions of route ([#309](https://github.com/labring/laf/issues/309)) ([1dcd72a](https://github.com/labring/laf/commit/1dcd72a5211b000077e2594bc4c1af878f2c1cbe))
* **gateway:** impl gateway crd and opt route&domain crd ([#313](https://github.com/labring/laf/issues/313)) ([b3cb361](https://github.com/labring/laf/commit/b3cb361fdb677acad3c1ef0a8370b8973ee5d4b2))
* **gateway:** opt controller ([#318](https://github.com/labring/laf/issues/318)) ([f105553](https://github.com/labring/laf/commit/f1055533ceb279ce8bb2ab6bdc6b84e2ad751623))
* i18n for password change ([#151](https://github.com/labring/laf/issues/151)) ([23ed016](https://github.com/labring/laf/commit/23ed0166164b358ed5dd69fbaa8592ea18203def))
* i18n support for document title ([#148](https://github.com/labring/laf/issues/148)) ([f505503](https://github.com/labring/laf/commit/f505503823bee5f1391aee7ebbc6180966f479b7))
* i18n update ([#132](https://github.com/labring/laf/issues/132)) ([68b5d0b](https://github.com/labring/laf/commit/68b5d0b8b8a56b29b65d5720702408667c867ea5))
* language detect and save ([#139](https://github.com/labring/laf/issues/139)) ([529fc3d](https://github.com/labring/laf/commit/529fc3de0fcec988f746b310cd815a8de2ce2bfd))
* next web init, nextjs 12 ([0fb3ab8](https://github.com/labring/laf/commit/0fb3ab838f764f952fec80eb7e356afc31f2128f))
* **oss & tests:** update oss crd & add oss tests ([#339](https://github.com/labring/laf/issues/339)) ([dde917a](https://github.com/labring/laf/commit/dde917a9abc6cbb8ff0f0088a90ac63c1269ab4d))
* **oss:** add bucket crd ([cc0c982](https://github.com/labring/laf/commit/cc0c9824e9391781ca5980b1e4829bc8d7219cb9))
* **oss:** add oss api(store & user CRD) ([061db8a](https://github.com/labring/laf/commit/061db8ab501fc882769ba8f193541904b2f10c22))
* **oss:** impl deletions logic for bucket ([#308](https://github.com/labring/laf/issues/308)) ([9c669a9](https://github.com/labring/laf/commit/9c669a91582d95b2d1704641a913d8f5c05165fb))
* **oss:** impl oss store, user, bucket controllers ([#306](https://github.com/labring/laf/issues/306)) ([d854642](https://github.com/labring/laf/commit/d854642759b07e1a4d61b70495c3431201c98114))
* **runtime:** extract & design runtime mod from app mod. ([#311](https://github.com/labring/laf/issues/311)) ([ab8c969](https://github.com/labring/laf/commit/ab8c969add1d4c7a4b44778ffcadd8f2df7ad587))
* **runtime:** impl function crd ([#365](https://github.com/labring/laf/issues/365)) ([f816b05](https://github.com/labring/laf/commit/f816b05061eb2f0c88484ef20efc278dfe2702b9))
* **runtime:** upgrade app runtime for v1.0.alpha ([aa0e4f7](https://github.com/labring/laf/commit/aa0e4f7fa9f481c903a74995e40c15cc11ba26b6))
* **server:** add app auth guard & crd interfaces ([36971fd](https://github.com/labring/laf/commit/36971fd9ddebf68e83f389358f2e7f9dd75005fd))
* **server:** add app task service; fix func invoke in runtime ([#497](https://github.com/labring/laf/issues/497)) ([47edca6](https://github.com/labring/laf/commit/47edca6ddf78903165db7cd73e602beedad7fe15))
* **server:** add auth module & jwt auth guard ([7ca4807](https://github.com/labring/laf/commit/7ca48075ed9f85839b509a625186847662cb8b4d))
* **server:** add bucket gateway management in server ([#531](https://github.com/labring/laf/issues/531)) ([8f27740](https://github.com/labring/laf/commit/8f27740e16814da144bc518e132a930996139fe2))
* **server:** add databa management proxy api ([#530](https://github.com/labring/laf/issues/530)) ([53dad1a](https://github.com/labring/laf/commit/53dad1af19b14bba96792d26306bcb1d5f75dbc3))
* **server:** add func db design, turn pg to mongo ([#454](https://github.com/labring/laf/issues/454)) ([12b1587](https://github.com/labring/laf/commit/12b15870878cb335273da06c2f75c0da7e0e13db))
* **server:** add function debug token api ([#527](https://github.com/labring/laf/issues/527)) ([a3432f3](https://github.com/labring/laf/commit/a3432f36363e1442c2110ace977d28aaf2f9161f))
* **server:** add initializer module for init sys db ([#473](https://github.com/labring/laf/issues/473)) ([b547f34](https://github.com/labring/laf/commit/b547f346c9b1653e02bcf8cd4e7f3a551498ea6a))
* **server:** add k8s patch method to k8s service ([#430](https://github.com/labring/laf/issues/430)) ([ad79951](https://github.com/labring/laf/commit/ad799515f4c7af9916514cfe5c47325610aef755))
* **server:** add oss sts api ([#519](https://github.com/labring/laf/issues/519)) ([3417159](https://github.com/labring/laf/commit/3417159d6092a454003685aeff18099e533d6ce2))
* **server:** add prisma & user module ([fca199c](https://github.com/labring/laf/commit/fca199c3a0395e7a1661cae6d63802f8b8fd3e0a))
* **server:** complete laf server auth api. ([#421](https://github.com/labring/laf/issues/421)) ([fd4923f](https://github.com/labring/laf/commit/fd4923fe59ca8327cf4a71268cd04980ed5e484f))
* **server:** impl add app api ([5877439](https://github.com/labring/laf/commit/58774391e10fa47f8d36260ee80f95c228e85efe))
* **server:** impl application query api ([#423](https://github.com/labring/laf/issues/423)) ([bb8df68](https://github.com/labring/laf/commit/bb8df68c36817c1157eeb8b340daddfbcc8651b7))
* **server:** impl application update & deletion APIs ([#440](https://github.com/labring/laf/issues/440)) ([a5f2481](https://github.com/labring/laf/commit/a5f248150135323b27e9bbd7ffcdf8dc83040608))
* **server:** impl auth api with casdoor ([#405](https://github.com/labring/laf/issues/405)) ([f3e3f82](https://github.com/labring/laf/commit/f3e3f822a235762b911f57de2c1faa7ac1e9e4de))
* **server:** impl bucket creation api ([a9790a7](https://github.com/labring/laf/commit/a9790a7a944b9b90a19e37e0508c3bac5f6298de))
* **server:** impl bundle & runtime list api ([#453](https://github.com/labring/laf/issues/453)) ([4dae4da](https://github.com/labring/laf/commit/4dae4da3f4ff161046da84ae5b8a7264c591dc12))
* **server:** impl cloud function update & deletetion apis ([#451](https://github.com/labring/laf/issues/451)) ([f297002](https://github.com/labring/laf/commit/f2970020c0c33d9802942c4105cec27f03fbf20a))
* **server:** impl collection query, update, delete; ([#432](https://github.com/labring/laf/issues/432)) ([0ac336f](https://github.com/labring/laf/commit/0ac336f7ee6d434fc7ba7a8b8e3522477e0b10b6))
* **server:** implement & reafct app apis with server db ([#462](https://github.com/labring/laf/issues/462)) ([d960382](https://github.com/labring/laf/commit/d9603821b1042eea5e157af19710941ecd4b130b))
* **server:** implement bucket update & deletion apis ([#447](https://github.com/labring/laf/issues/447)) ([3525d7e](https://github.com/labring/laf/commit/3525d7efcf7a7af5dbe91f7f19389a625448dafe))
* **server:** implement buckuet query apis ([#425](https://github.com/labring/laf/issues/425)) ([b4df288](https://github.com/labring/laf/commit/b4df2882c6010a1f063ada4603e394266687fd37))
* **server:** implement collection creation api. ([#431](https://github.com/labring/laf/issues/431)) ([6d98a4f](https://github.com/labring/laf/commit/6d98a4fc6c6594a76b966c5aaddc55507419afee))
* **server:** implement function creation ([#427](https://github.com/labring/laf/issues/427)) ([9759453](https://github.com/labring/laf/commit/97594538a3af75a5efc217c7e3920953ef45e600))
* **server:** implement function query apis ([#429](https://github.com/labring/laf/issues/429)) ([c0f04e1](https://github.com/labring/laf/commit/c0f04e12ec33d12acd8f497be692805cea71631f))
* **server:** implement instance manage in server ([#494](https://github.com/labring/laf/issues/494)) ([7cf8694](https://github.com/labring/laf/commit/7cf8694af6c2b3587cdca4f01838c8bbd87046a0))
* **server:** reafct cloud functions' apis in db ([#472](https://github.com/labring/laf/issues/472)) ([dc518c8](https://github.com/labring/laf/commit/dc518c8d5d935598697bdbdf6b93bd04f415f0c7))
* **tests:** add template render ([#337](https://github.com/labring/laf/issues/337)) ([9e31d2d](https://github.com/labring/laf/commit/9e31d2d36fef8c9b39f63143351edf6c8e4633a5))
* update controllers ([#288](https://github.com/labring/laf/issues/288)) ([294d98a](https://github.com/labring/laf/commit/294d98a6779243e9f5b248a49b3fa59f33e04366))
* web storage page ([#418](https://github.com/labring/laf/issues/418)) ([261ebfb](https://github.com/labring/laf/commit/261ebfbab453cefab36ce6678815595682e646a1))
* **web:** add function editor theme, json editor, app model ([8ffecbf](https://github.com/labring/laf/commit/8ffecbfb5966904568f85babecbc20b37fb6ddf2))
* **web:** finish application page  ([#452](https://github.com/labring/laf/issues/452)) ([a3aebfd](https://github.com/labring/laf/commit/a3aebfd85534ac25d334907debd191f402fafaab))
* **web:** impl login  callback ([#442](https://github.com/labring/laf/issues/442)) ([ff64a8f](https://github.com/labring/laf/commit/ff64a8f1653a9d41874040bb1072b5a6bf56715a))


### Reverts

* Revert "refactor: #235 move debug panel to outside  (#239)" (#245) ([16c40c0](https://github.com/labring/laf/commit/16c40c089c9f77aba8d14f797afd7d811bfe22ed)), closes [#235](https://github.com/labring/laf/issues/235) [#239](https://github.com/labring/laf/issues/239) [#245](https://github.com/labring/laf/issues/245)



## [0.8.13](https://github.com/labring/laf/compare/v0.8.12...v0.8.13) (2022-09-23)


### Bug Fixes

* **client-sdk:** fix error of last commit:hack `process` ([85d39cd](https://github.com/labring/laf/commit/85d39cdfd3a402ab6b9f38cf5cb86b50da10902c))



## [0.8.12](https://github.com/labring/laf/compare/v0.8.11...v0.8.12) (2022-09-22)


### Bug Fixes

* **client-sdk:** fix wx `process` hack ([fd55af9](https://github.com/labring/laf/commit/fd55af9df6257632a4e9a497b8ab2e0bf216c210))
* **client-sdk:** hack for `process` missing for wechat miniprogram ([36002b1](https://github.com/labring/laf/commit/36002b1bd5065843c3ddaf33723c47449e899624))



## [0.8.11](https://github.com/labring/laf/compare/v0.8.10...v0.8.11) (2022-09-16)


### Features

* **app:** add xml parser to req ([198027c](https://github.com/labring/laf/commit/198027c5e95515b435fb72d12985a4c9b7e62a94))



## [0.8.10](https://github.com/labring/laf/compare/v0.8.9...v0.8.10) (2022-09-14)


### Features

* **runtime:** add request param to func context ([#290](https://github.com/labring/laf/issues/290)) ([c7865be](https://github.com/labring/laf/commit/c7865bed987fa83fef1d3680b0c560d3bd0c1126))



## [0.8.9](https://github.com/labring/laf/compare/v0.8.8...v0.8.9) (2022-09-13)


### Bug Fixes

* **instance:** fix app env of oss external endpoint port ([750a4d4](https://github.com/labring/laf/commit/750a4d4e48bbf5da1fdc4f658eeab0e30edc2263))



## [0.8.8](https://github.com/labring/laf/compare/v0.8.7...v0.8.8) (2022-09-13)


### Bug Fixes

* **deploy:** fix oss external endpoint config format ([543fe9a](https://github.com/labring/laf/commit/543fe9a42c5d1f4f8fe87da48cd680182fce53b8))



## [0.8.7](https://github.com/labring/laf/compare/v0.8.7-alpha.3...v0.8.7) (2022-09-12)


### Bug Fixes

* **client:** fix the regex of function id ([6519c95](https://github.com/labring/laf/commit/6519c951257a1b1bb1650e2119247f8947005e8b))
* fix missing of console.warn/debug/info ([#289](https://github.com/labring/laf/issues/289)) ([2c2d4ba](https://github.com/labring/laf/commit/2c2d4baecf97db1ee888e3e088b81d79e032bf41))
* k8s startup time; add extra pkg in app-service; fix deploy scripts ([679d2b4](https://github.com/labring/laf/commit/679d2b40800ca24effc03b65aa179a67dfda2274))



## [0.8.7-alpha.3](https://github.com/labring/laf/compare/v0.8.7-alpha.2...v0.8.7-alpha.3) (2022-08-23)


### Features

* opt ssl create and code style ([#282](https://github.com/labring/laf/issues/282)) ([f118412](https://github.com/labring/laf/commit/f118412c422acc0a85fe4f07163a0422af38255a))



## [0.8.7-alpha.2](https://github.com/labring/laf/compare/v0.8.7-alpha.1...v0.8.7-alpha.2) (2022-08-17)


### Features

* enable bucket versioning ([#270](https://github.com/labring/laf/issues/270)) ([f7c3efd](https://github.com/labring/laf/commit/f7c3efdf95afe4775348a4d0e30c6d357e01e939))
* opt schema and port config ([#267](https://github.com/labring/laf/issues/267)) ([59a15c7](https://github.com/labring/laf/commit/59a15c79c4c8abeec07706ae2f5f11056657a5aa))



## [0.8.7-alpha.1](https://github.com/labring/laf/compare/v0.8.7-alpha.0...v0.8.7-alpha.1) (2022-08-12)



## [0.8.7-alpha.0](https://github.com/labring/laf/compare/v0.8.6...v0.8.7-alpha.0) (2022-08-10)


### Bug Fixes

* **deploy:** fix docker deploy error in apple m1 ([54b1d46](https://github.com/labring/laf/commit/54b1d4697512d0583379831377afbc21fe7c0aca))
* fix create system app error ([#240](https://github.com/labring/laf/issues/240)) ([25bef9e](https://github.com/labring/laf/commit/25bef9ed55663e16bdb8836c7f871500167417f6))
* fix use ssl route ([#238](https://github.com/labring/laf/issues/238)) ([1228f76](https://github.com/labring/laf/commit/1228f76fb9210377e34cd52cfa2a5a5520b62f6b))



## [0.8.6](https://github.com/labring/laf/compare/v0.8.5...v0.8.6) (2022-08-08)


### Bug Fixes

* fix route priority ([#155](https://github.com/labring/laf/issues/155)) ([9ad2c58](https://github.com/labring/laf/commit/9ad2c58780a55330e0808da2b8ad0ef545fa3cd8))


### Features

* add ssl support ([#179](https://github.com/labring/laf/issues/179)) ([1bac7f0](https://github.com/labring/laf/commit/1bac7f04f06b4d68a9a19b874d56584d829baee5))
* feat website domain ([#156](https://github.com/labring/laf/issues/156)) ([2b3a578](https://github.com/labring/laf/commit/2b3a578cbd49e8a0521c690e32e6d3448b5f5458))
* **gateway:** add cors and websocket ([#142](https://github.com/labring/laf/issues/142)) ([fa8dfe0](https://github.com/labring/laf/commit/fa8dfe0d90b353b69034dd0266d706d06013638f))
* **gateway:** add cors and websocket ([#142](https://github.com/labring/laf/issues/142)) ([4c289a9](https://github.com/labring/laf/commit/4c289a99882008f636107634272aa8c30c8114d7))
* init gateway controller ([#133](https://github.com/labring/laf/issues/133)) ([0e27b70](https://github.com/labring/laf/commit/0e27b70028325b881248292d02159e493e0687d0))
* init gateway controller ([#133](https://github.com/labring/laf/issues/133)) ([b7ca2f7](https://github.com/labring/laf/commit/b7ca2f750138a68fa471055f881e018a8e01aadf))
* support website custom domain ([#138](https://github.com/labring/laf/issues/138)) ([1b2b382](https://github.com/labring/laf/commit/1b2b38275e50ef8143f06103390024b9f18251da))
* support website custom domain ([#138](https://github.com/labring/laf/issues/138)) ([e2c7196](https://github.com/labring/laf/commit/e2c7196f58d46a12330d93bdf645e7049a98206b))



## [0.8.5](https://github.com/labring/laf/compare/v0.8.5-alpha.0...v0.8.5) (2022-07-29)


### Bug Fixes

* **cli:** fix path sep error in win, add docs, fix code styles ([5c944e8](https://github.com/labring/laf/commit/5c944e87308d2c91a1ac2d714dd9014202c9e92e))
* **cli:** fix templates dir path error ([c41c1a2](https://github.com/labring/laf/commit/c41c1a2afafba0da4eb5b6cf2e21fe6e029aa010))



## [0.8.5-alpha.0](https://github.com/labring/laf/compare/v0.8.4...v0.8.5-alpha.0) (2022-07-29)


### Bug Fixes

* fix cli pkg error; ([cbebbcc](https://github.com/labring/laf/commit/cbebbcc6bf80ffe147900c788573a4e7f8cc0781))
* page route ([#197](https://github.com/labring/laf/issues/197)) ([4be3f90](https://github.com/labring/laf/commit/4be3f90e11a8ddcc77fd602608b09a29c7674c26))


### Features

* add account sign up mode config ([#172](https://github.com/labring/laf/issues/172)) ([#181](https://github.com/labring/laf/issues/181)) ([60195b2](https://github.com/labring/laf/commit/60195b2a12414b10e7f7c586c07e125353eef124))
* add cli package; ([fb356cc](https://github.com/labring/laf/commit/fb356cc6af031ad2fab108779b927b18065c49de))
* **cli:** add oss/server command ([#154](https://github.com/labring/laf/issues/154)) ([65cb7a7](https://github.com/labring/laf/commit/65cb7a7c438f5cdd72d2fda2eff6e676162b9b8e))
* validate old password before updating password ([#152](https://github.com/labring/laf/issues/152)) ([2f2e84e](https://github.com/labring/laf/commit/2f2e84e3c278d4aa3319bcd1493c0640780f2817))



## [0.8.4](https://github.com/labring/laf/compare/v0.8.3...v0.8.4) (2022-06-09)


### Bug Fixes

* **sys:** fix [#108](https://github.com/labring/laf/issues/108) ([c6bfc5a](https://github.com/labring/laf/commit/c6bfc5a104a2a6a6a1f7f6b1cb527b8a66bedeb1))


### Features

* **app-service:** add node-fetch package & remove cross-fetch pkg; ([81b926b](https://github.com/labring/laf/commit/81b926b67853437349f3b3aa30f49fbb37ef670f))
* **app-service:** support global fetch in function; ([67f03a2](https://github.com/labring/laf/commit/67f03a2835b94be987a9dbfcef7f50963bddab8b))



## [0.8.3](https://github.com/labring/laf/compare/v0.8.2...v0.8.3) (2022-06-07)


### Features

* **app-service:** support global in cloud functions ([5faf2ff](https://github.com/labring/laf/commit/5faf2ffa2b24db1cb1b5cc96f7c58d43d4552cd0))



## [0.8.2](https://github.com/labring/laf/compare/v0.8.1...v0.8.2) (2022-06-06)


### Bug Fixes

* **app-service:**  fix security risk for expose process.env ([d3004b3](https://github.com/labring/laf/commit/d3004b33e27713ff26f28a6069b8f3b4f29d49f3))
* **app-service:** fix bug in cloud-sdk path; ([f8df39b](https://github.com/labring/laf/commit/f8df39b5908900a26cf2a7339ed4729f7820c0f3))



## [0.8.1](https://github.com/labring/laf/compare/v0.8.0...v0.8.1) (2022-06-06)


### Features

* add auto build & push docker images by github actions ([#122](https://github.com/labring/laf/issues/122)) ([fe313b3](https://github.com/labring/laf/commit/fe313b383679c256a8858f39f49f3efc4cb2d72e))
* **deploy:** use nip.io domain instead of local-dev.host ([8bd2abc](https://github.com/labring/laf/commit/8bd2abcccbda59cefeb30f6cbc49eaf48b181e89))
* full bucket name ([#125](https://github.com/labring/laf/issues/125)) ([62dacc5](https://github.com/labring/laf/commit/62dacc551d888afbcde29859562efa3acbb422c3))



# [0.8.0](https://github.com/labring/laf/compare/v0.8.0-alpha.11...v0.8.0) (2022-05-27)


### Bug Fixes

* **app-console:** fix create function label validation fail ([7c67328](https://github.com/labring/laf/commit/7c67328035ec44bba5329e61bda3381356b8dc59))
* **rbac:** fix check permission error, add actions for pkgs; ([bf772d2](https://github.com/labring/laf/commit/bf772d2c2fdde7a101faf60569109b677ec8d582))


### Features

* **app-console:** fix collections list height ([#114](https://github.com/labring/laf/issues/114) [#109](https://github.com/labring/laf/issues/109)) ([562b0e4](https://github.com/labring/laf/commit/562b0e4239a985540c58024efcfc8a5ba866fccd))
* **app-service:** support default cloud function ([#117](https://github.com/labring/laf/issues/117) [#115](https://github.com/labring/laf/issues/115)) ([04b7320](https://github.com/labring/laf/commit/04b73209bfdbf77afeceda9ab80eed5e4497ea9b))
* opt index app_id format ([#102](https://github.com/labring/laf/issues/102)) ([28f9c3c](https://github.com/labring/laf/commit/28f9c3ce7e2d9c9f08ea8318a42019aa5a75abe9))
* **rbac:** refact rbac support more groups(roles) ([a1e28ea](https://github.com/labring/laf/commit/a1e28ea7b343664f9d4430cbbd75931c53327213))



# [0.8.0-alpha.11](https://github.com/labring/laf/compare/v0.8.0-alpha.10...v0.8.0-alpha.11) (2022-05-16)


### Bug Fixes

* **sys:** fix [#96](https://github.com/labring/laf/issues/96) ([95e2df6](https://github.com/labring/laf/commit/95e2df63760711c9e51de63c2174941d52a84ab7))



# [0.8.0-alpha.10](https://github.com/labring/laf/compare/v0.8.0-alpha.9...v0.8.0-alpha.10) (2022-05-16)


### Bug Fixes

* **instance controller:** fix req_mem error ([d8c0042](https://github.com/labring/laf/commit/d8c00428d87ac774fdae398909cf7b4c45d1a567))



# [0.8.0-alpha.9](https://github.com/labring/laf/compare/v0.8.0-alpha.8...v0.8.0-alpha.9) (2022-05-15)


### Bug Fixes

* **client:** fix log in word ([#83](https://github.com/labring/laf/issues/83)) ([2d93e51](https://github.com/labring/laf/commit/2d93e517999a9a4df26026ba918175997b70fdd1))
* fix init error while db not ready ([5ed4fec](https://github.com/labring/laf/commit/5ed4fecc95f3016e7f35b147eb0445ce7c6e213b))
* fix website domain bind error; ([441970b](https://github.com/labring/laf/commit/441970baf6ccab877b87ee0eb40519561cf7f6cb))
* **website:** turn website domain to array; ([e51993a](https://github.com/labring/laf/commit/e51993aa7f15ad6d88cb028482745fbbb0f9070f))



# [0.8.0-alpha.8](https://github.com/labring/laf/compare/v0.8.0-alpha.7...v0.8.0-alpha.8) (2022-05-08)


### Features

* **oss:** impl oss service account ([#80](https://github.com/labring/laf/issues/80) [#76](https://github.com/labring/laf/issues/76)) ([2ec8f9f](https://github.com/labring/laf/commit/2ec8f9f8e8f426a9723e1cae46ec229111026f2d))



# [0.8.0-alpha.7](https://github.com/labring/laf/compare/v0.8.0-alpha.6...v0.8.0-alpha.7) (2022-05-07)



# [0.8.0-alpha.6](https://github.com/labring/laf/compare/v0.8.0-alpha.5...v0.8.0-alpha.6) (2022-05-06)


### Bug Fixes

* **app-console:** fix restart old api [#72](https://github.com/labring/laf/issues/72) ([bfd49c4](https://github.com/labring/laf/commit/bfd49c471d5ad621caa2a247badd0a88e859b2a0))
* **logo:** fix logo url; ([66448c4](https://github.com/labring/laf/commit/66448c49536c24a27c9429d3f100e53a9295ebbc))
* **replicate:** Fix bug. replicate permission error ([#77](https://github.com/labring/laf/issues/77)) ([cbd829d](https://github.com/labring/laf/commit/cbd829d11e979289bba3f5c58ead2f1b6229d043))



# [0.8.0-alpha.5](https://github.com/labring/laf/compare/v0.8.0-alpha.4...v0.8.0-alpha.5) (2022-05-05)


### Bug Fixes

* **app-service:** fix db import error while building; ([070114e](https://github.com/labring/laf/commit/070114e2eec2728d604b62648cbf8093d0e057f9))



# [0.8.0-alpha.4](https://github.com/labring/laf/compare/v0.8.0-alpha.3...v0.8.0-alpha.4) (2022-05-04)


### Bug Fixes

* **app-service:** fix import path error; ([d546499](https://github.com/labring/laf/commit/d546499c6a43d55fd069193953a155ed0e699f5f))



# [0.8.0-alpha.3](https://github.com/labring/laf/compare/v0.8.0-alpha.2...v0.8.0-alpha.3) (2022-05-03)


### Bug Fixes

* **sys:** process bucket name & mode for old version compatibility ([6846ede](https://github.com/labring/laf/commit/6846ede60ba8443e19d0c640734103744dd6c127))



# [0.8.0-alpha.2](https://github.com/labring/laf/compare/v0.8.0-alpha.1...v0.8.0-alpha.2) (2022-05-03)


### Bug Fixes

* support waiting db connection; ([e99c312](https://github.com/labring/laf/commit/e99c312d6b09dd1d4a7340b8980ba19cc78b70c0))



# [0.8.0-alpha.1](https://github.com/labring/laf/compare/v0.8.0-alpha.0...v0.8.0-alpha.1) (2022-05-03)


### Bug Fixes

* add new status for joined apps; ([768cf95](https://github.com/labring/laf/commit/768cf9516d515cf40bc3b9454c922eb63c2c2636))



# [0.8.0-alpha.0](https://github.com/labring/laf/compare/v0.7.11...v0.8.0-alpha.0) (2022-05-02)


### Bug Fixes

* **app-console:** switch collection get page 1 ([2fa4cbb](https://github.com/labring/laf/commit/2fa4cbb27693bfa69e8f471485e001004b28004b))
* **app-console:** upload file path fix ([6375e0b](https://github.com/labring/laf/commit/6375e0b20517b8b4f38a5bcc175a21f1d0944cce))
* **app-service:** change debug-token to bearer token; ([d4901f1](https://github.com/labring/laf/commit/d4901f19e9b40ba356c350b02c5426ec076900a3))
* fix app-service script error ([fc22342](https://github.com/labring/laf/commit/fc223428525d3bfdbde5ee3f87b0406c119e7fa3))
* front-end lint fix ([6a44a71](https://github.com/labring/laf/commit/6a44a719f9c584d9f2ab4f18a8f38417b8251d2a))
* **gateway:** fix oss.conf error; ([e8639b0](https://github.com/labring/laf/commit/e8639b05e9ae1a89607a91a40d3cceb5f5a7685a))
* impl restart api & update sys client; ([3ba23bb](https://github.com/labring/laf/commit/3ba23bbce9eebb13101d378487901cb4841fad7d))
* **oss:** fix error of setBucketPolicy api; ([8b5a2f0](https://github.com/labring/laf/commit/8b5a2f04a0c7ccec09d3f215d36af9ca360de0a1))
* **oss:** fix error of setBucketPolicy api; ([bee61bd](https://github.com/labring/laf/commit/bee61bda08470983087088e5f1ab953629f3ca2c))
* **oss:** fix oss api error; ([0fe8c90](https://github.com/labring/laf/commit/0fe8c90ddc3f038ceee9957dd71f1e4ddc10569a))
* **oss:** fix oss api error; ([07c87e8](https://github.com/labring/laf/commit/07c87e821f970a611fd4d35f065d5611083155fb))
* **oss:** folder name rule fix ([d8925a2](https://github.com/labring/laf/commit/d8925a232741a326ee3388d5994f0c6365eafb09))
* **oss:** upload folder; ([f946885](https://github.com/labring/laf/commit/f94688514ec93f572178f2d7acd9382245b54849))
* remove /healthz log in app service ([c2b0bc6](https://github.com/labring/laf/commit/c2b0bc6ebc7b7ded53e3102c85ca0b99ccd4f78e))
* **replicate:** Fix. db instance import bug ([1d67b05](https://github.com/labring/laf/commit/1d67b050a08542e579e6d193fe61635205a2e08e))
* **replicate:** Fix. db instance import bug ([3a9a6e2](https://github.com/labring/laf/commit/3a9a6e2b6b120a507108d01d8acf7a5d06dcd34f))
* **replicate:** Fix. replicates appid bug ([b53f39c](https://github.com/labring/laf/commit/b53f39c12d1dc5a25e59fa9c124706e67de40feb))
* **sys:** fix /health-check -> /healthz ([3ebeee1](https://github.com/labring/laf/commit/3ebeee1a692a710f961433148f720b0f634fa69f))
* **sys:** fix oss sts config; ([3a15d32](https://github.com/labring/laf/commit/3a15d32beb61c96c00feaab873de82b4ff69d7e3))


### Features

* **app-console:** replace bucket fs api with oss ([3286322](https://github.com/labring/laf/commit/328632266e3c19305e0cdd65d3cb9be1c40fd326))
* **app-console:** update bucket add quota param ([954f9b3](https://github.com/labring/laf/commit/954f9b3f54886fcfd83034c14ff337de13208e66))
* **app-service:** add oss config & packages; ([1b8ff91](https://github.com/labring/laf/commit/1b8ff913c0bbf36c91b7ba0a6943fc2f1c272a2e))
* **app-spec:** impl app-spec on app createing. ([8c05fa6](https://github.com/labring/laf/commit/8c05fa6804940dfd625fbe81df1c3ca2f1920a2c))
* bucket show sencondary url; move replicas dialog to auth page;setInterval with getApplications; ([68aa451](https://github.com/labring/laf/commit/68aa451c9e39cf331e1c4a69859d057c359ef473))
* complete the design of instance constroller ([3caa044](https://github.com/labring/laf/commit/3caa044c2539e26518390c16d261b5bc77cf0de6))
* **gateway:** add oss conf in gateway; ([b2151c0](https://github.com/labring/laf/commit/b2151c0f9e214dc51d4380b286c1b46749432459))
* **gateway:** add oss conf in gateway; ([c9b089f](https://github.com/labring/laf/commit/c9b089f3be4d920403af7db8c52184332180c0a2))
* impl instance controller sevice; ([ddb03f0](https://github.com/labring/laf/commit/ddb03f0b052a1bb9e4f44c15f53320702b1aee4b))
* **ingress:** use k8s ingress replace nginx gateway; ([463ea11](https://github.com/labring/laf/commit/463ea1115f8e9849dd5af4646bd7abb59e288b98))
* **oss:** add bucket quota; ([2918104](https://github.com/labring/laf/commit/291810401e185a08af7f4245a13a07755a641566))
* **oss:** add bucket stats api in oss ([eaba65e](https://github.com/labring/laf/commit/eaba65eff0a6c50ff30d32b06023afdf7b558252))
* **oss:** add minio api in system-service; ([cb86567](https://github.com/labring/laf/commit/cb865679f0070ae240252b564e464debfe7351f8))
* **oss:** add minio api in system-service; ([6225641](https://github.com/labring/laf/commit/62256413f20c07f63ccbcb6ca1f1d259ba0d4dca))
* **oss:** create bucket add quota param ([61da895](https://github.com/labring/laf/commit/61da8955bc0259d0c2b4743b9b1c90fbb7391ea7))
* **oss:** create oss user for app; ([c33d7e2](https://github.com/labring/laf/commit/c33d7e276512d2dd98131031d83eab1ccd168e53))
* **oss:** create oss user for app; ([caf2b37](https://github.com/labring/laf/commit/caf2b372838a27fbb4ebedf6c979f64fd72a5f03))
* **oss:** impl file delete;fix bucket name rule; ([5d4f1b2](https://github.com/labring/laf/commit/5d4f1b2dd154cfe49f479cb42ac4b61939197966))
* **oss:** impl oss external bucket url; ([4a43aa5](https://github.com/labring/laf/commit/4a43aa58658f028cbf0c7e287bb2197738ce4b39))
* **oss:** impl oss files(upload/list); ([f1136c1](https://github.com/labring/laf/commit/f1136c1eb2ba1992e7ec949c5baaac39086e37d2))
* **oss:** support upload folder ([a2049fb](https://github.com/labring/laf/commit/a2049fbad984c3698e209ba6254e4039ede9888f))
* **replicate:** Feat. Impl replicate_requests page query and create ([8277ac1](https://github.com/labring/laf/commit/8277ac1aa5f28f6d65d7963274cbe8e12a7cd652))
* **replicate:** Impl put replicas ([01dca0b](https://github.com/labring/laf/commit/01dca0b56c760b8fd038ced83c1ce81842b316aa))
* **replicate:** impl replicate request ([0f6e3b0](https://github.com/labring/laf/commit/0f6e3b045aba37ce3b8c8627c3f35b5415bf62c9))
* **replicate:** impl replicate_auth page ([6f24b70](https://github.com/labring/laf/commit/6f24b702e3948ebad1ae7618e46560461298596c))
* support short appid(3 ~ 32) ([a85065a](https://github.com/labring/laf/commit/a85065a4ce02302ccb486e37381c33c17a012bae))
* **sys:** init oss app policy; ([72d76fc](https://github.com/labring/laf/commit/72d76fc1c726fed08aca63bff23330fe162075f0))
* **sys:** init oss app policy; ([e533b93](https://github.com/labring/laf/commit/e533b938fc9b406911be726c1cb4a9a0e5da0132))
* **sys:** present app spec in client; ([458dc94](https://github.com/labring/laf/commit/458dc9482a472874f46a50e79cd3658029ff1754))
* **sys:** support custom app id of SES ([78f8255](https://github.com/labring/laf/commit/78f82552f32d8047fac490ee2bf18c4455a1e948))
* throttle to get file list; ([0dcb91a](https://github.com/labring/laf/commit/0dcb91aee438d33b17029e177e86b94d4ae5e2d0))
* use shorter appid insteadof uuid; ([62eb55e](https://github.com/labring/laf/commit/62eb55ebd76814f3bcf1157189b592b332cadd5d))



## [0.7.11](https://github.com/labring/laf/compare/v0.7.10...v0.7.11) (2022-04-27)


### Bug Fixes

* **client-sdk:** fix request api incompatible with uniapp new version ([f90e293](https://github.com/labring/laf/commit/f90e2933c9c6742f976760348e7c5a0657df5d36))
* **deploy:** fix docker ignore of app-service ([ecbf75f](https://github.com/labring/laf/commit/ecbf75f36dd8185026799d8de47a83886bd2c8e0))



## [0.7.10](https://github.com/labring/laf/compare/v0.7.9...v0.7.10) (2022-02-09)


### Features

* **app-service:** add npm install flags config; ([463daa6](https://github.com/labring/laf/commit/463daa6220b13c69619686090f86e70c43e8a0b0))



## [0.7.9](https://github.com/labring/laf/compare/v0.7.8...v0.7.9) (2022-02-05)


### Bug Fixes

* **sys-server:** FATAL!  remove get app db conn with directConnection option ([4aa6f46](https://github.com/labring/laf/commit/4aa6f4656710efb673a0de65831c0872ec6438cb))



## [0.7.8](https://github.com/labring/laf/compare/v0.7.7...v0.7.8) (2022-02-05)


### Features

* **sys-server:** add application template init support; ([1d96659](https://github.com/labring/laf/commit/1d96659f41735bf0d113e4dbb27203c7ba8c5efb))



## [0.7.7](https://github.com/labring/laf/compare/v0.7.6...v0.7.7) (2022-02-02)


### Bug Fixes

* **app-service:** clean unused codes; remove cloud.storage() [#21](https://github.com/labring/laf/issues/21) ([c650bfe](https://github.com/labring/laf/commit/c650bfedef1df2258f68c2ad22aab1c8e403dd2d))
* **fs:** add http accept range support; ([e21f391](https://github.com/labring/laf/commit/e21f391519cb65c871ff8a151f81c4f81ab2abbc))
* **gateway:** remove client_max_body_size limit; ([514b10d](https://github.com/labring/laf/commit/514b10d97276d70daede1334f81bef19577c7692))
* **sys-client:** optimize btn loading status ([b699558](https://github.com/labring/laf/commit/b699558ff07419eb4d428da84f73b14e5c2a2928))


### Features

* **gateway:** add /gw-health to gateway ([5109a41](https://github.com/labring/laf/commit/5109a4155f81ba69b9f6b3f5dbd1da16cae0896a))



## [0.7.6](https://github.com/labring/laf/compare/v0.7.5...v0.7.6) (2022-02-01)


### Features

* **fs:** add /health-check to fs service; ([b3f313f](https://github.com/labring/laf/commit/b3f313f7665d5bafafd13cc52485c5b52e069107))
* **gateway:** add gzip conf ([1b1e8d8](https://github.com/labring/laf/commit/1b1e8d8b909c0d7c1f55c851e6fe8bf7c1ee6c36))
* **k8s:** add startupProbe & readinessProbe support to services; ([fa5e57c](https://github.com/labring/laf/commit/fa5e57c6e15a87e2a6f14b6613bd99ce85d25967))



## [0.7.5](https://github.com/labring/laf/compare/v0.7.4...v0.7.5) (2022-01-31)


### Bug Fixes

* **gateway:** fix dns hot resolve in nginx conf for k8s ([72d4a6e](https://github.com/labring/laf/commit/72d4a6e362dabd0e832199dde85259d6cff3567a))


### Features

* **k8s:** support customize k8s namespace for apps; ([57135de](https://github.com/labring/laf/commit/57135ded0251c4f6d9a26bf3cab56fbe9ebe282d))
* **k8s:** support k8s resources limit for app; ([ffe0e28](https://github.com/labring/laf/commit/ffe0e28adde1fb0b305bb5277ce13e3ea1cb20a2))



## [0.7.4](https://github.com/labring/laf/compare/v0.7.3...v0.7.4) (2022-01-21)


### Bug Fixes

* **gateway:** fix conf path not created error ([97d2693](https://github.com/labring/laf/commit/97d2693eec1451d39a509131267cd327728466f3))



## [0.7.3](https://github.com/labring/laf/compare/v0.7.2...v0.7.3) (2022-01-21)


### Bug Fixes

* **storage-service:** add content-length for download api; ([6601885](https://github.com/labring/laf/commit/6601885eede5bea930357f0142c6326c25217fc3))



## [0.7.2](https://github.com/labring/laf/compare/v0.7.1...v0.7.2) (2022-01-21)


### Bug Fixes

* **gateway:** fix fs-proxy nginx conf [#35](https://github.com/labring/laf/issues/35) ([21efaab](https://github.com/labring/laf/commit/21efaab56494c3634cc2ad6d39d1ba3ec9b47c48))


### Features

* **gateway:** add k8s conf ; ([c5e68e8](https://github.com/labring/laf/commit/c5e68e8ae5c266b4c3593619810bd36432c69328))
* **sys-server:** add k8s driver support; ([bb3923a](https://github.com/labring/laf/commit/bb3923a56e7e3e7c0f5fef217d2939cf0925ba0f))



## [0.7.1](https://github.com/labring/laf/compare/v0.7.0...v0.7.1) (2022-01-17)


### Bug Fixes

* **app-console:** fix tsd parse missing while init editor ([b2818a0](https://github.com/labring/laf/commit/b2818a04da6588688622e0b11bdb9f8fca75402e))
* **app-service:** fix cloud function unsafe log [#34](https://github.com/labring/laf/issues/34) ([ecab8bf](https://github.com/labring/laf/commit/ecab8bf9dd5cae9cd1933bf28bab5e68bc0335cd))
* **gateway:** fix nginx conf support 4xx CORS; ([421b854](https://github.com/labring/laf/commit/421b85449ec49c0d2865c995a4aef8e6a54e8b3b))
* **sys-server:** fix default path of system-extension-server.lapp ([72a55e3](https://github.com/labring/laf/commit/72a55e39f373235bc20e0296d51aa96aad063e70))
* **sys-server:** fix memory overflow [#33](https://github.com/labring/laf/issues/33) ([0e1b321](https://github.com/labring/laf/commit/0e1b3215d4eeb2631cc69a3c313d618eb1b42fae))
* **sys-server:** fix publish err when func or policy is empty ([c1d6e2a](https://github.com/labring/laf/commit/c1d6e2ac4e75a1205fa1479b547ed22b5079ffff))
* **sys-server:** update system extension server app pkg; ([a96561e](https://github.com/labring/laf/commit/a96561ec4debcd894b242234d40f1b6630c5880c))



# [0.7.0](https://github.com/labring/laf/compare/v0.6.23...v0.7.0) (2021-12-28)


### Bug Fixes

* **app-console:** fix route hook error; ([c638181](https://github.com/labring/laf/commit/c638181fb9a409f693048fa7f414b26533de94d3))
* **app-service:** fix [#19](https://github.com/labring/laf/issues/19) watch error while mongo conn losed ([53a8aae](https://github.com/labring/laf/commit/53a8aae06e8039a29c99e52b2cdac37c4fcda906))
* **app-service:** fix change stream reconnection while mongo connection losed ([fd8fcd5](https://github.com/labring/laf/commit/fd8fcd5e16d4b2e8c04fbf0c20b0aa22e08481fc))


### Features

* **client:** split client to system-client & app-console; ([3cc5c15](https://github.com/labring/laf/commit/3cc5c1503bb0183f24a354e5602e3fb7f9230a94))
* **fs:** support standalone domain for fs bucket; ([66e9d7a](https://github.com/labring/laf/commit/66e9d7af480329d339973739324104cdc49c0a60))
* **gateway:** add proxy config for sys extension api ([4a39c79](https://github.com/labring/laf/commit/4a39c799aff449624d91195230d453a85136a243))
* **sys-client:** add sys-extension-api support for client; ([db33a72](https://github.com/labring/laf/commit/db33a725fd0011f0bb07e4965cbaf5f9cb1d9eb6))
* **system:** add system server app; impl init system server app; ([6031918](https://github.com/labring/laf/commit/60319183318ea9e4aa700826cc05e0820ae2954d))



## [0.6.23](https://github.com/labring/laf/compare/v0.6.22...v0.6.23) (2021-12-21)


### Bug Fixes

* **cloud-function:** fix ide error in unpublished function ([633a2b3](https://github.com/labring/laf/commit/633a2b3db1fb245740cb27fe256e1bbbcec1490f))
* **node-modules-util:** fix ts type parsing error for 'alipay-sdk' ([d41dd21](https://github.com/labring/laf/commit/d41dd21ef53d5739a6177b326d63e3835bd2b7fb))


### Features

* **sys:** refactor export & import app, support app package; ([18a4a8a](https://github.com/labring/laf/commit/18a4a8ae6b50ac26d232c844eb0a3a2e543a86ce))



## [0.6.22](https://github.com/labring/laf/compare/v0.6.21...v0.6.22) (2021-12-10)


### Features

* **cloud-function:** IDE support cache & restore editing codes in localstorage; ([c084624](https://github.com/labring/laf/commit/c08462448475ee3ecd9ec7991438736893e3d80d))



## [0.6.21](https://github.com/labring/laf/compare/v0.6.20...v0.6.21) (2021-12-09)


### Bug Fixes

* **sys-server:** fix app collaborators' uid type to objectid; ([835bf20](https://github.com/labring/laf/commit/835bf20e3a6dade685ca23c8027019a416cb24e9))



## [0.6.20](https://github.com/labring/laf/compare/v0.6.19...v0.6.20) (2021-12-07)


### Bug Fixes

* **app-service:** distinct & add runtime version & image; ([e2a6559](https://github.com/labring/laf/commit/e2a65596fe39d3cc1ba1f3d7c362ab36bc22ff39))
* **gateway:** fix deploy/incoming CORS conf ([2911cc1](https://github.com/labring/laf/commit/2911cc1c3e8e54cee752dd987f2dff3e93214f30))
* **sys-server:** fix func & policy date & objectid type ([83cfe78](https://github.com/labring/laf/commit/83cfe78802376a1f9050d3d3894dc80931c38eb7))
* **sys-service:**  fix func id type to ObjectId; ([6ac01d8](https://github.com/labring/laf/commit/6ac01d8a5dcdd3f0d6a931b2848c2669d7fd4a07))
* **type:** fix app & account date/objectid type; fix styles; ([8ba0761](https://github.com/labring/laf/commit/8ba0761ffd4f509ce1286312f1e71f0489f934aa))


### Features

* **app-service:** add appid & runtime version to app; ([57fa817](https://github.com/labring/laf/commit/57fa817c4dbf5855059663ba3a41b22f59404221))
* **sys-client:** add func history & code diff editor; ([45a85e9](https://github.com/labring/laf/commit/45a85e94c5bf764002349f4f8ee7a210af98d672))



## [0.6.19](https://github.com/labring/laf/compare/v0.6.18...v0.6.19) (2021-11-19)


### Features

* **docs:** add docs to gateway deploy; ([54e4ce4](https://github.com/labring/laf/commit/54e4ce4f205a7c3a8ac65e5a3be172ec852f860f))



## [0.6.18](https://github.com/labring/laf/compare/v0.6.17...v0.6.18) (2021-11-17)


### Bug Fixes

* **gateway:** fix start shell, use exec to run; ([669354e](https://github.com/labring/laf/commit/669354e80daf5ea8df8fe8b997592dffb2620250))


### Features

* **app-service:** add start.sh to init packages on start; ([7d056cc](https://github.com/labring/laf/commit/7d056cc90560835c56fcfb3b9143aab2bcfedf30))
* **app-service:** support gracefully exit; ([393caa2](https://github.com/labring/laf/commit/393caa21ccb55877473260dec971c0fc7026325e))
* **sys:** support package manage in client; add pkg manage apis in sys; ([0f08fdd](https://github.com/labring/laf/commit/0f08fddd64aa5c47cca2ffb3df31286d81fc91ce))



## [0.6.17](https://github.com/labring/laf/compare/v0.6.16...v0.6.17) (2021-11-15)


### Bug Fixes

* **fs:** fix pagination error @ get files; ([5d4563d](https://github.com/labring/laf/commit/5d4563d9bfe5d07b4a7452fc6e4dd5f29bda2c8f))
* **sys-client:** fix styles for small screen; ([f7994ca](https://github.com/labring/laf/commit/f7994ca00afac52efb9762da2ca5e9e46b164a1d))



## [0.6.16](https://github.com/labring/laf/compare/v0.6.15...v0.6.16) (2021-11-15)


### Bug Fixes

* **client-sdk:** fix old file upload api; ([25c9f58](https://github.com/labring/laf/commit/25c9f58417623d013604cb70230b5754488e2b21))
* **fs:** fix to support auto naming for file uploads; ([dd743d0](https://github.com/labring/laf/commit/dd743d00edc036510e108ab3afdc707718658233))



## [0.6.15](https://github.com/labring/laf/compare/v0.6.14...v0.6.15) (2021-11-15)


### Bug Fixes

* **storage-service:** fix chinese file name error; ([31abf59](https://github.com/labring/laf/commit/31abf59378c1fa64d4c12834c028a949d396a5c2))



## [0.6.14](https://github.com/labring/laf/compare/v0.6.13...v0.6.14) (2021-11-15)


### Features

* **app-service:** add alipay-sdk built-in; ([563f005](https://github.com/labring/laf/commit/563f005e9069033e07d80881ecc6ef2ea11c792e))
* **storage-service:** use storage-service, replace old fs; ([ad73e90](https://github.com/labring/laf/commit/ad73e90d21b4de1f337f6298332f235d35ff7342))



## [0.6.13](https://github.com/labring/laf/compare/v0.6.12...v0.6.13) (2021-11-12)


### Features

* **app-service:** remove CORS in app; ([3e29e95](https://github.com/labring/laf/commit/3e29e958330892b3124ca3ca7203f6ebd5f8a590))
* **gateway:** add gateway service; ([2b1debe](https://github.com/labring/laf/commit/2b1debe9128b86c18961bddc593427307b0a5b5c))
* **sys-client:** remove api-app proxy; add runtime version & memory ([5063b2e](https://github.com/labring/laf/commit/5063b2e48a4291b6a73d9bd25c2172b49ddae158))



## [0.6.12](https://github.com/labring/laf/compare/v0.6.11...v0.6.12) (2021-11-09)


### Bug Fixes

* **sys-client:** fix ide type declaration error ([a238584](https://github.com/labring/laf/commit/a23858468068ecd2619a98232e4046c77a1ead77))



## [0.6.11](https://github.com/labring/laf/compare/v0.6.10...v0.6.11) (2021-11-09)


### Bug Fixes

* **app-service:** fix require in cloud function fatal error ([1c12af5](https://github.com/labring/laf/commit/1c12af5260514322688a4707ec8ce91aa493dbc4))
* **nginx:** fix nginx config; ([ca2a391](https://github.com/labring/laf/commit/ca2a39132cac8d26400b80c75c3bf067a5ce5427))


### Features

* **websocket:** support websocket in app-service; ([025dd39](https://github.com/labring/laf/commit/025dd3910e9832c8ccc9863333dbcdd0acc2439e))



## [0.6.10](https://github.com/labring/laf/compare/v0.6.9...v0.6.10) (2021-11-05)


### Bug Fixes

* **app-service:** fix bson serialize func log error; ([5f0fa95](https://github.com/labring/laf/commit/5f0fa95fe5c3b0adfd6b5a380aebbc94e86929d2))
* **app-service:** fix func_id type to ObjectId ([8edecc8](https://github.com/labring/laf/commit/8edecc8026a0629e8cfc7510b70fa3dd80f8bf9e))



## [0.6.9](https://github.com/labring/laf/compare/v0.6.8...v0.6.9) (2021-11-04)


### Bug Fixes

* **cloud-function:** close `microtaskMode` option which cause fatal error ([963da1f](https://github.com/labring/laf/commit/963da1f23120ea4985ba3a595b239e119a0aae72))



## [0.6.8](https://github.com/labring/laf/compare/v0.6.7...v0.6.8) (2021-11-04)


### Bug Fixes

* **sys-client:** update navigation logics; ([b68df36](https://github.com/labring/laf/commit/b68df362f8864a6c369f9e4e74725d737edd0cee))


### Features

* **cloud-function:** add unit tests for function engine; ([40a9ae8](https://github.com/labring/laf/commit/40a9ae838932b147c367b2a34f2cdb252aae2c13))
* **cloud-function:** support async timeout/globals/sync main/filename; ([e5ecf6d](https://github.com/labring/laf/commit/e5ecf6d12e83593aa14e66442add2e7dc0312bd0))



## [0.6.7](https://github.com/labring/laf/compare/v0.6.6...v0.6.7) (2021-11-03)


### Bug Fixes

* **app-service:** fix invoke() function return type; ([edd1f8a](https://github.com/labring/laf/commit/edd1f8a7cd79e344f97da928d2ebc9b9bc30762a))



## [0.6.6](https://github.com/labring/laf/compare/v0.6.5...v0.6.6) (2021-11-03)


### Bug Fixes

* **app-service:** fix uncaught promise rejected in cloud function, cause that process exit ([250a9e6](https://github.com/labring/laf/commit/250a9e605cb885a0372b2f59d98c1228c77f0059))


### Features

* **function:** support TTL indexes on logs; support number as return value; support result in log; ([fa82cb4](https://github.com/labring/laf/commit/fa82cb4c00324bae0f8b0518ec3883b912aa0f11))



## [0.6.5](https://github.com/labring/laf/compare/v0.6.4...v0.6.5) (2021-11-02)


### Features

* **cloud-func:** support unpublished func debugging ([61b8f9d](https://github.com/labring/laf/commit/61b8f9d53a5f7e0276ae6e850797376c73e1b2f4))
* **sys-client:** add some copy-btns; optimize ux exp; ([91ff431](https://github.com/labring/laf/commit/91ff431a6e8d84619a32a534e2a77fe9fd25d5d9))
* **sys-server:** add local dev/debug config for app-service; ([83877a7](https://github.com/labring/laf/commit/83877a746553bccba1ab6044955ce5e9760db7f4))
* **sys:** support func version; add save status in ide; ([2df7e05](https://github.com/labring/laf/commit/2df7e05ecf308ed83f39f1d5d751244a12dd9cc1))
* **sys:** support publish single function; ([f67962b](https://github.com/labring/laf/commit/f67962bf9b1d0ed59cb00c88978a5a8c8e3eb9aa))



## [0.6.4](https://github.com/labring/laf/compare/v0.6.3...v0.6.4) (2021-11-01)


### Bug Fixes

* **app-service:** auto create internal pkg; ([543052b](https://github.com/labring/laf/commit/543052b7b90d13b63019e1d861c72148aa73a2f6))
* **style:** 修改名称展示bug ([b715eb4](https://github.com/labring/laf/commit/b715eb43b31efe61c2a2c3d8512313092372bce0))


### Features

* **sys-client:** start app while created; ([2308451](https://github.com/labring/laf/commit/23084517c6dbc4cd78637f975ddab5f94be31af9))
* **sys-server:** add runtime metrics to app; ([a69ed61](https://github.com/labring/laf/commit/a69ed618893607fefa02a8a90f7731b019663f91))



## [0.6.3](https://github.com/labring/laf/compare/v0.6.2...v0.6.3) (2021-10-23)


### Bug Fixes

* **sys-client:** optimize function editor height; ([d5d02de](https://github.com/labring/laf/commit/d5d02deb3d38ad22159e8d879c42ac89d2d78986))



## [0.6.2](https://github.com/labring/laf/compare/v0.6.1...v0.6.2) (2021-10-20)


### Bug Fixes

* **db-ql:** fix result-types error; ([71f6ee8](https://github.com/labring/laf/commit/71f6ee81bc71914c09e2bf3f55d2434fca5f535a))



## [0.6.1](https://github.com/labring/laf/compare/v0.6.0...v0.6.1) (2021-10-20)


### Bug Fixes

* **db-ql:** fix remove() fatal error; ([0d64aa7](https://github.com/labring/laf/commit/0d64aa74a06151549c21298d5dad685d77db71f8))
* **sys-client:** fix dbm update merge with true -> false ([858a71f](https://github.com/labring/laf/commit/858a71ffd0cd9d37e764a61f9143f700f58d0d59))



# [0.6.0](https://github.com/labring/laf/compare/v0.6.0-alpha.10...v0.6.0) (2021-10-20)



# [0.6.0-alpha.10](https://github.com/labring/laf/compare/v0.6.0-alpha.9...v0.6.0-alpha.10) (2021-10-19)


### Bug Fixes

* **system:** fix rule update error; ([d825931](https://github.com/labring/laf/commit/d825931ba868df806f1429555795217ee1f1cbe4))



# [0.6.0-alpha.9](https://github.com/labring/laf/compare/v0.6.0-alpha.8...v0.6.0-alpha.9) (2021-10-19)


### Bug Fixes

* **db-ql:** fix ejson deserialize error in aggregation ([832e99a](https://github.com/labring/laf/commit/832e99a9ac2c258ac95c83868c573fda0845f89e))



# [0.6.0-alpha.8](https://github.com/labring/laf/compare/v0.6.0-alpha.7...v0.6.0-alpha.8) (2021-10-19)


### Bug Fixes

* **db-ql:** fix binary object serialize bug ([5c28d8d](https://github.com/labring/laf/commit/5c28d8d2a1ac63524703e28f6ce34150971d92e8))
* **sys-client:** fix dbm update serialize error ([536fe94](https://github.com/labring/laf/commit/536fe94911c85e609739c541642cfcb8ad21f3df))


### Features

* **db-proxy:** add aggregation support; ([fbcccea](https://github.com/labring/laf/commit/fbcccea89976434ea10e053c5f122c6ee7defb68))
* **db-proxy:** add count option to read operation ([e7545ca](https://github.com/labring/laf/commit/e7545ca1274e96ed1f078f42105d0267d3f73086))
* **db-proxy:** remove deprecated api: ruler, rulerv1, tests, entry; ([4be2479](https://github.com/labring/laf/commit/4be2479db89d06834c269d6512aa2315db929062))
* **db-ql:** add aggregate() feat & tests; ([efce38a](https://github.com/labring/laf/commit/efce38ade563d170fdf3132eb9303e740ae9a613))
* **db-ql:** add page & count options for query ([1ecc32d](https://github.com/labring/laf/commit/1ecc32da246e058dbb11ad85a1644d8f9b73d5af))
* **db-ql:** add page() method ([1148e4a](https://github.com/labring/laf/commit/1148e4ac8c3b073af6e98d9a79fae5966d4aa87a))
* **db-ql:** add update unit tests; ([aefd260](https://github.com/labring/laf/commit/aefd260ad2563984071f2592c390953268afe761))
* **db-ql:** refactor query & document api impl; ([dbeb55a](https://github.com/labring/laf/commit/dbeb55a596b253f99de558bc6377a4fecfba5d3d))
* **test:** add doc() unit tests; ([0481a8c](https://github.com/labring/laf/commit/0481a8c8fdbc9f76f2ef82a22e50ce7f1e715c29))



# [0.6.0-alpha.7](https://github.com/labring/laf/compare/v0.6.0-alpha.6...v0.6.0-alpha.7) (2021-10-15)


### Features

* **db-proxy:** impl ejson for mongo; ([52ef727](https://github.com/labring/laf/commit/52ef727051885045ad56873675bf726fcb1beb97))
* **db-ql:** add ejson support; add ObjectId & Binary support; ([4471e6f](https://github.com/labring/laf/commit/4471e6f30e75a3526e7af952eecc263b9bfcd2c2))
* **db-ql:** mark serverDate regexp as deprecated ([be9eb27](https://github.com/labring/laf/commit/be9eb272145da03713391da7be89beceb8e8b5cf))
* **sys-client:** add ejson ObjectId & Binaray type support to dbm; ([0097910](https://github.com/labring/laf/commit/0097910cb228aafcb4e8587d2b29f33de1a39b82))



# [0.6.0-alpha.6](https://github.com/labring/laf/compare/v0.6.0-alpha.5...v0.6.0-alpha.6) (2021-10-14)


### Bug Fixes

* **sys-client:** dbm - update doc error catch ([d1babbc](https://github.com/labring/laf/commit/d1babbc00b53e2ae91c90e4601ce6a5ce77a0c24))



# [0.6.0-alpha.5](https://github.com/labring/laf/compare/v0.6.0-alpha.4...v0.6.0-alpha.5) (2021-10-14)


### Bug Fixes

* **db-ql:** restore the code field in query result ([decaeec](https://github.com/labring/laf/commit/decaeece27f872637ff9cd37d2880c39d6328f20))


### Features

* **dbm:** impl db schema; impl create db; ([2f29bfd](https://github.com/labring/laf/commit/2f29bfd0849d488ff1997c769b8d6301cd8ceb50))



# [0.6.0-alpha.4](https://github.com/labring/laf/compare/v0.6.0-alpha.3...v0.6.0-alpha.4) (2021-10-07)


### Bug Fixes

* **db-proxy:** remove stale objectid logic ([56ba516](https://github.com/labring/laf/commit/56ba5163899d14fd2c96701eac7875bb67644fa7))
* **db-ql:** remove res data format ([8064384](https://github.com/labring/laf/commit/806438429b6fc4eb75ca67194496cfd39aeaa438))


### Features

* **sys-server:** rewrite all db orm in sys server, use mongo db api instead ([2c54c05](https://github.com/labring/laf/commit/2c54c05a8885a69733bc70b021e05f6a98dbe3e6))



# [0.6.0-alpha.3](https://github.com/labring/laf/compare/v0.6.0-alpha.2...v0.6.0-alpha.3) (2021-10-07)


### Bug Fixes

* **sys-server:** fix ACCOUNT_DEFAULT_APP_QUOTA's type ([ffb2d08](https://github.com/labring/laf/commit/ffb2d085696f462cd07da837e69c97d065bfbdc3))


### Features

* **db-proxy:** abandon ObjectId type support use string instead ([b97066a](https://github.com/labring/laf/commit/b97066a28e21177ccfcc488368b08ed1f9bb2399))
* **db-ql:** add generate string id support ([7f01d5d](https://github.com/labring/laf/commit/7f01d5d6ea5b51663630b682f72efcee31a5f3d6))



# [0.6.0-alpha.2](https://github.com/labring/laf/compare/v0.6.0-alpha.1...v0.6.0-alpha.2) (2021-10-06)


### Bug Fixes

* **sys-client:** fix function editor default types loading ([b411785](https://github.com/labring/laf/commit/b41178589f65082b502efbbbbb3c419169d5ea48))



# [0.6.0-alpha.1](https://github.com/labring/laf/compare/v0.6.0-alpha.0...v0.6.0-alpha.1) (2021-10-06)


### Bug Fixes

* **app-service:** fix uuid gen error; ([d7ecd76](https://github.com/labring/laf/commit/d7ecd76abff9dc02ba9b6c77524ff7f2e5d63918))



# [0.6.0-alpha.0](https://github.com/labring/laf/compare/v0.5.8-alpha.0...v0.6.0-alpha.0) (2021-10-06)


### Bug Fixes

* use db distinct to refact tags retreiving ([abf40ce](https://github.com/labring/laf/commit/abf40cec603e9fce17c3161e79e760e0c6b56eae))


### Performance Improvements

* **memory:** remove ts pkg (compile) to reduce 20mb memory useage; ([67b36c4](https://github.com/labring/laf/commit/67b36c42a1eceb41fa364e69ff109fe7ab3ae877))



## [0.5.8-alpha.0](https://github.com/labring/laf/compare/v0.5.7...v0.5.8-alpha.0) (2021-09-28)


### Bug Fixes

* **sys server:** fix mongo version in deploys; fix regexp options error; ([35c4ce6](https://github.com/labring/laf/commit/35c4ce65f1167249513ccbee6cd84a48f520abd2))



## [0.5.7](https://github.com/labring/laf/compare/v0.5.7-alpha.0...v0.5.7) (2021-09-26)


### Bug Fixes

* **sys server:** fix body limit 413; ([488fc9e](https://github.com/labring/laf/commit/488fc9ef5cc0efa0f20ea371b68e14727582487f))



## [0.5.7-alpha.0](https://github.com/labring/laf/compare/v0.5.6...v0.5.7-alpha.0) (2021-09-22)


### Bug Fixes

* **sys server:** fix missing query params for func logs fetch api; ([c9b8a75](https://github.com/labring/laf/commit/c9b8a7533f876abd25bd39b522b9e95fd942e877))



## [0.5.6](https://github.com/labring/laf/compare/v0.5.5...v0.5.6) (2021-09-22)


### Bug Fixes

* **sys server:** fix get tags missing appid; ([164fc85](https://github.com/labring/laf/commit/164fc85a43d4e9047b5631a3485db7dbfbd20a0b))



## [0.5.5](https://github.com/labring/laf/compare/v0.5.5-alpha.0...v0.5.5) (2021-09-17)


### Bug Fixes

* **https:** add url schema to sys server config; support ssl depoy; ([296272a](https://github.com/labring/laf/commit/296272ae660567354dda4fc90afb6aaab87d2be2))



## [0.5.5-alpha.0](https://github.com/labring/laf/compare/v0.5.4...v0.5.5-alpha.0) (2021-09-15)


### Bug Fixes

* **app-service:** fix function invoke 404 error; ([030acae](https://github.com/labring/laf/commit/030acaefdcb954347b6294b4ff0141c6389f529a))
* **config:** fix deploy-scripts:docker-compose ([460487e](https://github.com/labring/laf/commit/460487ef115a91a368e4b3957f16149deed75ec7))



## [0.5.4](https://github.com/labring/laf/compare/v0.5.4-alpha.0...v0.5.4) (2021-09-15)


### Bug Fixes

* **system-client:** fix debug function result output; ([f467003](https://github.com/labring/laf/commit/f467003e39c5043949bdbcec4a339b17ccbb6d07))



## [0.5.4-alpha.0](https://github.com/labring/laf/compare/v0.5.3...v0.5.4-alpha.0) (2021-09-13)


### Features

* **cloudfunction:** export response object to function; refactor invoke result, directly return what function return; ([902edb4](https://github.com/labring/laf/commit/902edb4515a998f3c96db87d7a827eae82b11950))



## [0.5.3](https://github.com/labring/laf/compare/v0.5.2...v0.5.3) (2021-09-13)


### Bug Fixes

* **app-server:** fix trigger invoking bug, func_id type error ([1ff8b51](https://github.com/labring/laf/commit/1ff8b510ba9351cee1e5a77206dc0746fbba58fe))



## [0.5.2](https://github.com/labring/laf/compare/v0.5.2-alpha.0...v0.5.2) (2021-09-10)


### Bug Fixes

* **sys-server:** fix remote deploy got duplicated error, dropped func/policy _id; ([1da03a9](https://github.com/labring/laf/commit/1da03a9ad527620cdde900700a515e0ae49c704d))



## [0.5.2-alpha.0](https://github.com/labring/laf/compare/v0.5.1...v0.5.2-alpha.0) (2021-09-10)


### Bug Fixes

* **sys-server:** fix remote deploy token check message; ([e4cc3d3](https://github.com/labring/laf/commit/e4cc3d36fc00978231cabccb263211e3ec75055a))


### Features

* **sys-client:** add app access url to func/deploy/policy/file pages; ([21ca41e](https://github.com/labring/laf/commit/21ca41e9f59cd8f696f1fea489ad58f8599fbdef))



## [0.5.1](https://github.com/labring/laf/compare/v0.5.1-alpha.0...v0.5.1) (2021-09-10)



## [0.5.1-alpha.0](https://github.com/labring/laf/compare/v0.5.0...v0.5.1-alpha.0) (2021-09-10)


### Bug Fixes

* **deploy:** IMPORTANT!fix deploy apply bugs(missing appid); ([41ddbfb](https://github.com/labring/laf/commit/41ddbfb87d5374322fef9b24c612c554741916e3))



# [0.5.0](https://github.com/labring/laf/compare/v0.5.0-alpha.3...v0.5.0) (2021-09-09)


### Bug Fixes

* **sys-client:** fix func tags list; add owner role; ([152d195](https://github.com/labring/laf/commit/152d195153644d3b098680dd9f109ebb6057dc75))
* **sys-server:** add exportor script for old init datas; ([9f1ae71](https://github.com/labring/laf/commit/9f1ae713e4d6d382f531ea683deb2f9e59834df9))
* **sys-server:** add owner role to app; impl get tags of func api; ([5afecf9](https://github.com/labring/laf/commit/5afecf9425f4501871812b80c6ee72ec22e99284))


### Features

* **app-service:** refactor trigger getter, publish; ([4f1deac](https://github.com/labring/laf/commit/4f1deac7301208a60e6ad525e0e9f481f80107a7))



# [0.5.0-alpha.3](https://github.com/labring/laf/compare/v0.5.0-alpha.2...v0.5.0-alpha.3) (2021-09-09)


### Features

* **sys-client:** impl import/export app; ([5ec26ef](https://github.com/labring/laf/commit/5ec26ef4584e1a9c8f48f89cf1749f91b92d8a93))
* **sys-server:** impl im/export apis; ([10d651b](https://github.com/labring/laf/commit/10d651bde81133754d45af015b6e6c8d28951817))
* **sys:** impl delete app api & page ([7dd294c](https://github.com/labring/laf/commit/7dd294c58ab622ec8304ca8a458b5df21af06f1c))



# [0.5.0-alpha.2](https://github.com/labring/laf/compare/v0.5.0-alpha.1...v0.5.0-alpha.2) (2021-09-08)


### Bug Fixes

* **sys-client:** add 403 permission tip; ([d845356](https://github.com/labring/laf/commit/d845356dcae276808842248f810ac2cc9e504183))
* **sys-client:** fix error in debug function; ([cab5747](https://github.com/labring/laf/commit/cab5747089d518f807708e469b4f6f5defc51db3))
* **sys-client:** fix nav styles & user state; ([4885ecd](https://github.com/labring/laf/commit/4885ecdffcd449a7501485bae1675886b6432686))
* **sys-client:** fix styles & add util function(show) ([7809903](https://github.com/labring/laf/commit/78099030f846d74ca2b6ab7fe4a3dae465d3185b))


### Features

* **sys client:** add joined app list ([4587bc7](https://github.com/labring/laf/commit/4587bc7c0239da326c02e500e9a445e5df6442df))
* **sys-client:** impl collaborate crud page ([10ca68f](https://github.com/labring/laf/commit/10ca68f2f4da75e4b749aade445c0a790bd6f063))
* **sys-client:** impl remove app service; ([b0c8634](https://github.com/labring/laf/commit/b0c863406d73bfcc70664110d72d98a90d53aff7))
* **sys-server:** add array util functions; ([b91ba2b](https://github.com/labring/laf/commit/b91ba2b9a9957adddab4cb414213f0c22a74c01b))
* **sys-server:** add max_old_space_size of node vm config; ([5275071](https://github.com/labring/laf/commit/527507159dba9c2bcd8d1821fa2d5a8b4ba1b7ad))
* **sys-server:** add remove app service api; ([6942fa5](https://github.com/labring/laf/commit/6942fa54b4bcaf0ef2cf80c9e58d19ae50a4fb00))
* **system-server:** add app collaborator crud apis; ([2789b0d](https://github.com/labring/laf/commit/2789b0d191c183d7ade53bc69c7bde1c7dd5ea40))



# [0.5.0-alpha.1](https://github.com/labring/laf/compare/v0.5.0-alpha.0...v0.5.0-alpha.1) (2021-09-07)


### Bug Fixes

* **error:** fix error in devops init script; ([ba310cc](https://github.com/labring/laf/commit/ba310cce62f26e78448e5bb95c86d3e6a7c3d496))


### Features

* **system-server:** add quota to limit app creating ([77e98db](https://github.com/labring/laf/commit/77e98dbc99ae4b94b00767eec67cf1b7016ac2e3))



# [0.5.0-alpha.0](https://github.com/labring/laf/compare/v0.4.21-alpha.0...v0.5.0-alpha.0) (2021-09-06)


### Bug Fixes

* **server-client:** add dynamic router hook ([a4a3923](https://github.com/labring/laf/commit/a4a3923125a6b5ed722f2c6415760e88ed22696d))
* **server-client:** update appid instead app._id ([0aa9288](https://github.com/labring/laf/commit/0aa92883706d56981c4fe365e0134b4be598586c))
* **sys-client:** fix files api; ([7ed35d9](https://github.com/labring/laf/commit/7ed35d9db543e1d0949ad3b92141855136d654a5))
* **system-client:** fix `remove function` feat; ([5c18d15](https://github.com/labring/laf/commit/5c18d154dd267dc6ec4c976f51f798ff815f1399))
* **system-client:** fix app api url access; ([348ca7e](https://github.com/labring/laf/commit/348ca7e2cf6140af44e81053d498d612fca66a7c))
* **system-client:** fix dbm pages; ([e0f44da](https://github.com/labring/laf/commit/e0f44dab40558d12f11dc59423152aef8d5fa3e1))
* **system-client:** fix pagination error; ([308ad8a](https://github.com/labring/laf/commit/308ad8aecc451f6730e6c1a79786873b3d2949ec))
* **system-client:** fix policy rules CRUD feats; ([44a4dbd](https://github.com/labring/laf/commit/44a4dbd917a471a448ad288ef374d87f20ab7072))
* **system-client:** fix the function updating pages; ([49fd049](https://github.com/labring/laf/commit/49fd049d948700bd9634534ddea927af364e2161))
* **system-server:** add appid to applications; ([f1bc2e2](https://github.com/labring/laf/commit/f1bc2e220cb5140abfa03580c8cf452bd0667e0d))
* **system-server:** fix get function error; ([ea20a61](https://github.com/labring/laf/commit/ea20a61eec587c54a3ed37a03e2f98ebdcf09d03))
* **system-server:** little fixes; ([be71012](https://github.com/labring/laf/commit/be7101299592c2ff7678a34e83c1020861aab307))
* **system:** fix trigger CRUD pages; ([00cd4bb](https://github.com/labring/laf/commit/00cd4bbd893e35bb573e3580d4bcd6f047a9c057))


### Features

* **server-client:** add app to vuex store; ([3abeb9d](https://github.com/labring/laf/commit/3abeb9d08fdc92f5f45f8384d18f9ad18decf09c))
* **server-client:** impl apps & functions pages; ([fe4ae60](https://github.com/labring/laf/commit/fe4ae6050a5c8d105e074ad04736e83b296c328c))
* **server-client:** impl dynamic router for app ([0f7f74d](https://github.com/labring/laf/commit/0f7f74d480cd1b334fd227c2c1b1d1baa7cb4b26))
* **server-client:** impl layout for app ([9d973f0](https://github.com/labring/laf/commit/9d973f08ad182e5d2518f3ce3cf5945f4074a8f7))
* **sys-client:** add sign up page; ([8222387](https://github.com/labring/laf/commit/822238705924a50712edc638a92801f610ebbdf1))
* **system-client:** add application user apis ([0883253](https://github.com/labring/laf/commit/08832536cd90a8fb81566b40238c1a3116f1de80))
* **system-client:** impl app service start & stop; ([f28d199](https://github.com/labring/laf/commit/f28d199f60381ed7972712436e2326a08365504c))
* **system-client:** impl application & sign in/up pages; ([3bbb30f](https://github.com/labring/laf/commit/3bbb30f5afe87cd9b492995ca77278b78f047464))
* **system-client:** impl new navbar ([1fbf8cd](https://github.com/labring/laf/commit/1fbf8cd8ed725216f3460fb62f6512aef9d68276))
* **system-client:** impl remote deploy pages; ([8dee4e5](https://github.com/labring/laf/commit/8dee4e5f64e614d48e8603d565f532ee74c4bbf0))
* **system-server:** add account apis; ([664458e](https://github.com/labring/laf/commit/664458edd8b1322b0f748bb9494e30a16a1a1787))
* **system-server:** add app service docker driver; ([adfb27d](https://github.com/labring/laf/commit/adfb27d16bb9d8b1b6f32a3f07635462a5a03b79))
* **system-server:** add app service image config; ([0f770ab](https://github.com/labring/laf/commit/0f770abfec03af8b62961378d55fb29090154e3e))
* **system-server:** add app service start & stop router; ([c71f362](https://github.com/labring/laf/commit/c71f362a6a56026c5186e97bb17014e490983a03))
* **system-server:** add app update apis; ([5c674f3](https://github.com/labring/laf/commit/5c674f39f9b31fcb2595dc51012cbc0c0cfbacdf))
* **system-server:** add policy CRUD routers; ([8456aab](https://github.com/labring/laf/commit/8456aab0ee8073ea99d53ea39706eb84a5c47ce3))
* **system-server:** add policy rules routes; ([4f33276](https://github.com/labring/laf/commit/4f33276e928b5a65cecb9e6271d4584d13acd507))
* **system-server:** add remote deploy routes; ([7fbb75e](https://github.com/labring/laf/commit/7fbb75e82157d0cd0afc4100cdc04c2bac88bf41))
* **system-server:** add system-server built-in roles & permissions; ([d8794b9](https://github.com/labring/laf/commit/d8794b90db416db1a8a2ecf59f5d25072cbbfcce))
* **system-server:** add update function apis; ([834915a](https://github.com/labring/laf/commit/834915a94326674f1fbbab034418c5ab12fe5d10))
* **system-server:** create system server package; ([508c76e](https://github.com/labring/laf/commit/508c76e5be4a2b4ca1d643c89860b80a36063b9e))
* **system-server:** impl application & account apis; ([c5d6bc0](https://github.com/labring/laf/commit/c5d6bc0694e2ff6dcf479d09810b53b538d68ad9))
* **system-server:** refactor db agent; ([a2e9a6c](https://github.com/labring/laf/commit/a2e9a6ce1e483fc1c6d626169c850f5e2ec37862))
* **system-server:** refactor system server apis, support appid; ([446740f](https://github.com/labring/laf/commit/446740f742ea519614cb78b7707edd57abc171c8))
* **system:** add debug token & file token; fix debug & file feat; ([d6eea7a](https://github.com/labring/laf/commit/d6eea7aba3f6d1c47f64b90ffe489684a7631846))
* **system:** impl functin logs api & pages; ([b11e17e](https://github.com/labring/laf/commit/b11e17e58fafdbbc544e2daf1a1332a3b4cf0130))



## [0.4.21-alpha.0](https://github.com/labring/laf/compare/v0.4.20...v0.4.21-alpha.0) (2021-08-24)


### Bug Fixes

* **config:** IMPORTANT!docker-compose mongo db volume config error; ([2538d65](https://github.com/labring/laf/commit/2538d65d595bd9376ddb4c948b262a4e148ce20d))
* **secure:** fix upload file secure problem [#1](https://github.com/labring/laf/issues/1) ([02caa37](https://github.com/labring/laf/commit/02caa3755f8129b2f2ff4c6d5a8fe8cd3a0365f0))



## [0.4.20](https://github.com/labring/laf/compare/v0.4.19...v0.4.20) (2021-08-18)


### Features

* **app-server:** add gridfs-storage; ([d393f6c](https://github.com/labring/laf/commit/d393f6cd57385dee4ef8c8a3ad52cbc8223a8e12))
* **app-server:** expose gridfs storage api to cloud-sdk; ([ece5dd4](https://github.com/labring/laf/commit/ece5dd4f14f8a66cfef2064aef86d20765d5e8e3))



## [0.4.19](https://github.com/labring/laf/compare/v0.4.18...v0.4.19) (2021-08-18)


### Features

* impl file upload in devops-admin; ([f3b383a](https://github.com/labring/laf/commit/f3b383a89df494ddd265c8c77eb7b681be1a5f02))



## [0.4.18](https://github.com/labring/laf/compare/v0.4.17...v0.4.18) (2021-08-17)


### Bug Fixes

* **app-server:** fix file upload token parsing error; ([aa7368e](https://github.com/labring/laf/commit/aa7368e79d8d9118e189dc3ee2834305f053407d))


### Features

* **app-server:** add filename field to file operation token; ([68f25ef](https://github.com/labring/laf/commit/68f25ef09a1c3d7a2001ecf55850aef4584ce338))
* **app-server:** impl start.ts to support cluster process manage; ([64b2a74](https://github.com/labring/laf/commit/64b2a74a3995b44e7c9353882ff7ca52da9d3737))
* **devops-server:** add file operation api; ([e1221c6](https://github.com/labring/laf/commit/e1221c67e727681b00a997534e50ba85823582c6))
* **devops:** impl file managing in devops admin & server ([8e8aef4](https://github.com/labring/laf/commit/8e8aef475eafffc29aae04d055d3e3e73a1dd3ef))



## [0.4.17](https://github.com/labring/laf/compare/v0.4.16...v0.4.17) (2021-08-16)


### Bug Fixes

* 修复获取依赖包类型接口报错无捕获； ([43582a5](https://github.com/labring/laf/commit/43582a5697cb1a7c524798efe5779e80b034c5fb))
* add node package `util` support; ([be9c373](https://github.com/labring/laf/commit/be9c373b2505ae34d3ed8a4186d0d279403be745))


### Features

* **app-server:** add cache-control & etag of http request for gridfs files; ([acc3c44](https://github.com/labring/laf/commit/acc3c440afc55c3666c0bca0661daf9f54bb2fd9))
* **devops-adin:** 优化访问策略编辑页的交互体验、修复修改访问策略时的错误； ([759fe32](https://github.com/labring/laf/commit/759fe32c7f679274a660d47f27c62ceb6356e875))



## [0.4.16](https://github.com/labring/laf/compare/v0.4.15...v0.4.16) (2021-08-13)


### Features

* 新增 GridFS 文件存储方式； ([0ddc915](https://github.com/labring/laf/commit/0ddc9151a437fe7be17c5eae972a0786a6966c38))



## [0.4.15](https://github.com/labring/laf/compare/v0.4.14...v0.4.15) (2021-08-10)


### Bug Fixes

* **devops-admin:** 新增 @types/node 为默认加载类型包以增强提示； ([d282522](https://github.com/labring/laf/commit/d282522c7ac2e59db43966f409c79502e93cbba0))
* **devops-server:** 修复预置云函数 init-app-rbac 以适配新 API； ([d91de4a](https://github.com/labring/laf/commit/d91de4abd7c55957dea67e3fe6fef4d51bc41ae8))
* **node-modules-utils:** 修复部分包 typings 与 types 字段使用不一致的问题； ([96f952d](https://github.com/labring/laf/commit/96f952d74629f224c22c3fde001007b8dff43522))



## [0.4.14](https://github.com/labring/laf/compare/v0.4.13...v0.4.14) (2021-08-09)


### Bug Fixes

* 修复应用远程部署时未清理被删函数的触发器导致的 app error; ([cd151c2](https://github.com/labring/laf/commit/cd151c22df08b66137bd5c51efd5f1f809255dcb))



## [0.4.13](https://github.com/labring/laf/compare/v0.4.12...v0.4.13) (2021-08-09)


### Bug Fixes

* 修复 function_history 集合名 未跟随后端更新错误； ([0568b08](https://github.com/labring/laf/commit/0568b086521b5f3674d2f563aed60ca9f0e7fe5c))



## [0.4.12](https://github.com/labring/laf/compare/v0.4.11...v0.4.12) (2021-08-09)


### Bug Fixes

* 针对后端调整，修改控制台 devops db 集合名称；优化部分页面交互体验； ([fa88671](https://github.com/labring/laf/commit/fa8867124ebf8c322731c95f51f9ae746f429cc7))



## [0.4.11](https://github.com/labring/laf/compare/v0.4.10...v0.4.11) (2021-08-09)


### Bug Fixes

* 修复菜单权限显示；优化体验； ([cf3eefb](https://github.com/labring/laf/commit/cf3eefb0485db9e73676249e21c077f0e612a5ea))
* 修复发布、部署资源时事务使用错误； ([b1c350a](https://github.com/labring/laf/commit/b1c350a72e9705012ba427739b553be7fe973c5a))
* 修复开发控制台 IDE 默认无 mongodb 类型提供的问题； ([e75ae8c](https://github.com/labring/laf/commit/e75ae8cf95b1275e74f7e580910fdb20879f1552))



## [0.4.10](https://github.com/labring/laf/compare/v0.4.9...v0.4.10) (2021-08-07)


### Bug Fixes

* 修复部署面板内容多时无法滚动的问题； ([0cf8d83](https://github.com/labring/laf/commit/0cf8d8378942e2f96614aaafbcdea2691d683cb1))
* 修复部署时 _id 未转为 ObjectId 的问题； ([0483301](https://github.com/labring/laf/commit/04833012d03efa691042aa0ff6ff5f013cbb8dd1))



## [0.4.9](https://github.com/labring/laf/compare/v0.4.8...v0.4.9) (2021-08-07)


### Features

* 新增触发器远程推送部署； ([99f027b](https://github.com/labring/laf/commit/99f027b0c64aecfdb1927cb87c23ef54dc3d1c97))
* **fix:** 新增触发器远程推送部署，远程推送改为保持 _id 一致的方式； ([655792c](https://github.com/labring/laf/commit/655792c9a6262a79fe3b69369a26ac1a582ba48a))



## [0.4.8](https://github.com/labring/laf/compare/v0.4.7...v0.4.8) (2021-08-07)


### Features

* 实现远程部署令牌、推送、接收、应用功能； ([afeb9ec](https://github.com/labring/laf/commit/afeb9ecbc0437f8ecc9f3eedddd77df8d27e27b5))
* 实现远程部署推送、接收、应用功能； ([281cf28](https://github.com/labring/laf/commit/281cf286e0185af309c90b104cfd1d543085f554))



## [0.4.7](https://github.com/labring/laf/compare/v0.4.6...v0.4.7) (2021-08-06)


### Bug Fixes

* 修复预置函数 admin-edit 的标识错误； ([96f588e](https://github.com/labring/laf/commit/96f588e87c7d079cd255dca28c4f84f3b97a9d2a))
* 修复IDE快捷键监听未销毁的问题； ([cacb1c0](https://github.com/labring/laf/commit/cacb1c05f70eb3caf48c27b13d696a9a4c95277d))
* 优化 devops 控制台交互体验、样式、延长请求超时时间到 60秒； ([b3ea99f](https://github.com/labring/laf/commit/b3ea99f8a452a8a0849a849823e724772ec897f7))



## [0.4.6](https://github.com/labring/laf/compare/v0.4.5...v0.4.6) (2021-08-06)


### Bug Fixes

* 修复 tag 页面缓存不生效；去除页面切换动画； ([f8a94c8](https://github.com/labring/laf/commit/f8a94c8f800ff2726c3d510593b070b1c9d2f38d))
* 修复页面缓存时，函数调试页快捷键重复绑定问题； ([1a26cf3](https://github.com/labring/laf/commit/1a26cf3d10c183339e3bbe0746ceda5e6eecfd92))
* 优化页面布局，去除面包屑，腾出更多页面空间等； ([55c3a44](https://github.com/labring/laf/commit/55c3a447873c40568027ef7fceed05f18c976aea))



## [0.4.5](https://github.com/labring/laf/compare/v0.4.4...v0.4.5) (2021-08-05)



## [0.4.4](https://github.com/labring/laf/compare/v0.4.3...v0.4.4) (2021-08-05)



## [0.4.3](https://github.com/labring/laf/compare/v0.4.2...v0.4.3) (2021-08-05)



## [0.4.2](https://github.com/labring/laf/compare/v0.4.1...v0.4.2) (2021-08-04)


### Features

* 支持保存和使用云函数调试令牌 ([ac237ef](https://github.com/labring/laf/commit/ac237efd8827ad91b441588dbf98116e1211add9))
* 支持登陆时发放云函数调试令牌；支持配置 token 过期时间； ([2b33cc4](https://github.com/labring/laf/commit/2b33cc4f3fcd7eb3c806ed26f5e6929e6f96e78e))
* 支持云函数调试请求令牌 ([57dedc9](https://github.com/labring/laf/commit/57dedc9d41bc0e9c5d7cf0d4dce2ab4d6970f5e4))



## [0.4.1](https://github.com/labring/laf/compare/v0.4.0...v0.4.1) (2021-08-04)


### Bug Fixes

* 修复无法删除函数的问题； ([ff0d855](https://github.com/labring/laf/commit/ff0d855d21ceb65f5b734be58882d79fb2d37bc8))
* rename the client title; ([cf49d40](https://github.com/labring/laf/commit/cf49d4037dc8d845d9c821d28cab6daaa38f1bd3))



# [0.4.0](https://github.com/labring/laf/compare/v0.1.5...v0.4.0) (2021-08-03)


### Bug Fixes

*  cloud-function 包名不给发布，重命名； ([2c955c5](https://github.com/labring/laf/commit/2c955c57f2fd9330a35f773d7be910a3955253a6))
* 补提交，去除 dbm router 的引用； ([696ed7f](https://github.com/labring/laf/commit/696ed7f80932c0f2bcacb7a59ffefdfab8227bab))
* 处理数据操作触发器参数中 _id 类型不为 string 的问题； ([9360fa8](https://github.com/labring/laf/commit/9360fa8a6a02d70cca0a3218b14c1523b5e15f6b))
* 更新 less-api 版本，增加云函数变量 cloud 代替 less； ([b420bfa](https://github.com/labring/laf/commit/b420bfa7ad8cbe730560e49b98420404a46b868f))
* 恢复函数调试调用、增加触发器调用编译功能； ([0eb8163](https://github.com/labring/laf/commit/0eb81631d6624f2b1e3e292bc400bf733500f3ce))
* 将‘创建内部SDK包’的命令分离出来，在构建 docker 镜像时要单独用到； ([321b2f0](https://github.com/labring/laf/commit/321b2f0051c552451b2bc70869ca69c3f5ad1d48))
* 修复 policy 为不存在时错误，返回404 ([f00ddba](https://github.com/labring/laf/commit/f00ddbaae6fb007df8646d5221d9414ae9841e7d))
* 修复 trigger 函数日志 _id 类型问题；导出 编译函数； ([e0fab5b](https://github.com/labring/laf/commit/e0fab5b1addb3f9f45e93b6842193548bdb0ddc8))
* 修复获取触发器时未控制状态的问题； ([6dca01a](https://github.com/labring/laf/commit/6dca01a39df3154886b6d67a52d9b2e7c8af933f))
* 修复引用 cloud-functin-engine 路径错误； ([a8e49cc](https://github.com/labring/laf/commit/a8e49cc11aaf0748652f4e0fa5f8e19dffe84cbf))
* 修复云函数调用错误返回状态码； ([145fdcd](https://github.com/labring/laf/commit/145fdcd98cb8469a424d7e9a1a65e626db86da0b))
* 修改 policy injector_func 函数入参； ([4b80766](https://github.com/labring/laf/commit/4b80766823ef0c18b1bf0d806d89f44354834143))
* 已暂时恢复云函数的调试接口（未做鉴权） ([23d359e](https://github.com/labring/laf/commit/23d359ea368af0559a4bfbcdb823d1f8b5d1bbde))
* 增加 cloud-function-engine 包默认类型加载； ([315f7e9](https://github.com/labring/laf/commit/315f7e9f4598d134475db03855f71bfbcb3fa587))
* add default tag for builtin cloud functions ([fdf297b](https://github.com/labring/laf/commit/fdf297bbb7692a91566d18c35db46b83f6389a91))
* fix deploy apis' result data; ([e9c0aac](https://github.com/labring/laf/commit/e9c0aac9f153f34acf607a57d2d15e181e4b85e8))
* fix docker-build.js bugs; ([ca12167](https://github.com/labring/laf/commit/ca121672d7a1f848affb2003f51934618d61ee85))
* fix type error ([270f766](https://github.com/labring/laf/commit/270f7662f1217dd66ba5a6a163e131889eba6cb8))
* **func engine:** fix func engine bug; ([e6fa812](https://github.com/labring/laf/commit/e6fa8121dc70d92222b52ed81505423d3157b8cd))
* **function engine:** 重新使用旧引擎，解决新引擎内存泄露问题；支持 ts 函数编译； ([ff468f9](https://github.com/labring/laf/commit/ff468f97513d7039d02f2c713916b280d644146e))
* package node-modules-utils publish: missing dist ([9c8fb0b](https://github.com/labring/laf/commit/9c8fb0bb080088e6d0b42806d11d24e258410179))
* **spell:** fix spell error; ([31a93c5](https://github.com/labring/laf/commit/31a93c5e4d41b6a9ac3c5c7515a7396a7cccad23))
* update app rules; ([4167cab](https://github.com/labring/laf/commit/4167cabac7f897dcc79eb118498abb018c836a3e))
* update sys rules; ([a3f4a9a](https://github.com/labring/laf/commit/a3f4a9a158f08ca2b6284b6729eca40e91059fb6))
* update token split method ([c43ecee](https://github.com/labring/laf/commit/c43ecee26551b2778599662c98690c52138793a0))


### Features

* 实现 通用 db proxy entry，重构 policy 加载方式；实现 policy agent； ([b8f64aa](https://github.com/labring/laf/commit/b8f64aa77a3151df401a5fe3fdebe1ee26d6ca7a))
* 实现 npm 包类型声明解析、服务接口；重构项目结构，使用 lerna 管理； ([1dc91d2](https://github.com/labring/laf/commit/1dc91d2cd9934cc17abf5748304f4485a7621f53))
* 实现触发器配置变更时，更新调度器任务； ([1d8dbe5](https://github.com/labring/laf/commit/1d8dbe5f1624fd69f703f587e80dd7ad0b386219))
* 实现云函数 SDK 单独依赖包； ([e3d89b1](https://github.com/labring/laf/commit/e3d89b196c10c72e3b08aa5a04fc1f52c169a7e9))
* 实现云函数的部署； ([82b0783](https://github.com/labring/laf/commit/82b0783653f11f79dabab43816a934f3205e1417))
* 实现云函数与触发器的部署脚本； ([0a8ef9e](https://github.com/labring/laf/commit/0a8ef9ee23dcb8ac4ceb41b0d20b4968fb35f970))
* 实现云函数与触发器自动部署到 app db；修改文档； ([3ea4713](https://github.com/labring/laf/commit/3ea471394fa60e99eb947d926b758c1a6fc4e7ef))
* 新增 dbm entry，负责 app db 的数据管理； ([f7ddae3](https://github.com/labring/laf/commit/f7ddae3cbc68b3f2b3416bf700acc38b794778b7))
* 新增部署访问策略接口, 修改 http 测试用例； ([fbcdb90](https://github.com/labring/laf/commit/fbcdb90d7992c29fbd273b9c9ba4df417184da34))
* 新增发布函数、触发器接口；取消 watch 监听发布；支持发布时编译云函数； ([ba2e538](https://github.com/labring/laf/commit/ba2e538c19b1298b774196a9911f83545506e2f5))
* 新增访问策略管理页面，修复访问规则添加和删除的bug； ([06f0a2a](https://github.com/labring/laf/commit/06f0a2a44a8316cb54c7abfefeb23bfa863aa478))
* 修改初始化脚本，增加部署访问策略初始脚本； ([3840270](https://github.com/labring/laf/commit/38402704a9d1dc0e742b92288961e90e1336fad8))
* 用 mongodb watch 实现数据监听机制；实现访问策略部署后自动应用； ([0650d2e](https://github.com/labring/laf/commit/0650d2e2749e012bd7eca394bd6e661ac914f982))
* 增加 create 函数； ([cdafdb1](https://github.com/labring/laf/commit/cdafdb13aa38bbace1e315e10eb7a5938296acb7))
* 增加与平台无关的构建命令脚本；修改 nmutils 包，支持 fs/promises ([68615ff](https://github.com/labring/laf/commit/68615ff37db6eeae9c4d66939c5cc0702eee26ed))
* 支持 devops 初始化时创建云函数预置触发器 ([c1b1dde](https://github.com/labring/laf/commit/c1b1dde30f5192266c56d4f1779cad6634255298))
* add builtin function: injector-admin; ([de48feb](https://github.com/labring/laf/commit/de48feba7a71c65a4989bc177052557b886b38c8))
* add laf-devops-admin packages; ([4f95a45](https://github.com/labring/laf/commit/4f95a4540ec234287556d7684b3762ea2574e8ba))
* add query params to trigger ctx ([1280817](https://github.com/labring/laf/commit/128081748a9506324c32b37e867ce1f3a337d276))



## [0.1.5](https://github.com/labring/laf/compare/19648acace83afe9e45c2345964b03894e8629aa...v0.1.5) (2021-07-05)


### Bug Fixes

*  remove useless log; ([11f2988](https://github.com/labring/laf/commit/11f2988cf281ade3f8275ceed17cef2969c25061))
* 补充 less-api 依赖； ([ebbeb8c](https://github.com/labring/laf/commit/ebbeb8cc41d99c61820722d66426e861d49cf337))
* 去除 function_logs.requestId 的唯一索引； ([68ce1e8](https://github.com/labring/laf/commit/68ce1e8a0a6702627008dbb6d7b9e2c638e0438f))
* 完善 admin rules 中删除相关表的规则 ([83e8818](https://github.com/labring/laf/commit/83e881828b540df5f3d35f0692311229b9ffbfe8))
* 完善 trigger.delete 访问规则； ([502d6f1](https://github.com/labring/laf/commit/502d6f1047fbd5a6e0ed9090cf132467e449a240))
* 修复 init 指令修复错误的问题； ([6f1b466](https://github.com/labring/laf/commit/6f1b466268b09ede0cd36d7f5d7c54a93542eec1))
* 修复触发器 last_exec_time 字段为空时的问题； ([f3b5ada](https://github.com/labring/laf/commit/f3b5ada637cad656fcd59762c783917dd0e10efe))
* 修复登陆注册 token 过期时间错误；更新 http 用例； ([3cd5277](https://github.com/labring/laf/commit/3cd5277cc34a6ae6f38e16d94be14caad1db071e))
* 修改 builtin cloudfunction sig ([f379369](https://github.com/labring/laf/commit/f379369406fa3b9f67d86e1a10df857860ef3fbd))
* 优化云函数调用返回结构； ([ea8e4a1](https://github.com/labring/laf/commit/ea8e4a1d7cdb54a35607595643d32108d46e6912))
* **deps:** add typescript package to dev env ([ce3ed49](https://github.com/labring/laf/commit/ce3ed496350cef4ed8dd4cf559d57a93a4e10f4d))
* **init:** add rules & permission to init.js ([0107f03](https://github.com/labring/laf/commit/0107f03ec1cc491c138b343d688a295c63c91933))
* remove ali secrets ([82a47d6](https://github.com/labring/laf/commit/82a47d6e20a5510862d553180a23931ecc928f99))
* remove wxmp app secret ([4671c36](https://github.com/labring/laf/commit/4671c3676ea13e0cee5f9115f810389f8952db90))


### Features

* **:sip:** add dotenv , add .env file； ([098ba91](https://github.com/labring/laf/commit/098ba91f4b7d745866d226640ddd2909cb7981b9))
* 去除 上传文件到 public 时的验证；增加 mongodb 对象到云函数环境； ([f266655](https://github.com/labring/laf/commit/f26665521f9a84016ca41a744829dfa4f0033ebb))
* 新增实现指定一个触发器的调度更新（接口和功能）； ([8e3dbcf](https://github.com/labring/laf/commit/8e3dbcf5b48124aacd62e4c4c39ec3e0c9f6c4c9))
* 新增文件上传 built-in 云函数； ([9834018](https://github.com/labring/laf/commit/98340185fcd249ab92ab3b5709e2c8ba1a0e0b0c))
* 优化简化 entry 和 trigger 配置代码；忽略读取数据事件； ([fe06c74](https://github.com/labring/laf/commit/fe06c74abe1be3d0fbdbc93b24f9aca6a12b9b28))
* 云函数支持 http和停启控制；新增函数编辑历史规则； ([56cfa8e](https://github.com/labring/laf/commit/56cfa8e30952fe2ee7553be8581476760e966dec))
* 云函数支持 method 参数； ([560f4e8](https://github.com/labring/laf/commit/560f4e834f141ae52893f940845f3198d94bfcb7))
* 云函数支持文件上传，支持 headers 参数传入； ([f0c04ab](https://github.com/labring/laf/commit/f0c04ab1315bfd0701472c15951ff627bc7ed8ba))
* 增加跨云函数的全局配置对象； ([8f753b8](https://github.com/labring/laf/commit/8f753b8f5e6e95f128e9d617dda46bc8aea2df76))
* 增加dbm 获取集合列表； ([20693c7](https://github.com/labring/laf/commit/20693c7352a9ead0fb6baaa5a4e30f5c2ebb0162))
* dbm 实现删除与创建集合索引接口； ([405dfce](https://github.com/labring/laf/commit/405dfced1bf3c1ec4d49b15df68101b484895d0e))
* dbm 新增获取集合索引信息； ([fd1d96c](https://github.com/labring/laf/commit/fd1d96c263a426e7324e6ef6a25ddb01fcfa08ef))
* **enhance:** cloud function enhance less object ([19648ac](https://github.com/labring/laf/commit/19648acace83afe9e45c2345964b03894e8629aa))
* **file:** 重构LSF 文件管理方式；新增文件访问令牌云函数；修复文件API安全漏洞； ([164ab59](https://github.com/labring/laf/commit/164ab5995994a8e81882ef36e9a06799db1c3899))
* **fix:** 修复云函数上传文件bug；引入 jwt 库；增加云函数参数; ([c28db5d](https://github.com/labring/laf/commit/c28db5dab38c5e812d030536cebd5744b82aad79))
* **init:** 支持内置云函数的导入；增加用户登陆注册、小程序授权、阿里云发短信等内置云函数 ([8c4b0ec](https://github.com/labring/laf/commit/8c4b0ecc67e64e6f56f8bf9f8e3d6fc2d3e3983d))




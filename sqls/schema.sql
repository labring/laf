CREATE TABLE `admin` IF NOT EXISTS(
  `uid` int NOT NULL COMMENT 'Base User Id',
  `username` varchar(64) NOT NULL COMMENT 'Admin Username',
  `created_at` int DEFAULT NULL COMMENT 'Created time',
  `updated_at` int DEFAULT NULL COMMENT 'Updated time',
  PRIMARY KEY (`uid`),
  UNIQUE KEY `username` (`username`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COMMENT = 'User';
DROP TABLE IF EXISTS base_user;
CREATE TABLE `base_user` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'primary key',
  `password` varchar(64) NOT NULL COMMENT 'Password',
  `created_at` int DEFAULT NULL COMMENT 'Created time',
  `updated_at` int DEFAULT NULL COMMENT 'Updated time',
  PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 2 DEFAULT CHARSET = utf8 COMMENT = 'User';
DROP TABLE IF EXISTS permission;
CREATE TABLE `permission` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'primary key',
  `name` varchar(32) NOT NULL COMMENT 'Unique Name',
  `label` varchar(64) NOT NULL COMMENT 'Display Name',
  `description` varchar(255) DEFAULT NULL COMMENT 'Description',
  `created_at` int DEFAULT NULL COMMENT 'Created time',
  `updated_at` int DEFAULT NULL COMMENT 'Updated time',
  `created_by` int DEFAULT NULL COMMENT 'Author id',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COMMENT = 'Permission';
DROP TABLE IF EXISTS role;
CREATE TABLE `role` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'primary key',
  `name` varchar(32) NOT NULL COMMENT 'Unique Name',
  `label` varchar(64) NOT NULL COMMENT 'Display Name',
  `description` varchar(255) DEFAULT NULL COMMENT 'Description',
  `created_at` int DEFAULT NULL COMMENT 'Created time',
  `updated_at` int DEFAULT NULL COMMENT 'Updated time',
  `created_by` int DEFAULT NULL COMMENT 'Author id',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COMMENT = 'Permission';
DROP TABLE IF EXISTS role_permission;
CREATE TABLE `role_permission` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'primary key',
  `role_id` int NOT NULL COMMENT 'Role Id',
  `permission_id` int NOT NULL COMMENT 'Permission Id',
  `created_at` int DEFAULT NULL COMMENT 'Created time',
  `created_by` int DEFAULT NULL COMMENT 'Author id',
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COMMENT = 'Role Permission Relation';
DROP TABLE IF EXISTS uesr_auth_bind;
CREATE TABLE `uesr_auth_bind` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'primary key',
  `uid` int NOT NULL COMMENT 'User Id',
  `type` varchar(32) NOT NULL COMMENT '授权绑定类型：wx-mp 微信小程序, wx-ofa 微信公众号, wx-app 微信开放平台 App',
  `open_id` varchar(64) NOT NULL COMMENT '授权绑定 Open Id',
  `app_id` varchar(64) DEFAULT NULL COMMENT 'App Id',
  `union_id` varchar(64) DEFAULT NULL COMMENT 'Union Id',
  `created_at` int DEFAULT NULL COMMENT 'Created time',
  `updated_at` int DEFAULT NULL COMMENT 'Updated time',
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COMMENT = 'User Auth Bind';
DROP TABLE IF EXISTS user;
CREATE TABLE `user` (
  `uid` int NOT NULL COMMENT 'Base User Id',
  `username` varchar(64) NOT NULL COMMENT 'Username',
  `created_at` int DEFAULT NULL COMMENT 'Created time',
  `updated_at` int DEFAULT NULL COMMENT 'Updated time',
  PRIMARY KEY (`uid`),
  UNIQUE KEY `username` (`username`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COMMENT = 'User';
DROP TABLE IF EXISTS user_profile;
CREATE TABLE `user_profile` (
  `uid` int NOT NULL COMMENT 'Base User Id',
  `nickname` varchar(64) DEFAULT NULL COMMENT 'Nick Name',
  `email` varchar(128) DEFAULT NULL COMMENT 'Email',
  `phone` varchar(128) DEFAULT NULL COMMENT 'Phone Number',
  `avatar` varchar(256) DEFAULT NULL COMMENT 'Avator',
  `created_at` int DEFAULT NULL COMMENT 'Created time',
  `updated_at` int DEFAULT NULL COMMENT 'Updated time',
  PRIMARY KEY (`uid`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COMMENT = 'User';
DROP TABLE IF EXISTS user_role;
CREATE TABLE `user_role` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'primary key',
  `user_id` int NOT NULL COMMENT 'User Id',
  `role_id` int NOT NULL COMMENT 'Role Id',
  `created_at` int DEFAULT NULL COMMENT 'Created time',
  `created_by` int DEFAULT NULL COMMENT 'Author id',
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COMMENT = 'User Role Relation';
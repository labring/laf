---
title: laf-cli Command Line Tool
---

# {{ $frontmatter.title }}

## Introduction

`laf-cli` enables you to sync your web development with the web platform, allowing you to be more efficient using your familiar development tools.

Let's first take a look at all the operations provided by the cli.
![](../../doc-images/cli-mind.png)

## Installation

```shell
# Requires node version >= 16
npm i laf-cli -g
```

The main function of the cli is to integrate the operations on the laf web platform into the command line. Let's demonstrate each operation based on the web platform's operations.

## Login

To perform the login operation, we need to obtain our Personal Access Token (PAT).

![](../../doc-images/creat-token.png)

By default, it logs in to `laf.run`. If you want to log in to `laf.dev` or a privately deployed instance of laf, or another `laf.run` account, you can add a user:

```shell
laf user add dev -r https://laf.dev
laf user switch dev
laf user list
laf login [pat]
```

### Logout

```shell
laf logout
```

## App

After logging in on the web platform, we will see our app list. To view the app list in the cli, simply execute the following command.

```shell
laf app list
```

### Initialize an App

To initialize an app, we need the appid, which can be obtained from the web platform homepage.  
Here's a brief explanation: initializing an app means generating template files in the directory where you run this command. By default, the template files are empty. If you want to sync the web platform's content, add `-s` flag.
::: tip
It is recommended to try this command in an empty directory.
:::

```shell
laf app init [appid]
```

## Dependencies

We can pull the dependencies from the web platform to the local environment using the `pull` command, and then run `npm i` to install them.

```shell
laf dep pull
```

If we want to add a dependency, we can use `add`. Note that adding a dependency here means adding it both on the web platform and locally. After adding, you can use `npm i` to use it.

```shell
laf dep add [dependencyName]
```

If our dependency file, or the entire local files, are copied from elsewhere, we can use the `push` command to install all the dependencies in the `dependency.yaml` file to the web platform.

```shell
laf dep push
```

## Cloud Functions

Create a new cloud function. This command creates the cloud function both locally and on the web platform.

```shell
 laf func create [funcName]
```

Delete a cloud function. Same as creating, deleting a cloud function is performed both locally and on the web platform.

```shell
laf func del [funcName]
```

List cloud functions.

```shell
laf func list
```

Pull the web platform's cloud function code to the local environment.

```shell
laf func pull [funcName] 
```

Push the local cloud function code to the web platform.

```shell
laf func push [funcName] 
```

Execute a cloud function. The execution result will be printed on the command line, while the logs need to be viewed on the web platform.

```shell
laf func exec [funcName]
```

## Storage

List buckets.

```shell
laf storage list
```

Create a new bucket.

```shell
laf storage create [bucketName]
```

Delete a bucket.

```shell
laf storage del [bucketName]
```

Update bucket permissions.

```shell
laf storage update [bucketName]
```

Download files from a bucket to the local environment.

```shell
laf storage pull [bucketName] [outPath]
```

Upload local files to a bucket.

```shell
laf storage push [bucketName] [inPath]
```

## Access Policies

List all access policies.

```shell
laf policy list
```

Pull access policies to the local environment. The `policyName` parameter is optional. If not provided, it pulls all policies.

```shell
laf policy pull [policyName] 
```

Push access policies to the web platform. The `policyName` parameter is optional. If not provided, it pushes all policies.

```shell
laf policy push [policyName]
```

## Website Hosting

View the hosting list.

```shell
laf website list
```

Enable website hosting, this command enables website hosting for [bucketName].

```shell
laf website create [bucketName]
```

Disable website hosting, this command disables website hosting for [bucketName].

```shell
laf website del [bucketName]
```

Customize domain name, this command sets a custom domain for the [bucketName] with website hosting enabled.

```shell
laf website custom [bucketName] [domain]
```

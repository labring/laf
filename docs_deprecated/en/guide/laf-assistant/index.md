---
title: Laf Assistant
---

# {{ $frontmatter.title }}

`Laf Assistant` is developed by the former community user "Bai Ye" out of interest. It is built on top of `laf-cli`.

For more details, please refer to: [Laf Assistant: Cloud Development Has Never Been This Easy!](https://mp.weixin.qq.com/s/SueTSmWFXDySaRSx3uAPIg)

## Installation

Search for `Laf Assistant` in the `VSCode` application or click the link to [install online](https://marketplace.visualstudio.com/items?itemName=NightWhite.laf-assistant).

:::tip
To use `Laf Assistant`, a minimum Node version of 18 is required.

node version >= 18
:::

## Modifying VSCode Settings

Search for `typescript.preferences.importModuleSpecifier` in the settings and change it to `non-relative`.

## Initialization

Create a new directory named `laf-cloud` in your frontend project that is connected to Laf Cloud Development.

Right-click on the `laf-cloud` directory and select "Login".

You will need to configure the relevant information of the Laf application, including `apiurl`, `pat`, and `appid`.

- For `apiurl`, add `api` before the Laf website URL you are currently logged into. For example: `https://api.laf.dev`

- For `pat`, refer to the [laf-cli documentation](/guide/cli/#登录) for the way to obtain it.

- For `appid`, refer to the [Web IDE introduction](/guide/web-ide/#应用管理) for the Laf application's appid.

:::warning
By default, `Laf Assistant` will automatically install `laf-cli`. If the automatic installation fails, you can [manually install laf-cli](/guide/cli/#安装).
:::

After filling in all the information, right-click on the `laf-cloud` directory again and select "Login" to login with the provided credentials. You will see a successful login notification in the bottom right corner.

Once logged in, continue by right-clicking on the `laf-cloud` directory and selecting "Initialize". This will complete the initialization process.

:::warning
After successful initialization, many files will be created in the `laf-cloud` directory. Please do not delete them randomly.
:::

## Synchronize Online Dependencies

The dependencies installed in the Laf application can be downloaded locally by synchronizing the online dependencies. This is only for the convenience of viewing code hints during development and is not necessary for compilation or code execution. You can synchronize again if new dependencies are added online.

## Publish/Download All Cloud Functions

After logging in and initializing, right-click on the `laf-cloud` folder and select "Publish/Download All Cloud Functions".

## Add New Cloud Function

Right-click on the `laf-cloud` folder and select "Add New Cloud Function".

## Managing Individual Cloud Functions

Open the `laf-cloud/functions` directory and open any cloud function file. Right-click in the editor window to perform actions such as "Publish/Download/Run" the current cloud function. You can also customize keyboard shortcuts in the `VSCode` settings for easier operation.

## Other Features

Other features of `laf-cli` have not been added yet. You can check them by typing `laf -h` in the terminal or directly refer to the [laf-cli documentation](/guide/cli/).
---
title: Dependency Management
---

# {{ $frontmatter.title }}

During application development, there is often a need to add `npm` dependencies. Laf provides an online visualization method for managing these third-party package modules, allowing users to easily search, install, upgrade, and uninstall them.

::: warning
Laf cloud development can install dependencies from <https://www.npmjs.com/>. If the required dependencies cannot be found on this website, they cannot be installed.
:::

## Adding Dependencies

![add-packages](/doc-images/add-packages.png)

As shown in the above image, we click on `NPM Dependency` at the bottom left of the screen, then click on the Add button, search for the package name that you want to install (in this example, we use [moment](https://www.npmjs.com/package/moment)), check the checkbox, and click on the `Save and Restart` button.

> The installation time will vary depending on the size of the package and the network conditions. Please be patient and wait for it to complete.

![package-list](/doc-images/package-list.png)

After installation, users can view the installed dependencies and their versions in the `Dependency Management` section at the bottom left of the interface.

## Selecting Dependency Versions

![select-package-version](/doc-images/select-package-version.png)

To ensure the stability of the user's application, Laf does not automatically update the version of the installed `Npm packages`.

By default, when adding a dependency, the latest version (`latest`) is selected. If the user wants to specify a version, they can choose the corresponding version from the version dropdown during installation.

## Using in Cloud Functions

After installation, the package can be imported and used in cloud functions. For example, create a cloud function called `hello-moment` and modify the code as follows:

```typescript
import cloud from '@lafjs/cloud'
import moment from 'moment'

export async function main(ctx: FunctionContext) {
  const momentVersion = moment.version
  const now = moment().format('YYYY-MM-DD hh:mm:ss')
  const twoHoursLater = moment().add(2, 'hours').format('YYYY-MM-DD hh:mm:ss')
  
  return { momentVersion, now, twoHoursLater}
}
```

Click the Run button on the right side of the interface or press `Ctrl + S` to save. You will see the following output:

```json
{
  "momentVersion": "2.29.4",
  "now": "2023-02-08 02:14:05",
  "twoHoursLater": "2023-02-08 04:14:05"
}
```

## Switching Installed Dependency Versions

![change-package-version](/doc-images/change-package-version.png)

## Uninstalling installed dependencies

![delete-package](/doc-images/delete-package.png)
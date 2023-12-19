---
title: Introduction to Cloud Functions
---

# {{ $frontmatter.title }}

## Overview of Cloud Functions

`Laf Cloud Functions` are JavaScript code that runs in the cloud.

Cloud functions can be written in TypeScript/JavaScript and do not require server management. They can be written, debugged, and saved online in the Web Development Console.

With Laf Cloud Functions, you can quickly develop backend code without the need to purchase or manage servers. It also comes with a built-in database and object storage, greatly reducing the difficulty of backend development.

Each cloud function is a separate TypeScript file. Laf provides the `@lafjs/cloud` module specifically for cloud functions, making it more convenient to write them.

## Creating Cloud Functions

After creating and entering the Laf application, click the "Functions" button on the top left of the page, then click the plus sign to add a cloud function.

![create-function](/doc-images/create-function.png)

**Function Name**: Can use letters, numbers, "-", "_", ".". Function names must be unique.

**Tags**: Used for classification and management. Cloud functions can be filtered by tag name. Multiple tags can be set for each cloud function.

**Request Method**: Only selected request methods are allowed.

**Function Description**: Helps to understand the functionality of the cloud function, similar to comments or remarks.

**Function Template**: Choosing different function templates initializes different code.

## Editing Cloud Functions

Laf comes with a Web IDE that allows you to edit, run (debug), and deploy cloud functions directly in the browser.

![edit-cloudfunction](/doc-images/edit-cloudfunction.png)

## Running Cloud Functions

Cloud functions can be directly executed and debugged after being written. Unpublished cloud functions can also be tested here.

![run-cloudfunction](/doc-images/run-cloudfunction.png)

If you add code with `console.log` to print logs in the cloud function, it will be displayed directly in the Console console when running. The return value of the cloud function will also be printed in the execution result.

You can switch request methods and configure request parameters here. The default is a `GET` request. The displayed request method depends on the selected request method(s).

## Publish Cloud Function

Once the cloud function is published, it will become effective and can be requested by the frontend.

::: danger
**Any code modifications made to the cloud function will be automatically cached in the current browser and will only be saved and take effect after publishing!**
:::

![publish-cloudfunction](/doc-images/publish-cloudfunction.png)

On the publish page, the left side displays the previously published code, while the right side displays the code that is about to be published. This allows for easy comparison of the code differences to check if publishing is necessary.
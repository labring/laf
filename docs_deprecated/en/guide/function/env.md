---
title: Using Environment Variables in Cloud Functions
---

# {{ $frontmatter.title }}

## Adding Environment Variables

1. First, click on the small gear button at the bottom left corner of the page to open the application settings page.
2. Next, in the popped-up application settings interface, click on "Environment Variables" and enter your environment variable on a new line below. The format should be: `NAME='value'`
3. Click on "Update" to make it effective.

## Using Environment Variables

Once the environment variables are added, you can use them in any cloud function by accessing `process.env`.

:::tip
`cloud.env` is deprecated.
:::

```typescript
import cloud from '@lafjs/cloud'

export async function main(ctx: FunctionContext) {
  
    const env = process.env
    console.log(env)
    // All the environment variables are available in process.env
}
```
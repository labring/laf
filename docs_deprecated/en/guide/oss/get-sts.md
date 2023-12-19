---
title: Generate Temporary Tokens for Cloud Storage (STS)
---

# {{ $frontmatter.title }}

To request cloud storage from places outside of the frontend or cloud function environment, a temporary token called STS is required. The following cloud function can directly request and obtain a STS temporary token.

## Install Dependencies

Install the `@aws-sdk/client-sts` dependency (restart the application for it to take effect).

## Create the `get-oss-sts` Cloud Function

Create the cloud function `get-oss-sts` and add the following code:

```typescript
import cloud from "@lafjs/cloud";
import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";

export default async function (ctx: FunctionContext) {
  const sts: any = new STSClient({
    region: process.env.OSS_REGION,
    endpoint: process.env.OSS_INTERNAL_ENDPOINT,
    credentials: {
      accessKeyId: process.env.OSS_ACCESS_KEY,
      secretAccessKey: process.env.OSS_ACCESS_SECRET,
    },
  });

  const cmd = new AssumeRoleCommand({
    DurationSeconds: 3600,
    Policy:
      '{"Version":"2012-10-17","Statement":[{"Sid":"Stmt1","Effect":"Allow","Action":"s3:*","Resource":"arn:aws:s3:::*"}]}',
    RoleArn: "arn:xxx:xxx:xxx:xxxx",
    RoleSessionName: cloud.appid,
  });

  const res = await sts.send(cmd);

  return {
    credentials: res.Credentials,
    endpoint: process.env.OSS_EXTERNAL_ENDPOINT,
    region: process.env.OSS_REGION,
  };
};
```

> Save and publish the cloud function to make it accessible.

## Accessing Cloud Storage with STS Tokens in Front-end

@see [Accessing Cloud Storage with STS Tokens in Front-end](use-sts-in-client.md)
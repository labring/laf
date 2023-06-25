---
title: Server Docking
---

# {{ $frontmatter.title }}

## Create Docking Cloud Function

You can name it as you like. The sample code provided here is for plaintext access, so you don't need to fill in the "Message Encryption Key".

:::tip
The toXML method is applicable to all WeChat subscription accounts and service accounts.

Authenticated subscription accounts and service accounts can also use the custom message function to reply to messages.
:::

```typescript
// Import crypto and cloud modules
import * as crypto from 'crypto';
import cloud from '@lafjs/cloud';

// Handle incoming WeChat Official Account messages
export async function main(event) {
  const { signature, timestamp, nonce, echostr } = event.query;
  const token = process.dev.WECHAT_TOKEN;

  // Verify the legitimacy of the message, return an error message if illegitimate
  if (!verifySignature(signature, timestamp, nonce, token)) {
    return 'Invalid signature';
  }

  // If it is the first verification, return echostr to the WeChat server
  if (echostr) {
    return echostr;
  }

  // Handle the incoming message
  const payload = event.body.xml;
  console.log("receive message:", payload)
  // Text message
  if (payload.msgtype[0] === 'text') {
    const newMessage = {
      msgid: payload.msgid[0],
      question: payload.content[0].trim(),
      username: payload.fromusername[0],
      sessionId: payload.fromusername[0],
      createdAt: Date.now()
    }
    // Reply with text, this is just a demo, the reply will be the same as the received message
    const responseText = newMessage.question
    return toXML(payload, responseText);
  }

  // For other cases, reply with 'success' or '' to avoid timeout issues
  return 'success'
}


// Verify the legitimacy of the message sent by the WeChat server
function verifySignature(signature, timestamp, nonce, token) {
  const arr = [token, timestamp, nonce].sort();
  const str = arr.join('');
  const sha1 = crypto.createHash('sha1');
  sha1.update(str);
  return sha1.digest('hex') === signature;
}

// Return the assembled XML
function toXML(payload, content) {
  const timestamp = Date.now();
  const { tousername: fromUserName, fromusername: toUserName } = payload;
  return `
  <xml>
    <ToUserName><![CDATA[${toUserName}]]></ToUserName>
    <FromUserName><![CDATA[${fromUserName}]]></FromUserName>
    <CreateTime>${timestamp}</CreateTime>
    <MsgType><![CDATA[text]]></MsgType>
    <Content><![CDATA[${content}]]></Content>
  </xml>
  `
}
```

## Get Official Account Token and Configure it

### Log in to the Official Account Backend

Scan the QR code at <https://mp.weixin.qq.com/> to log in to your WeChat Official Account.

### Configure the Server

![MediaPlatformBaseSetting](/doc-images/MediaPlatformBaseSetting.png)

![MediaPlatformBaseSetting2](/doc-images/MediaPlatformBaseSetting2.png)

- Step 3: Enter the URL of the newly created and published cloud function.

- Step 4: Customize a "Token" that matches the environment variable "WECHAT_TOKEN" in the cloud function. After setting it here, you also need to configure the environment variable in the laf application.

- Step 5: The plaintext mode is not used in this case.

If the configuration is correct, clicking on "Submit" will display "Submission Successful".

## Test the Conversation Functionality

Send a text message in your WeChat Official Account. If the account replies with the same text, it means that the docking is successful.

## More features can be found in the WeChat development documentation

:::tip
The most common pitfall when accessing the message functionality of a WeChat Official Account is failing to respond within 5 seconds after receiving a message from a user. If no response is made within this time frame, WeChat will automatically retry the request 3 times. This can easily lead to timeout issues when integrating with ChatGPT.

To solve this issue, you can refer to the document: [Setting a Timeout for a Specific Request in Cloud Functions](/guide/function/faq.html#云函数设置某请求超时时间).

If you are using an authenticated subscription account or service account, it is recommended to use the customer service message feature for a better user experience.
:::

For information on developing message-related capabilities, please refer to: <https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Access_Overview.html>.

All other features can also be integrated normally.
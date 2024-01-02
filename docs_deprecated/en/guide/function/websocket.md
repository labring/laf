---
title: Handling WebSocket Connections in Cloud Functions
---

# {{ $frontmatter.title }}

WebSocket is a long-lived connection that allows for bi-directional communication between the server and the client. However, unfortunately, many Serverless architectures do not support WebSocket functionality. Fortunately, Laf makes it easy to use WebSocket, opening up more possibilities for our applications.

## WebSocket Cloud Function

To use WebSocket in Laf, you need to create a cloud function named `__websocket__`.

:::tip
The name of the WebSocket cloud function must be `__websocket__`. Any other name will not work.
:::

Here is an example of how to handle WebSocket in a cloud function:

```typescript
export async function main(ctx: FunctionContext) {

  if (ctx.method === "WebSocket:connection") {
    ctx.socket.send('hi connection succeed')
  }

  if (ctx.method === 'WebSocket:message') {
    const { data } = ctx.params;
    console.log(data.toString());
    ctx.socket.send("I have received your message");
  }
}
```

For more information, please refer to: <https://github.com/websockets/ws>

## Client WebSocket Connection

```typescript
const wss = new WebSocket("wss://your-own-appid.laf.run/__websocket__");

wss.onopen = (socket) => {
  console.log("connected");
  wss.send("hi");
};

wss.onmessage = (res) => {
  console.log("Received a new message...");
  console.log(res.data);
};

wss.onclose = () => {
  console.log("closed");
};
```


## Connection Demo

1. Replace the `__websocket__` code and publish it.

```js
import cloud from '@lafjs/cloud'

export async function main(ctx: FunctionContext) {
  // Initialize the websocket user Map list
  // You can also use a database to save it, this example code uses the global cache of Laf functions
  let wsMap = cloud.shared.get("wsMap") // Get wsMap
  if(!wsMap){
    wsMap = new Map()
    cloud.shared.set("wsMap", wsMap) // Set wsMap
  }
  
  // Websocket connection established
  if (ctx.method === "WebSocket:connection") {
    const userId = generateUserId()
    wsMap = cloud.shared.get("wsMap") // Get wsMap
    wsMap.set(userId, ctx.socket);
    cloud.shared.set("wsMap", wsMap) // Set wsMap
    ctx.socket.send("Connection established, your userID is: "+userId);
  }

  // Websocket message event
  if (ctx.method === "WebSocket:message") {
    const { data } = ctx.params;
    console.log("Received message: ",data.toString());
    const userId = getKeyByValue(wsMap, ctx.socket);
    ctx.socket.send("Server has received the message event, your userID is: "+userId);
  }

  // Websocket close event
  if (ctx.method === "WebSocket:close") {
    wsMap = cloud.shared.get("wsMap") // Get wsMap 
    const userId = getKeyByValue(wsMap, ctx.socket);
    wsMap.delete(userId);
    cloud.shared.set("wsMap", wsMap) // Set wsMap
    ctx.socket.send("Server has received the close event message, your userID is: "+userId);
  }
}

// Generate random user ID
function generateUserId() {
  return Math.random().toString(36).substring(2, 15);
}

// Traverse userID
function getKeyByValue(map, value) {
  for (const [key, val] of map.entries()) {
    if (val === value) {
      return key;
    }
  }
}
```

2. Get your WebSocket URL

The general format is:

Replace `your-own-appid` with your Laf application appid.

`wss://your-own-appid.laf.run/__websocket__`

3. Connect to the WebSocket URL on the client side and obtain the userID.

4. Create a new cloud function to push messages using the userID.

```js
import cloud from '@lafjs/cloud'

export async function main(ctx: FunctionContext) {
  const userID = ''
  let wsMap = cloud.shared.get("wsMap")
  ctx.socket = wsMap.get(userID)
  ctx.socket.send("Message test");
}
```
import { WebSocketMessage } from "./src/types/WebSocketMessage";
import WebSocketMessageType from "./src/types/WebSocketMessageType";
import buildWebSocketMessage from "./src/utils/buildWebSocketMessage";
import getChannelFromReq from "./src/utils/getChannelFromReq";
import getUsernameFromReq from "./src/utils/getUsernameFromReq";
import uuid from "./src/utils/uuid";

const users: { [key: string]: string } = {};

const server = Bun.serve<{ username: string, channel: number, id: string }>({
  port: 3002,
  fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === "/chat") {
      const username = getUsernameFromReq(req);
      const channel = getChannelFromReq(req);
      const success = server.upgrade(req, { data: { username, channel, id: uuid() } });
      return success
        ? undefined
        : new Response("WebSocket upgrade error", { status: 400 });
    }

    return new Response("Hello world");
  },
  websocket: {
    open(ws) {
      console.log(`New connection from ${ws.data.username} on channel ${ws.data.channel}`);
      ws.subscribe(`channel_${ws.data.channel}`);
      const user = JSON.stringify({
        id: ws.data.id,
        type: WebSocketMessageType.Join,
        username: ws.data.username,
        date: new Date(),
        channel: ws.data.channel,
      });
      users[ws.data.id] = user;
      ws.send(JSON.stringify(buildWebSocketMessage(JSON.stringify(Object.values(users)), WebSocketMessageType.UserList, ws.data.username, ws.data.channel)));
      ws.publish(`channel_${ws.data.channel}`, user);
    },
    message(ws, message) {
      console.log(`New message from ${ws.data.username} on channel ${ws.data.channel}`);
      const data = JSON.parse(message as string) as WebSocketMessage;

      switch (data.type) {
        case WebSocketMessageType.UserList:
          ws.send(JSON.stringify(buildWebSocketMessage(JSON.stringify(Object.values(users)), WebSocketMessageType.UserList, data.username, data.channel)));
          break;
        case WebSocketMessageType.Leave:
          data.content = ws.data.id;
          delete users[ws.data.id];
        default:
          ws.publish(`channel_${ws.data.channel}`, JSON.stringify(data));
          break;
      }
    },
    close(ws) {
      console.log(`Connection closed from ${ws.data.username} on channel ${ws.data.channel}`);
      ws.unsubscribe(`channel_${ws.data.channel}`);
    },
  },
});

console.log(`Listening on ${server.hostname}:${server.port}`);

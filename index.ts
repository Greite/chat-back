const getUsernameFromReq = (req: Request) => {
  const url = new URL(req.url);
  const username = url.searchParams.get("username");

  if (!username) {
    throw new Error("Username is required");
  }

  return username;
}

const getChannelFromReq = (req: Request): number => {
  const url = new URL(req.url);
  const channel = url.searchParams.get("channel");

  if (!channel) {
    throw new Error("Channel is required");
  }

  return parseInt(channel, 10);
}

const UUID = (): string => {
  let dt = new Date().getTime()

  const id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (dt + Math.random() * 16) % 16 | 0

    dt = Math.floor(dt / 16)

    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })

  return id
}


enum MessageType {
  Message = "message",
  Join = "join",
  Leave = "leave",
}

interface WebSocketMessage {
  id: string
  type: MessageType
  content: string
  username: string
  date: Date
  channel: number
}

const server = Bun.serve<{ username: string, channel: number, id: string }>({
  port: 3002,
  fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === "/chat") {
      const username = getUsernameFromReq(req);
      const channel = getChannelFromReq(req);
      const success = server.upgrade(req, { data: { username, channel, id: UUID() } });
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
      ws.publish(`channel_${ws.data.channel}`, JSON.stringify({
        id: ws.data.id,
        type: MessageType.Join,
        username: ws.data.username,
        date: new Date(),
        channel: ws.data.channel,
      }));
    },
    message(ws, message) {
      console.log(`New message from ${ws.data.username} on channel ${ws.data.channel}`);
      const data = JSON.parse(message as string) as WebSocketMessage;

      switch (data.type) {
        case MessageType.Leave:
          data.content = ws.data.id;
          break;
        default:
          break;
      }

      ws.publish(`channel_${ws.data.channel}`, JSON.stringify(data));
    },
    close(ws) {
      console.log(`Connection closed from ${ws.data.username} on channel ${ws.data.channel}`);
      ws.unsubscribe(`channel_${ws.data.channel}`);
    },
  },
});

console.log(`Listening on ${server.hostname}:${server.port}`);

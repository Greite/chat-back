/* eslint-disable no-console */
import { ServerWebSocket } from 'bun'

import WebSocketMessageType from './src/types/WebSocketMessageType'
import WebSocketServerProps from './src/types/WebSocketServerProps'
import buildWebSocketMessage from './src/utils/buildWebSocketMessage'

interface ProcessOpenProps {
  ws: ServerWebSocket<WebSocketServerProps>
  users: { [key: string]: string }
}

export default function processOpen({ ws, users }: ProcessOpenProps): { [key: string]: string } {
  const updatedUsers = users
  console.log(`New connection from ${ws.data.username} on channel ${ws.data.channel}`)

  ws.subscribe(`channel_${ws.data.channel}`)

  const user = JSON.stringify({
    id: ws.data.id,
    type: WebSocketMessageType.Join,
    username: ws.data.username,
    date: new Date(),
    channel: ws.data.channel,
  })

  updatedUsers[ws.data.id] = user

  ws.send(
    JSON.stringify(
      buildWebSocketMessage(
        JSON.stringify(Object.values(users)),
        WebSocketMessageType.UserList,
        ws.data.username,
        ws.data.channel,
      ),
    ),
  )
  ws.publish(`channel_${ws.data.channel}`, user)

  return updatedUsers
}

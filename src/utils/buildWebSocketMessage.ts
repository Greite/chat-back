import { WebSocketMessage } from "../types/WebSocketMessage"
import WebSocketMessageType from "../types/WebSocketMessageType"

import uuid from "./uuid"

export default function buildWebSocketMessage(
  content: string,
  type: WebSocketMessageType,
  login: string,
  channel: number,
): WebSocketMessage {
  const data: WebSocketMessage = {
    id: uuid(),
    type,
    content,
    username: login ?? '',
    date: new Date(),
    channel: channel ?? 0,
  }

  return data
}

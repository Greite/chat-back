import WebSocketMessageType from './WebSocketMessageType'

export interface WebSocketMessage {
  id: string
  type: WebSocketMessageType
  content: string
  username: string
  date: Date
  channel: number
}

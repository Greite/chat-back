import { Server } from 'bun'

import getChannelFromReq from './src/utils/getChannelFromReq'
import getUserIdFromReq from './src/utils/getUserIdFromReq'
import getUsernameFromReq from './src/utils/getUsernameFromReq'

interface ProcessFetchProps {
  req: Request
  server: Server
}

export default function processFetch({ req, server }: ProcessFetchProps): Response | undefined {
  const url = new URL(req.url)

  if (url.pathname === '/chat') {
    const id = getUserIdFromReq(req)
    const username = getUsernameFromReq(req)
    const channel = getChannelFromReq(req)
    const success = server.upgrade(req, { data: { username, channel, id } })

    return success ? undefined : new Response('WebSocket upgrade error', { status: 400 })
  }

  return new Response('Hello world')
}

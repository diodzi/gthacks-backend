import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import {
  createRoom,
  deleteRoom,
  getRooms,
  roomSocket,
} from './controller/roomController.js'
import { createNodeWebSocket } from '@hono/node-ws'

const app = new Hono()
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app })

app.post('/room', createRoom)
app.get('/rooms', getRooms)
app.delete('/room/:id', deleteRoom)
app.get('/ws/room/:id', upgradeWebSocket(roomSocket))

const server = serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  },
)

injectWebSocket(server)

import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import {
  createRoom,
  deleteRoom,
  getRoom,
  getRooms,
  roomSocket,
} from './controller/roomController.js'
import { createNodeWebSocket } from '@hono/node-ws'
import { getUser } from './controller/userController.js'

const app = new Hono()
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app })

app.get('/user', getUser)
app.post('/room', createRoom)
app.get('/room/:id', getRoom)
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

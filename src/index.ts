import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { createRoom, deleteRoom, roomSocket } from './controller/roomController'
import { drizzle } from 'drizzle-orm/mysql2'
import { usersTable } from './db/schema.js'
import { db } from './db/index.js'
import { createNodeWebSocket } from '@hono/node-ws'

const app = new Hono()
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app })

app.post('/room', createRoom)
app.delete('/room/:id', deleteRoom)
app.get("/ws/room/:id", upgradeWebSocket(roomSocket));

const server = serve({ fetch: app.fetch, port: 3000 });
injectWebSocket(server);

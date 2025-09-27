import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { roomsTable, usersTable } from './db/schema.js'
import { db } from './db/index.js'
import { eq } from 'drizzle-orm'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/api/users', async (c) => {
  const msg = await db.select().from(usersTable)

  return c.json({
    ok: true,
    message: msg[0],
  })
})

app.get('/api/rooms', async (c) => {
  const msg = await db.select().from(roomsTable)

  return c.json({
    ok: true,
    message: msg[0],
  })
})

app.get('/api/room/:id', async (c) => {
  const roomId = c.req.param('id')

  const msg = await db
    .select()
    .from(roomsTable)
    .where(eq(roomsTable.id, Number(roomId)))

  return c.json({
    ok: true,
    message: msg[0],
  })
})

app.post('/api/rooms/create', async (c) => {
  const body = await c.req.json()
  const msg = await db.insert(roomsTable).values(body).$returningId()

  return c.json({
    ok: true,
    message: msg[0],
  })
})

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  },
)

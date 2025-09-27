import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/mysql2'
import { usersTable } from './db/schema.js'
import { db } from './db/index.js'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/api/sqlTest', async (c) => {
  const msg = await db.select().from(usersTable)

  console.log(msg)

  return c.json({
    ok: true,
    message: msg[0],
  })
})

app.get('/api/leaderboardDaily', async (c) => {
  const msg = await db.select().from(usersTable)

  const sortedUsers = await db
    .select()
    .from(usersTable)
    .orderBy(desc(usersTable.rep_points));


  return c.json({
    ok: true,
    message: sortedUsers,
  })
})


app.get('/api/leaderboardWeekly', async (c) => {
  const msg = await db.select().from(usersTable)

  console.log(msg)

  return c.json({
    ok: true,
    message: msg[0],
  })
})

app.get('/api/leaderAllTime', async (c) => {
  const msg = await db.select().from(usersTable)

  console.log(msg)

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

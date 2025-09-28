import type { Context } from 'hono'
import { db } from '../db/index.js'
import { eq } from 'drizzle-orm'
import { usersTable } from '../db/schema.js'

export async function getUser(c: Context) {
  const email = c.req.query('email')
  const password = c.req.query('password')

  if (!email || !password) {
    return c.json({ error: 'Either no email or no password submitted' }, 400)
  }

  const usersRes = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))

  if (usersRes[0].password !== password) {
    return c.json({ error: 'Invalid email or password' }, 401)
  }

  return c.json({ message: 'ok', user: usersRes[0] })
}

// src/controller/betController.ts
import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { db } from '../db/index.js'
import { usersTable, betsTable, usersBetsTable } from '../db/schema.js'
import { eq, and } from 'drizzle-orm'
import { sql } from 'drizzle-orm/sql'

const ODDS_MULTIPLIER = 2

function toInt(n: number) {
  return Math.floor(Number(n))
}

function computeWin(side: 'over' | 'under', finalValue: number, betLine: number) {
  return side === 'over' ? finalValue > betLine : finalValue < betLine
}

function computePayout(amount: number, oddsMultiplier: number) {
  return toInt(amount * oddsMultiplier)
}

export async function placeSingleBet(c: Context) {
  const betId = Number(c.req.param('betId'))
  const body = await c.req.json<{
    userId: number
    amount: number
    side: 'over' | 'under'
  }>()

  if (Number.isNaN(betId)) return c.json({ error: 'Invalid betId' }, 400)

  const { userId, amount, side } = body ?? {}
  if (!userId || !amount || !side) {
    return c.json({ error: 'userId, amount, side are required' }, 400)
  }
  if (amount <= 0) return c.json({ error: 'amount must be > 0' }, 400)
  if (side !== 'over' && side !== 'under') {
    return c.json({ error: 'side must be "over" or "under"' }, 400)
  }

  const [bet] = await db
    .select({ id: betsTable.id, time: betsTable.time })
    .from(betsTable)
    .where(eq(betsTable.id, betId))

  if (!bet) return c.json({ error: 'bet not found' }, 404)

  try {
    const result = await db.transaction(async (tx) => {
      const upd = await tx
        .update(usersTable)
        .set({ repPoints: sql`${usersTable.repPoints} - ${amount}` })
        .where(and(eq(usersTable.id, userId), sql`${usersTable.repPoints} >= ${amount}`))
        .execute()

      if ((upd as any).rowsAffected === 0) {
        throw new HTTPException(400, { message: 'Insufficient rep_points' })
      }

      const [ticket] = await tx
        .insert(usersBetsTable)
        .values({
          userId,
          betId,
          amount,
          side,
          status: 'placed',
        })
        .$returningId()

      return { ticketId: ticket.id }
    })

    return c.json({ ok: true, ...result })
  } catch (err) {
    if (err instanceof HTTPException) throw err
    throw new HTTPException(500, { message: 'Failed to place bet' })
  }
}

export async function settleSingleBet(c: Context) {
  const betId = Number(c.req.param('id'))
  const body = await c.req.json<{ finalValue: number | string }>()
  const { finalValue } = body ?? {}

  if (Number.isNaN(betId)) return c.json({ error: 'Invalid bet id' }, 400)
  if (finalValue === undefined || finalValue === null) {
    return c.json({ error: 'finalValue required' }, 400)
  }

  try {
    await db.transaction(async (tx) => {
      const [betRow] = await tx
        .select({ betLine: betsTable.betLine })
        .from(betsTable)
        .where(eq(betsTable.id, betId))

      if (!betRow) throw new HTTPException(404, { message: 'bet not found' })

      const betLine = Number(betRow.betLine)
      const finalValueNum = Number(finalValue)

      const tickets = await tx
        .select({
          id: usersBetsTable.id,
          userId: usersBetsTable.userId,
          amount: usersBetsTable.amount,
          side: usersBetsTable.side,
        })
        .from(usersBetsTable)
        .where(and(eq(usersBetsTable.betId, betId), eq(usersBetsTable.status, 'placed')))

      if (tickets.length === 0) return

      for (const t of tickets) {
        const didWin = computeWin(t.side as 'over' | 'under', finalValueNum, betLine)

        if (didWin) {
          const payout = computePayout(Number(t.amount), ODDS_MULTIPLIER)

          await tx
            .update(usersTable)
            .set({ repPoints: sql`${usersTable.repPoints} + ${payout}` })
            .where(eq(usersTable.id, t.userId))
            .execute()

          await tx
            .update(usersBetsTable)
            .set({ status: 'won', settledAt: sql`CURRENT_TIMESTAMP` })
            .where(eq(usersBetsTable.id, t.id))
            .execute()
        } else {
          await tx
            .update(usersBetsTable)
            .set({ status: 'lost', settledAt: sql`CURRENT_TIMESTAMP` })
            .where(eq(usersBetsTable.id, t.id))
            .execute()
        }
      }
    })

    return c.json({ ok: true })
  } catch (err) {
    if (err instanceof HTTPException) throw err
    throw new HTTPException(500, { message: 'Failed to settle bet' })
  }
}

import type { Context } from 'hono'
import type { WSContext, WSEvents } from 'hono/ws'
import { HTTPException } from 'hono/http-exception'
import { db } from '../db/index.js'
import { eq } from 'drizzle-orm'
import { roomsTable, usersTable } from '../db/schema.js'

const rooms = new Map<string, Set<WSContext>>()

export async function getRooms(c: Context) {
  const roomsRes = await db
    .select({
      room: {
        id: roomsTable.id,
        title: roomsTable.title,
        viewCount: roomsTable.viewCount,
      },
      owner: usersTable,
    })
    .from(roomsTable)
    .leftJoin(usersTable, eq(roomsTable.ownerId, usersTable.id))

  console.log(roomsRes)

  return c.json({ message: 'ok', rooms: roomsRes })
}

export async function createRoom(c: Context) {
	const body = await c.req.json<{
		title?: string
		ownerId?: number
		gameId?: number
	}>()

	if (!body.title || body.title.trim() === '') {
		return c.json({ error: 'Title is required' }, 400)
	}

	if (!body.ownerId || Number.isNaN(Number(body.ownerId))) {
		return c.json({ error: 'ownerId must be a number' }, 400)
	}

	if (!body.gameId || Number.isNaN(Number(body.gameId))) {
		return c.json({ error: 'gameId must be a number' }, 400)
	}

	const roomIds = await db
		.insert(roomsTable)
		.values({
			title: body.title,
			ownerId: body.ownerId,
			gameId: body.gameId,
			viewCount: 0,
		})
		.$returningId()

	rooms.set(String(roomIds[0].id), new Set())

	return c.json({ ok: true, roomId: roomIds[0].id })
}

export async function deleteRoom(c: Context) {
	const id = c.req.param('id')
	const numID = Number(id)
	try {
		await db.delete(roomsTable).where(eq(roomsTable.id, numID))
		const clients = rooms.get(id)
		if (clients) {
			for (const client of clients) {
				client.close(1000, "Room closed")
			}
			rooms.delete(id)
		}
		return c.json({ ok: true })
	} catch {
		throw new HTTPException(500, {
			message: `Unable to delete room with id: ${id}`,
		})
	}
}

function addClient(roomId: string, ws: WSContext) {
	if (!rooms.has(roomId)) rooms.set(roomId, new Set())
	rooms.get(roomId)!.add(ws)
}

function broadcast(roomId: string, message: string, sender: WSContext) {
	const clients = rooms.get(roomId)
	if (!clients) return
	for (const client of clients) {
		if (client !== sender) client.send(message)
	}
}

function removeClient(roomId: string, ws: WSContext) {
	const clients = rooms.get(roomId)
	if (!clients) return
	clients.delete(ws)
	if (clients.size === 0) {
		rooms.delete(roomId)
		db.delete(roomsTable).where(eq(roomsTable.id, Number(roomId)))
	}
}

export function roomSocket(c: Context): WSEvents {
	const roomId = c.req.param('id')
	return {
		onOpen: async (_evt, ws) => {
			const [room] = await db
				.select()
				.from(roomsTable)
				.where(eq(roomsTable.id, Number(roomId)));

			if (!room) {
				ws.close(1008, "Room does not exist");
				return;
			}

			addClient(roomId, ws);
		},
		onMessage: (evt, ws) => broadcast(roomId, String(evt.data), ws),
		onClose: (_evt, ws) => removeClient(roomId, ws),
	}
}

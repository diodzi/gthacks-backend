import type { Context } from 'hono'
import type { WSContext, WSEvents } from 'hono/ws'
import { HTTPException } from 'hono/http-exception'
import { db } from '../db/index.js'
import { eq } from 'drizzle-orm'
import { roomsTable } from '../db/schema.js'

const rooms = new Map<string, Set<WSContext>>()

export async function createRoom(c: Context) {
	const body = await c.req.json();

	const result = await db.insert(roomsTable).values({
		title: body.title,
		ownerId: body.ownerId ?? 1,
		gameId: body.gameId ?? null,
		viewCount: 0,
	}).execute();

	const id = String((result as any).insertId);

	rooms.set(id, new Set());

	return c.json({ ok: true, roomId: id });
}

export async function deleteRoom(c: Context) {
	const id = c.req.param('id')
	const numID = Number(id)
	try {
		await db.delete(roomsTable).where(eq(roomsTable.id, numID))
		rooms.delete(id)
		return c.json({ ok: true })
	} catch {
		throw new HTTPException(500, { message: `Unable to delete room with id: ${id}` })
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
	if (clients.size === 0) rooms.delete(roomId)
}

export function roomSocket(c: Context): WSEvents {
	const roomId = c.req.param('id')
	return {
		onOpen: (_evt, ws) => addClient(roomId, ws),
		onMessage: (evt, ws) => broadcast(roomId, String(evt.data), ws),
		onClose: (_evt, ws) => removeClient(roomId, ws),
	}
}

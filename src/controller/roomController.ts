import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { createNodeWebSocket } from "@hono/node-ws";

const rooms = new Map<string, Set<WebSocket>>();

export async function createRoom(c: Context) {
	const id = crypto.randomUUID();
	rooms.set(id, new Set());
	return c.json({ roomId: id });
}

export async function deleteRoom(c: Context) {
	const id = c.req.param("id");
	try {
		if (!rooms.has(id)) {
			throw new HTTPException(404, { message: `Room ${id} not found` });
		}
		rooms.delete(id);
		return c.json({ message: `Room ${id} deleted` });
	} catch (e) {
		throw new HTTPException(500, {
			message: `Unable to delete room with id: ${id}`,
		});
	}
}

function addClient(roomId: string, ws: WebSocket) {
	if (!rooms.has(roomId)) {
		rooms.set(roomId, new Set());
	}
	rooms.get(roomId)!.add(ws);
}

function broadcast(roomId: string, message: string, sender: WebSocket) {
	const clients = rooms.get(roomId);
	if (!clients) return;

	for (const client of clients) {
		if (client !== sender && client.readyState === WebSocket.OPEN) {
			client.send(message);
		}
	}
}

function removeClient(roomId: string, ws: WebSocket) {
	const clients = rooms.get(roomId);
	if (!clients) return;

	clients.delete(ws);
	if (clients.size === 0) {
		rooms.delete(roomId);
	}
}

export function roomSocket(c: Context) {
	const roomId = c.req.param("id");

	return {
		onOpen: (_evt: Event, ws: WebSocket) => addClient(roomId, ws),
		onMessage: (evt: MessageEvent, ws: WebSocket) =>
			broadcast(roomId, String(evt.data), ws),
		onClose: (_evt: CloseEvent, ws: WebSocket) => removeClient(roomId, ws),
	};
}

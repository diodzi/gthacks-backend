import { relations } from "drizzle-orm/relations";
import { betsTable, postsTable, usersTable, gameTable, roomsTable, usersBetsTable, usersRoomsTable } from "./schema";

export const postsTableRelations = relations(postsTable, ({one}) => ({
	betsTable: one(betsTable, {
		fields: [postsTable.betId],
		references: [betsTable.id]
	}),
	usersTable: one(usersTable, {
		fields: [postsTable.userId],
		references: [usersTable.id]
	}),
}));

export const betsTableRelations = relations(betsTable, ({many}) => ({
	postsTables: many(postsTable),
	usersBetsTables: many(usersBetsTable),
}));

export const usersTableRelations = relations(usersTable, ({many}) => ({
	postsTables: many(postsTable),
	roomsTables: many(roomsTable),
	usersBetsTables: many(usersBetsTable),
	usersRoomsTables: many(usersRoomsTable),
}));

export const roomsTableRelations = relations(roomsTable, ({one, many}) => ({
	gameTable: one(gameTable, {
		fields: [roomsTable.gameId],
		references: [gameTable.id]
	}),
	usersTable: one(usersTable, {
		fields: [roomsTable.ownerId],
		references: [usersTable.id]
	}),
	usersRoomsTables: many(usersRoomsTable),
}));

export const gameTableRelations = relations(gameTable, ({many}) => ({
	roomsTables: many(roomsTable),
}));

export const usersBetsTableRelations = relations(usersBetsTable, ({one}) => ({
	betsTable: one(betsTable, {
		fields: [usersBetsTable.betId],
		references: [betsTable.id]
	}),
	usersTable: one(usersTable, {
		fields: [usersBetsTable.userId],
		references: [usersTable.id]
	}),
}));

export const usersRoomsTableRelations = relations(usersRoomsTable, ({one}) => ({
	roomsTable: one(roomsTable, {
		fields: [usersRoomsTable.roomId],
		references: [roomsTable.id]
	}),
	usersTable: one(usersTable, {
		fields: [usersRoomsTable.userId],
		references: [usersTable.id]
	}),
}));
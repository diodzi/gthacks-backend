import { mysqlTable, mysqlSchema, AnyMySqlColumn, primaryKey, bigint, varchar, datetime, decimal, foreignKey, int, unique } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const betsTable = mysqlTable("bets_table", {
	id: bigint({ mode: "number" }).autoincrement().notNull(),
	name: varchar({ length: 100 }).notNull(),
	time: datetime({ mode: 'string'}).notNull(),
	betLine: decimal("bet_line", { precision: 10, scale: 2 }).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "bets_table_id"}),
]);

export const gameTable = mysqlTable("game_table", {
	id: bigint({ mode: "number" }).autoincrement().notNull(),
	title: varchar({ length: 255 }).notNull(),
	startTime: datetime("start_time", { mode: 'string'}).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "game_table_id"}),
]);

export const postsTable = mysqlTable("posts_table", {
	id: bigint({ mode: "number" }).autoincrement().notNull(),
	text: varchar({ length: 255 }).notNull(),
	betId: bigint("bet_id", { mode: "number" }).notNull().references(() => betsTable.id, { onDelete: "cascade" } ),
	userId: bigint("user_id", { mode: "number" }).notNull().references(() => usersTable.id, { onDelete: "cascade" } ),
},
(table) => [
	primaryKey({ columns: [table.id], name: "posts_table_id"}),
]);

export const roomsTable = mysqlTable("rooms_table", {
	id: bigint({ mode: "number" }).autoincrement().notNull(),
	ownerId: bigint("owner_id", { mode: "number" }).notNull().references(() => usersTable.id, { onDelete: "cascade" } ),
	gameId: bigint("game_id", { mode: "number" }).notNull().references(() => gameTable.id, { onDelete: "cascade" } ),
	title: varchar({ length: 255 }).notNull(),
	viewCount: int("view_count").default(0).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "rooms_table_id"}),
]);

export const sportsCards = mysqlTable("sports_cards", {
	id: int().autoincrement().notNull(),
	userId: varchar({ length: 255 }),
	title: varchar({ length: 255 }),
	desc: varchar({ length: 500 }),
	team1: varchar({ length: 100 }),
	team2: varchar({ length: 100 }),
	matchDate: datetime("match_date", { mode: 'string'}),
},
(table) => [
	primaryKey({ columns: [table.id], name: "sports_cards_id"}),
]);

export const usersBetsTable = mysqlTable("users_bets_table", {
	id: bigint({ mode: "number" }).autoincrement().notNull(),
	userId: bigint("user_id", { mode: "number" }).notNull().references(() => usersTable.id, { onDelete: "cascade" } ),
	betId: bigint("bet_id", { mode: "number" }).notNull().references(() => betsTable.id, { onDelete: "cascade" } ),
},
(table) => [
	primaryKey({ columns: [table.id], name: "users_bets_table_id"}),
]);

export const usersRoomsTable = mysqlTable("users_rooms_table", {
	id: bigint({ mode: "number" }).autoincrement().notNull(),
	userId: bigint("user_id", { mode: "number" }).notNull().references(() => usersTable.id, { onDelete: "cascade" } ),
	roomId: bigint("room_id", { mode: "number" }).notNull().references(() => roomsTable.id, { onDelete: "cascade" } ),
},
(table) => [
	primaryKey({ columns: [table.id], name: "users_rooms_table_id"}),
]);

export const usersTable = mysqlTable("users_table", {
	id: bigint({ mode: "number" }).autoincrement().notNull(),
	username: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	repPoints: int("rep_points").default(0).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "users_table_id"}),
	unique("users_table_email_unique").on(table.email),
]);

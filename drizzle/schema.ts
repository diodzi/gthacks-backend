import { mysqlTable, mysqlSchema, AnyMySqlColumn, primaryKey, unique, serial, int, varchar, datetime, decimal } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const bettingFeeds = mysqlTable("betting_feeds", {
	id: serial().notNull(),
	gameId: int().notNull(),
	season: int().notNull(),
	week: int().notNull(),
	seasonType: varchar({ length: 50 }).notNull(),
	gameDate: datetime({ mode: 'string'}).notNull(),
	homeTeam: varchar({ length: 100 }).notNull(),
	awayTeam: varchar({ length: 100 }).notNull(),
	homeTeamId: int().notNull(),
	awayTeamId: int().notNull(),
	homeTeamScore: int(),
	awayTeamScore: int(),
	pointSpread: decimal({ precision: 5, scale: 2 }),
	overUnder: decimal({ precision: 5, scale: 2 }),
	homeTeamMoneyLine: int(),
	awayTeamMoneyLine: int(),
	updated: datetime({ mode: 'string'}).notNull(),
	created: datetime({ mode: 'string'}).default(sql`(CURRENT_TIMESTAMP)`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "betting_feeds_id"}),
	unique("id").on(table.id),
]);

export const usersTable = mysqlTable("users_table", {
	id: serial().notNull(),
	username: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	repPoints: int("rep_points"),
},
(table) => [
	primaryKey({ columns: [table.id], name: "users_table_id"}),
	unique("id").on(table.id),
	unique("users_table_email_unique").on(table.email),
]);

import { sql } from 'drizzle-orm';
import { int, mysqlTable, serial, varchar, decimal, datetime, bigint } from 'drizzle-orm/mysql-core';

export const usersTable = mysqlTable('users_table', {
  id: bigint('id', { mode: 'bigint'}).primaryKey(),
  username: varchar('username', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  repPoints: int('rep_points').notNull().default(0),
});

export const bettingFeeds = mysqlTable("betting_feeds", {
  id: serial().notNull().primaryKey(),
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
})

export const betsTable = mysqlTable('bets_table', {
  id: bigint('id', { mode: 'bigint'}).primaryKey(),
  betAmount: int('bet_amount').notNull(),

  repWinAmnt: int('rep_win_amount').notNull(),
  repLossAmnt: int('rep_loss_amount').notNull(),

  hitPercent: int('hit_percent').notNull(),
  betLine: decimal('bet_line', { precision: 10, scale: 2 }).notNull(),
  userId: bigint('user_id', { mode: 'bigint'})
    .notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
});

export const postsTable = mysqlTable('posts_table', {
  id: bigint('id', { mode: 'bigint'}).primaryKey(),
  text: varchar('text', { length: 255 }).notNull(),
  betId: bigint('bet_id', { mode: 'bigint'}).notNull().references(() => betsTable.id, { onDelete: 'cascade' }),
  userId:  bigint('user_id', { mode: 'bigint'}).notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
});

export const gameTable = mysqlTable('game_table', {
  id: bigint('id', { mode: 'bigint'}).primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  startTime: datetime('start_time').notNull(),
});
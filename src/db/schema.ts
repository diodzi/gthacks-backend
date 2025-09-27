// db/schema.ts
import { int, mysqlTable, serial, varchar, decimal, timestamp } from 'drizzle-orm/mysql-core';

export const usersTable = mysqlTable('users_table', {
  id: serial('user_id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  repPoints: int('rep_points').notNull().default(0),
});

export const betsTable = mysqlTable('bets_table', {
  id: serial('bet_id').primaryKey(),
  betAmount: int('bet_amount').notNull(),

  repWinAmnt: int('rep_win_amount').notNull(),
  repLossAmnt: int('rep_loss_amount').notNull(),

  hitPercent: int('hit_percent').notNull(),
  betLine: decimal('bet_line', { precision: 10, scale: 2 }).notNull(),
  userId: int('user_id')
    .notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
});

export const postsTable = mysqlTable('posts_table', {
  id: serial('post_id').primaryKey(),
  text: varchar('text', { length: 255 }).notNull(),
  betId: int('bet_id').notNull().references(() => betsTable.id, { onDelete: 'cascade' }),
  userId: int('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
});

export const gameTable = mysqlTable('game_table', {
  gameId: serial('game_id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  startTime: timestamp('start_time').notNull(),
});
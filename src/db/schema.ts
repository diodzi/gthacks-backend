import { int, MySqlDecimal, mysqlTable, serial, varchar, decimal, bigint, timestamp } from 'drizzle-orm/mysql-core'

export const usersTable = mysqlTable('users_table', {
  userId: serial().primaryKey(),
  username: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  rep_points: int()
})


export const postsTable = mysqlTable('posts_table', {
  postId: serial().primaryKey(),
  text: varchar({ length: 255 }).notNull(),
  betId: bigint('bet_id', {mode: 'number'}).notNull().references(() => betsTable.betId, { onDelete: 'cascade' }),

  userId: bigint('user_id', {mode: 'number'})
    .notNull().references(() => usersTable.userId, { onDelete: 'cascade' }),
})

export const betsTable = mysqlTable('bets_table', {
  betId: serial().primaryKey(),
  betAmount: int().notNull(),

  repWinAmnt: int().notNull(),
  repLossAmnt: int().notNull(),

  hitPercent: int().notNull(),
  betLine: decimal().notNull(),

  userId: int('user_id')
    .notNull().references(() => usersTable.userId, { onDelete: 'cascade' }),
})

export const gameTable = mysqlTable('bets_table', {
  gameId: serial().primaryKey(),
  title: varchar({ length: 255 }).notNull(),
  startTime: timestamp().notNull()
})



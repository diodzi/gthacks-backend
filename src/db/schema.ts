import {
  int,
  mysqlTable,
  varchar,
  decimal,
  datetime,
  bigint,
} from 'drizzle-orm/mysql-core'

export const usersTable = mysqlTable('users_table', {
  id: bigint('id', { mode: 'bigint' }).primaryKey(),
  username: varchar('username', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  repPoints: int('rep_points').notNull().default(0),
})

export const betsTable = mysqlTable('bets_table', {
  id: bigint('id', { mode: 'bigint' }).primaryKey(),
  name: varchar({ length: 100 }).notNull(),
  time: datetime({ mode: 'date' }).notNull(),
  betLine: decimal('bet_line', { precision: 10, scale: 2 }).notNull(),
})

export const usersBetsTable = mysqlTable('users_bets_table', {
  id: bigint('id', { mode: 'bigint' }).primaryKey(),
  userId: bigint('user_id', { mode: 'bigint' })
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  betId: bigint('bet_id', { mode: 'bigint' })
    .notNull()
    .references(() => betsTable.id, { onDelete: 'cascade' }),
})

export const postsTable = mysqlTable('posts_table', {
  id: bigint('id', { mode: 'bigint' }).primaryKey(),
  text: varchar('text', { length: 255 }).notNull(),
  betId: bigint('bet_id', { mode: 'bigint' })
    .notNull()
    .references(() => betsTable.id, { onDelete: 'cascade' }),
  userId: bigint('user_id', { mode: 'bigint' })
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
})

export const gameTable = mysqlTable('game_table', {
  id: bigint('id', { mode: 'bigint' }).primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  startTime: datetime('start_time').notNull(),
})

export const roomsTable = mysqlTable('rooms_table', {
  id: bigint('id', { mode: 'bigint' }).primaryKey(),
  ownerId: bigint('owner_id', { mode: 'bigint' })
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  gameId: bigint('game_id', { mode: 'bigint' })
    .notNull()
    .references(() => gameTable.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  viewCount: int('view_count').default(0).notNull(),
})

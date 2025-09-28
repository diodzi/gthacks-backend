import {
  int,
  mysqlTable,
  varchar,
  decimal,
  datetime,
  bigint,
  mysqlEnum,
  index,
} from 'drizzle-orm/mysql-core'
import { sql } from 'drizzle-orm/sql'

export const usersTable = mysqlTable('users_table', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  username: varchar('username', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  repPoints: int('rep_points').notNull().default(0),
  password: varchar('password', { length: 255 }).notNull().default(''),
})

export const betsTable = mysqlTable(
  'bets_table',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
    name: varchar('name', { length: 100 }).notNull(),
    time: datetime('time', { mode: 'date' }).notNull(),
    betLine: decimal('bet_line', { precision: 10, scale: 2 }).notNull(),
    oddsMultiplier: decimal('odds_multiplier', { precision: 5, scale: 2 })
      .notNull()
      .default('2.00'),
  },
  (t) => ({
    idxBetsTime: index('idx_bets_time').on(t.time),
  }),
)

export const usersBetsTable = mysqlTable(
  'users_bets_table',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    betId: bigint('bet_id', { mode: 'number' })
      .notNull()
      .references(() => betsTable.id, { onDelete: 'cascade' }),
    amount: int('amount').notNull(),
    side: mysqlEnum('side', ['over', 'under']).notNull(),
    status: mysqlEnum('status', ['placed', 'won', 'lost', 'void'])
      .notNull()
      .default('placed'),
    createdAt: datetime('created_at', { mode: 'date' })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    settledAt: datetime('settled_at', { mode: 'date' }),
  },
  (t) => ({
    idxUserStatus: index('idx_users_bets_user_status').on(t.userId, t.status),
    idxBetStatus: index('idx_users_bets_bet_status').on(t.betId, t.status),
  }),
)

export const postsTable = mysqlTable('posts_table', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  text: varchar('text', { length: 255 }).notNull(),
  betId: bigint('bet_id', { mode: 'number' })
    .notNull()
    .references(() => betsTable.id, { onDelete: 'cascade' }),
  userId: bigint('user_id', { mode: 'number' })
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
})

export const gameTable = mysqlTable('game_table', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  title: varchar('title', { length: 255 }).notNull(),
  startTime: datetime('start_time').notNull(),
})

export const roomsTable = mysqlTable('rooms_table', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  ownerId: bigint('owner_id', { mode: 'number' })
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  gameId: bigint('game_id', { mode: 'number' })
    .notNull()
    .references(() => gameTable.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  viewCount: int('view_count').default(0).notNull(),
})

export const usersRoomTable = mysqlTable('users_rooms_table', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  userId: bigint('user_id', { mode: 'number' })
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  roomId: bigint('room_id', { mode: 'number' })
    .notNull()
    .references(() => roomsTable.id, { onDelete: 'cascade' }),
})

export const sportsCards = mysqlTable('sports_cards', {
  id: int().autoincrement().notNull().primaryKey(),
  userId: varchar({ length: 255 }),
  title: varchar({ length: 255 }),
  desc: varchar({ length: 500 }),
  team1: varchar({ length: 100 }),
  team2: varchar({ length: 100 }),
  matchDate: datetime('match_date', { mode: 'string' }),
})

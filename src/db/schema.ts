import { int, MySqlDecimal, mysqlTable, serial, varchar, decimal } from 'drizzle-orm/mysql-core'

export const usersTable = mysqlTable('users_table', {
  userId: serial().primaryKey(),
  username: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  rep_points: int()
})


export const postsTable = mysqlTable('posts_table', {
  postId: serial().primaryKey(),
  text: varchar({ length: 255 }).notNull(),
  betId: int('bet_id').notNull().references(() => betsTable.betId, { onDelete: 'cascade' }),

  userId: int('user_id')
    .notNull().references(() => usersTable.userId, { onDelete: 'cascade' }),

  userRep: int('rep_points')
  .notNull().references(() => usersTable.rep_points, { onDelete: 'cascade' }),
})

export const betsTable = mysqlTable('bets_table', {
  betId: serial().primaryKey(),
  text: varchar({ length: 255 }).notNull(),

  repWinAmnt: int(),
  repLossAmnt: int(),

  hitPercent: int(),
  betLine: decimal(),

  userId: int('user_id')
    .notNull().references(() => usersTable.userId, { onDelete: 'cascade' }),

  userRep: int('user_id')
  .notNull().references(() => usersTable.rep_points, { onDelete: 'cascade' }),

})


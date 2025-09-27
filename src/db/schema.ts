import { int, mysqlTable, serial, varchar } from 'drizzle-orm/mysql-core'

export const usersTable = mysqlTable('users_table', {
  id: serial().primaryKey(),
  username: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  rep_points: int()
})


export const postsTable = mysqlTable('posts_table', {
  id: serial().primaryKey(),
  text: varchar({ length: 255 }).notNull(),
  betId: serial().primaryKey(),

  userId: int('user_id')
    .notNull().references(() => usersTable.id, { onDelete: 'cascade' }),

  userRep: int('user_id')
  .notNull().references(() => usersTable.rep_points, { onDelete: 'cascade' }),
})


import { int, mysqlTable, serial, varchar } from 'drizzle-orm/mysql-core'

export const usersTable = mysqlTable('users_table', {
  id: serial().primaryKey(),
  username: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  display_name: varchar({ length: 255 }).notNull(),
})

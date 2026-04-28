import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const coursesTable = pgTable("courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  level: text("level").notNull(),
  coverColor: text("cover_color").notNull().default("#6366f1"),
  instructor: text("instructor"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Course = typeof coursesTable.$inferSelect;

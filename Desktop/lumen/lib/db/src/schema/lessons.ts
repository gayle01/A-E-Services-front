import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { coursesTable } from "./courses";

export const lessonsTable = pgTable("lessons", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => coursesTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  durationMinutes: integer("duration_minutes"),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Lesson = typeof lessonsTable.$inferSelect;

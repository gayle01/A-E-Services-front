import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { coursesTable } from "./courses";

export const assignmentsTable = pgTable("assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => coursesTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  instructions: text("instructions").notNull(),
  points: integer("points").notNull().default(100),
  dueAt: timestamp("due_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Assignment = typeof assignmentsTable.$inferSelect;

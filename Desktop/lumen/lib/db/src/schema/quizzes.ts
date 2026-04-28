import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { coursesTable } from "./courses";

export const quizzesTable = pgTable("quizzes", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => coursesTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Quiz = typeof quizzesTable.$inferSelect;

import { pgTable, text, timestamp, uuid, unique } from "drizzle-orm/pg-core";
import { lessonsTable } from "./lessons";

export const lessonCompletionsTable = pgTable(
  "lesson_completions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessonsTable.id, { onDelete: "cascade" }),
    studentName: text("student_name").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    uniqueStudentLesson: unique().on(t.studentName, t.lessonId),
  }),
);

export type LessonCompletion = typeof lessonCompletionsTable.$inferSelect;

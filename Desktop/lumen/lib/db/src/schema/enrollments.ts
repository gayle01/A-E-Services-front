import { pgTable, text, timestamp, uuid, unique } from "drizzle-orm/pg-core";
import { coursesTable } from "./courses";

export const enrollmentsTable = pgTable(
  "enrollments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => coursesTable.id, { onDelete: "cascade" }),
    studentName: text("student_name").notNull(),
    enrolledAt: timestamp("enrolled_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    uniqueStudentCourse: unique().on(t.studentName, t.courseId),
  }),
);

export type Enrollment = typeof enrollmentsTable.$inferSelect;

import { integer, pgTable, text, timestamp, uuid, unique } from "drizzle-orm/pg-core";
import { assignmentsTable } from "./assignments";

export const submissionsTable = pgTable(
  "submissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    assignmentId: uuid("assignment_id")
      .notNull()
      .references(() => assignmentsTable.id, { onDelete: "cascade" }),
    studentName: text("student_name").notNull(),
    content: text("content").notNull(),
    attachmentName: text("attachment_name"),
    attachmentMimeType: text("attachment_mime_type"),
    attachmentSize: integer("attachment_size"),
    attachmentPath: text("attachment_path"),
    attachmentUrl: text("attachment_url"),
    grade: integer("grade"),
    submittedAt: timestamp("submitted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    uniqueStudentAssignment: unique().on(t.studentName, t.assignmentId),
  }),
);

export type Submission = typeof submissionsTable.$inferSelect;

import { integer, pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";
import { quizzesTable } from "./quizzes";

export type QuizAnswer = {
  questionId: string;
  selectedIndex: number;
};

export const quizAttemptsTable = pgTable("quiz_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  quizId: uuid("quiz_id")
    .notNull()
    .references(() => quizzesTable.id, { onDelete: "cascade" }),
  studentName: text("student_name").notNull(),
  score: integer("score").notNull(),
  totalPoints: integer("total_points").notNull(),
  answers: jsonb("answers").$type<QuizAnswer[]>().notNull(),
  submittedAt: timestamp("submitted_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type QuizAttempt = typeof quizAttemptsTable.$inferSelect;

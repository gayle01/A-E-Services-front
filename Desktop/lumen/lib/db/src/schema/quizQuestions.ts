import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { quizzesTable } from "./quizzes";

export const quizQuestionsTable = pgTable("quiz_questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  quizId: uuid("quiz_id")
    .notNull()
    .references(() => quizzesTable.id, { onDelete: "cascade" }),
  prompt: text("prompt").notNull(),
  options: text("options").array().notNull(),
  correctIndex: integer("correct_index").notNull(),
  points: integer("points").notNull().default(10),
  orderIndex: integer("order_index").notNull().default(0),
});

export type QuizQuestion = typeof quizQuestionsTable.$inferSelect;

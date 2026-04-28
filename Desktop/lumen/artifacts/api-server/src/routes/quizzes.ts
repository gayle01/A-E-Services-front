import { Router, type IRouter } from "express";
import { desc, eq, inArray, sql } from "drizzle-orm";
import {
  db,
  quizzesTable,
  quizQuestionsTable,
  quizAttemptsTable,
  coursesTable,
} from "@workspace/db";
import {
  CreateQuizBody,
  UpdateQuizBody,
  GetQuizParams,
  UpdateQuizParams,
  DeleteQuizParams,
  ListQuizzesResponse,
  GetQuizResponse,
  UpdateQuizResponse,
  SubmitQuizAttemptParams,
  SubmitQuizAttemptBody,
  ListMyQuizAttemptsResponse,
} from "@workspace/api-zod";
import { getCurrentStudent } from "../lib/currentStudent";

const router: IRouter = Router();

router.get("/quizzes", async (_req, res): Promise<void> => {
  const rows = await db
    .select({ q: quizzesTable, courseTitle: coursesTable.title })
    .from(quizzesTable)
    .innerJoin(coursesTable, eq(quizzesTable.courseId, coursesTable.id))
    .orderBy(desc(quizzesTable.createdAt));

  if (rows.length === 0) {
    res.json(ListQuizzesResponse.parse([]));
    return;
  }

  const quizIds = rows.map((r) => r.q.id);
  const aggregations = await db
    .select({
      quizId: quizQuestionsTable.quizId,
      questionCount: sql<number>`COUNT(*)::int`,
      totalPoints: sql<number>`COALESCE(SUM(${quizQuestionsTable.points}), 0)::int`,
    })
    .from(quizQuestionsTable)
    .where(inArray(quizQuestionsTable.quizId, quizIds))
    .groupBy(quizQuestionsTable.quizId);
  const aggMap = new Map(
    aggregations.map((a) => [
      a.quizId,
      { questionCount: Number(a.questionCount), totalPoints: Number(a.totalPoints) },
    ]),
  );

  res.json(
    ListQuizzesResponse.parse(
      rows.map((r) => {
        const agg = aggMap.get(r.q.id) ?? { questionCount: 0, totalPoints: 0 };
        return {
          id: r.q.id,
          courseId: r.q.courseId,
          courseTitle: r.courseTitle,
          title: r.q.title,
          description: r.q.description,
          questionCount: agg.questionCount,
          totalPoints: agg.totalPoints,
          createdAt: r.q.createdAt.toISOString(),
        };
      }),
    ),
  );
});

router.post("/quizzes", async (req, res): Promise<void> => {
  const parsed = CreateQuizBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [course] = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.id, parsed.data.courseId));
  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }

  const [created] = await db
    .insert(quizzesTable)
    .values({
      courseId: parsed.data.courseId,
      title: parsed.data.title,
      description: parsed.data.description,
    })
    .returning();
  if (!created) {
    res.status(500).json({ error: "Failed to create quiz" });
    return;
  }

  if (parsed.data.questions.length > 0) {
    await db.insert(quizQuestionsTable).values(
      parsed.data.questions.map((q, idx) => ({
        quizId: created.id,
        prompt: q.prompt,
        options: q.options,
        correctIndex: q.correctIndex,
        points: q.points,
        orderIndex: idx,
      })),
    );
  }

  const totalPoints = parsed.data.questions.reduce((s, q) => s + q.points, 0);

  res.status(201).json({
    id: created.id,
    courseId: created.courseId,
    courseTitle: course.title,
    title: created.title,
    description: created.description,
    questionCount: parsed.data.questions.length,
    totalPoints,
    createdAt: created.createdAt.toISOString(),
  });
});

router.get("/quizzes/:quizId", async (req, res): Promise<void> => {
  const params = GetQuizParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select({ q: quizzesTable, courseTitle: coursesTable.title })
    .from(quizzesTable)
    .innerJoin(coursesTable, eq(quizzesTable.courseId, coursesTable.id))
    .where(eq(quizzesTable.id, params.data.quizId));
  if (!row) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }
  const questions = await db
    .select()
    .from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.quizId, params.data.quizId))
    .orderBy(quizQuestionsTable.orderIndex);

  const totalPoints = questions.reduce((s, q) => s + q.points, 0);

  res.json(
    GetQuizResponse.parse({
      id: row.q.id,
      courseId: row.q.courseId,
      courseTitle: row.courseTitle,
      title: row.q.title,
      description: row.q.description,
      questionCount: questions.length,
      totalPoints,
      createdAt: row.q.createdAt.toISOString(),
      questions: questions.map((q) => ({
        id: q.id,
        prompt: q.prompt,
        options: q.options,
        points: q.points,
        orderIndex: q.orderIndex,
      })),
    }),
  );
});

router.patch("/quizzes/:quizId", async (req, res): Promise<void> => {
  const params = UpdateQuizParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateQuizBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updates: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.description !== undefined)
    updates.description = parsed.data.description;

  let updated: typeof quizzesTable.$inferSelect | undefined;
  if (Object.keys(updates).length > 0) {
    [updated] = await db
      .update(quizzesTable)
      .set(updates)
      .where(eq(quizzesTable.id, params.data.quizId))
      .returning();
  } else {
    [updated] = await db
      .select()
      .from(quizzesTable)
      .where(eq(quizzesTable.id, params.data.quizId));
  }
  if (!updated) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }

  if (parsed.data.questions) {
    await db
      .delete(quizQuestionsTable)
      .where(eq(quizQuestionsTable.quizId, updated.id));
    if (parsed.data.questions.length > 0) {
      await db.insert(quizQuestionsTable).values(
        parsed.data.questions.map((q, idx) => ({
          quizId: updated!.id,
          prompt: q.prompt,
          options: q.options,
          correctIndex: q.correctIndex,
          points: q.points,
          orderIndex: idx,
        })),
      );
    }
  }

  const [course] = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.id, updated.courseId));
  const questions = await db
    .select()
    .from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.quizId, updated.id));

  res.json(
    UpdateQuizResponse.parse({
      id: updated.id,
      courseId: updated.courseId,
      courseTitle: course?.title ?? "",
      title: updated.title,
      description: updated.description,
      questionCount: questions.length,
      totalPoints: questions.reduce((s, q) => s + q.points, 0),
      createdAt: updated.createdAt.toISOString(),
    }),
  );
});

router.delete("/quizzes/:quizId", async (req, res): Promise<void> => {
  const params = DeleteQuizParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db
    .delete(quizzesTable)
    .where(eq(quizzesTable.id, params.data.quizId))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }
  res.sendStatus(204);
});

router.post(
  "/quizzes/:quizId/attempts",
  async (req, res): Promise<void> => {
    const params = SubmitQuizAttemptParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const parsed = SubmitQuizAttemptBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const studentName = getCurrentStudent(req);

    const questions = await db
      .select()
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.quizId, params.data.quizId))
      .orderBy(quizQuestionsTable.orderIndex);

    if (questions.length === 0) {
      res.status(404).json({ error: "Quiz has no questions" });
      return;
    }

    const answerByQuestion = new Map(
      parsed.data.answers.map((a) => [a.questionId, a.selectedIndex]),
    );

    let score = 0;
    const totalPoints = questions.reduce((s, q) => s + q.points, 0);
    const breakdown = questions.map((q) => {
      const selected = answerByQuestion.get(q.id) ?? -1;
      const isCorrect = selected === q.correctIndex;
      if (isCorrect) score += q.points;
      return {
        questionId: q.id,
        prompt: q.prompt,
        selectedIndex: selected,
        correctIndex: q.correctIndex,
        isCorrect,
      };
    });

    const [attempt] = await db
      .insert(quizAttemptsTable)
      .values({
        quizId: params.data.quizId,
        studentName,
        score,
        totalPoints,
        answers: parsed.data.answers,
      })
      .returning();
    if (!attempt) {
      res.status(500).json({ error: "Failed to record attempt" });
      return;
    }

    const percent =
      totalPoints === 0 ? 0 : Math.round((score / totalPoints) * 100);

    res.status(201).json({
      id: attempt.id,
      quizId: attempt.quizId,
      score,
      totalPoints,
      percent,
      submittedAt: attempt.submittedAt.toISOString(),
      breakdown,
    });
  },
);

router.get("/quiz-attempts/my", async (req, res): Promise<void> => {
  const studentName = getCurrentStudent(req);
  const rows = await db
    .select({
      attempt: quizAttemptsTable,
      quizTitle: quizzesTable.title,
      courseTitle: coursesTable.title,
    })
    .from(quizAttemptsTable)
    .innerJoin(quizzesTable, eq(quizAttemptsTable.quizId, quizzesTable.id))
    .innerJoin(coursesTable, eq(quizzesTable.courseId, coursesTable.id))
    .where(eq(quizAttemptsTable.studentName, studentName))
    .orderBy(desc(quizAttemptsTable.submittedAt));

  res.json(
    ListMyQuizAttemptsResponse.parse(
      rows.map((r) => ({
        id: r.attempt.id,
        quizId: r.attempt.quizId,
        quizTitle: r.quizTitle,
        courseTitle: r.courseTitle,
        score: r.attempt.score,
        totalPoints: r.attempt.totalPoints,
        percent:
          r.attempt.totalPoints === 0
            ? 0
            : Math.round((r.attempt.score / r.attempt.totalPoints) * 100),
        submittedAt: r.attempt.submittedAt.toISOString(),
      })),
    ),
  );
});

export default router;

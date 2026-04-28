import { Router, type IRouter } from "express";
import { and, eq, max } from "drizzle-orm";
import {
  db,
  lessonsTable,
  coursesTable,
  lessonCompletionsTable,
} from "@workspace/db";
import {
  ListLessonsForCourseParams,
  ListLessonsForCourseResponse,
  CreateLessonParams,
  CreateLessonBody,
  GetLessonParams,
  GetLessonResponse,
  UpdateLessonParams,
  UpdateLessonBody,
  UpdateLessonResponse,
  DeleteLessonParams,
  CompleteLessonParams,
  CompleteLessonResponse,
} from "@workspace/api-zod";
import { getCurrentStudent } from "../lib/currentStudent";

const router: IRouter = Router();

function serializeLesson(l: typeof lessonsTable.$inferSelect) {
  return {
    id: l.id,
    courseId: l.courseId,
    title: l.title,
    content: l.content,
    durationMinutes: l.durationMinutes ?? undefined,
    orderIndex: l.orderIndex,
    createdAt: l.createdAt.toISOString(),
  };
}

router.get(
  "/courses/:courseId/lessons",
  async (req, res): Promise<void> => {
    const params = ListLessonsForCourseParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const lessons = await db
      .select()
      .from(lessonsTable)
      .where(eq(lessonsTable.courseId, params.data.courseId))
      .orderBy(lessonsTable.orderIndex);
    res.json(ListLessonsForCourseResponse.parse(lessons.map(serializeLesson)));
  },
);

router.post(
  "/courses/:courseId/lessons",
  async (req, res): Promise<void> => {
    const params = CreateLessonParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const parsed = CreateLessonBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const [course] = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.id, params.data.courseId));
    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return;
    }

    let orderIndex = parsed.data.orderIndex;
    if (orderIndex === undefined || orderIndex === null) {
      const [{ value }] = await db
        .select({ value: max(lessonsTable.orderIndex) })
        .from(lessonsTable)
        .where(eq(lessonsTable.courseId, params.data.courseId));
      orderIndex = (value ?? -1) + 1;
    }

    const [lesson] = await db
      .insert(lessonsTable)
      .values({
        courseId: params.data.courseId,
        title: parsed.data.title,
        content: parsed.data.content,
        durationMinutes: parsed.data.durationMinutes ?? null,
        orderIndex,
      })
      .returning();

    if (!lesson) {
      res.status(500).json({ error: "Failed to create lesson" });
      return;
    }
    res.status(201).json(serializeLesson(lesson));
  },
);

router.get("/lessons/:lessonId", async (req, res): Promise<void> => {
  const params = GetLessonParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [lesson] = await db
    .select()
    .from(lessonsTable)
    .where(eq(lessonsTable.id, params.data.lessonId));
  if (!lesson) {
    res.status(404).json({ error: "Lesson not found" });
    return;
  }
  res.json(GetLessonResponse.parse(serializeLesson(lesson)));
});

router.patch("/lessons/:lessonId", async (req, res): Promise<void> => {
  const params = UpdateLessonParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateLessonBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updates: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.content !== undefined) updates.content = parsed.data.content;
  if (parsed.data.durationMinutes !== undefined)
    updates.durationMinutes = parsed.data.durationMinutes;
  if (parsed.data.orderIndex !== undefined)
    updates.orderIndex = parsed.data.orderIndex;

  const [updated] = await db
    .update(lessonsTable)
    .set(updates)
    .where(eq(lessonsTable.id, params.data.lessonId))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Lesson not found" });
    return;
  }
  res.json(UpdateLessonResponse.parse(serializeLesson(updated)));
});

router.delete("/lessons/:lessonId", async (req, res): Promise<void> => {
  const params = DeleteLessonParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db
    .delete(lessonsTable)
    .where(eq(lessonsTable.id, params.data.lessonId))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Lesson not found" });
    return;
  }
  res.sendStatus(204);
});

router.post("/lessons/:lessonId/complete", async (req, res): Promise<void> => {
  const params = CompleteLessonParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [lesson] = await db
    .select()
    .from(lessonsTable)
    .where(eq(lessonsTable.id, params.data.lessonId));
  if (!lesson) {
    res.status(404).json({ error: "Lesson not found" });
    return;
  }

  const studentName = getCurrentStudent(req);

  const [existing] = await db
    .select()
    .from(lessonCompletionsTable)
    .where(
      and(
        eq(lessonCompletionsTable.lessonId, params.data.lessonId),
        eq(lessonCompletionsTable.studentName, studentName),
      ),
    );

  if (existing) {
    res.json(
      CompleteLessonResponse.parse({
        lessonId: existing.lessonId,
        completedAt: existing.completedAt.toISOString(),
      }),
    );
    return;
  }

  const [created] = await db
    .insert(lessonCompletionsTable)
    .values({
      lessonId: params.data.lessonId,
      studentName,
    })
    .returning();

  if (!created) {
    res.status(500).json({ error: "Failed to record completion" });
    return;
  }

  res.json(
    CompleteLessonResponse.parse({
      lessonId: created.lessonId,
      completedAt: created.completedAt.toISOString(),
    }),
  );
});

export default router;

import { Router, type IRouter } from "express";
import { eq, count, inArray } from "drizzle-orm";
import {
  db,
  coursesTable,
  lessonsTable,
  enrollmentsTable,
} from "@workspace/db";
import {
  CreateCourseBody,
  UpdateCourseBody,
  GetCourseParams,
  UpdateCourseParams,
  DeleteCourseParams,
  ListCoursesResponse,
  GetCourseResponse,
  UpdateCourseResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function serializeCourse(
  c: typeof coursesTable.$inferSelect,
  lessonCount: number,
  enrolledCount: number,
) {
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    category: c.category,
    level: c.level,
    coverColor: c.coverColor,
    instructor: c.instructor ?? undefined,
    createdAt: c.createdAt.toISOString(),
    lessonCount,
    enrolledCount,
  };
}

router.get("/courses", async (_req, res): Promise<void> => {
  const courses = await db
    .select()
    .from(coursesTable)
    .orderBy(coursesTable.createdAt);
  if (courses.length === 0) {
    res.json(ListCoursesResponse.parse([]));
    return;
  }
  const ids = courses.map((c) => c.id);
  const lessonCounts = await db
    .select({ courseId: lessonsTable.courseId, n: count() })
    .from(lessonsTable)
    .where(inArray(lessonsTable.courseId, ids))
    .groupBy(lessonsTable.courseId);
  const enrolledCounts = await db
    .select({ courseId: enrollmentsTable.courseId, n: count() })
    .from(enrollmentsTable)
    .where(inArray(enrollmentsTable.courseId, ids))
    .groupBy(enrollmentsTable.courseId);
  const lessonMap = new Map(lessonCounts.map((r) => [r.courseId, Number(r.n)]));
  const enrolledMap = new Map(
    enrolledCounts.map((r) => [r.courseId, Number(r.n)]),
  );

  const items = courses.map((c) =>
    serializeCourse(c, lessonMap.get(c.id) ?? 0, enrolledMap.get(c.id) ?? 0),
  );
  res.json(ListCoursesResponse.parse(items));
});

router.post("/courses", async (req, res): Promise<void> => {
  const parsed = CreateCourseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [course] = await db
    .insert(coursesTable)
    .values({
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      level: parsed.data.level,
      coverColor: parsed.data.coverColor ?? "#6366f1",
      instructor: parsed.data.instructor ?? null,
    })
    .returning();

  if (!course) {
    res.status(500).json({ error: "Failed to create course" });
    return;
  }

  res.status(201).json(serializeCourse(course, 0, 0));
});

router.get("/courses/:courseId", async (req, res): Promise<void> => {
  const params = GetCourseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
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

  const lessons = await db
    .select()
    .from(lessonsTable)
    .where(eq(lessonsTable.courseId, params.data.courseId))
    .orderBy(lessonsTable.orderIndex);

  const [{ value: enrolledCount }] = await db
    .select({ value: count() })
    .from(enrollmentsTable)
    .where(eq(enrollmentsTable.courseId, params.data.courseId));

  const detail = {
    ...serializeCourse(course, lessons.length, Number(enrolledCount)),
    lessons: lessons.map((l) => ({
      id: l.id,
      courseId: l.courseId,
      title: l.title,
      content: l.content,
      durationMinutes: l.durationMinutes ?? undefined,
      orderIndex: l.orderIndex,
      createdAt: l.createdAt.toISOString(),
    })),
  };

  res.json(GetCourseResponse.parse(detail));
});

router.patch("/courses/:courseId", async (req, res): Promise<void> => {
  const params = UpdateCourseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateCourseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.description !== undefined)
    updates.description = parsed.data.description;
  if (parsed.data.category !== undefined)
    updates.category = parsed.data.category;
  if (parsed.data.level !== undefined) updates.level = parsed.data.level;
  if (parsed.data.coverColor !== undefined)
    updates.coverColor = parsed.data.coverColor;
  if (parsed.data.instructor !== undefined)
    updates.instructor = parsed.data.instructor;

  const [updated] = await db
    .update(coursesTable)
    .set(updates)
    .where(eq(coursesTable.id, params.data.courseId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Course not found" });
    return;
  }

  const [{ value: lessonCount }] = await db
    .select({ value: count() })
    .from(lessonsTable)
    .where(eq(lessonsTable.courseId, updated.id));
  const [{ value: enrolledCount }] = await db
    .select({ value: count() })
    .from(enrollmentsTable)
    .where(eq(enrollmentsTable.courseId, updated.id));

  res.json(
    UpdateCourseResponse.parse(
      serializeCourse(updated, Number(lessonCount), Number(enrolledCount)),
    ),
  );
});

router.delete("/courses/:courseId", async (req, res): Promise<void> => {
  const params = DeleteCourseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db
    .delete(coursesTable)
    .where(eq(coursesTable.id, params.data.courseId))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Course not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;

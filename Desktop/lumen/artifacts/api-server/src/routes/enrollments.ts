import { Router, type IRouter } from "express";
import { and, eq, inArray, sql } from "drizzle-orm";
import {
  db,
  coursesTable,
  enrollmentsTable,
  lessonsTable,
  lessonCompletionsTable,
} from "@workspace/db";
import {
  EnrollInCourseBody,
  ListEnrollmentsResponse,
} from "@workspace/api-zod";
import { getCurrentStudent } from "../lib/currentStudent";

const router: IRouter = Router();

router.get("/enrollments", async (req, res): Promise<void> => {
  const studentName = getCurrentStudent(req);

  const enrollments = await db
    .select({
      enrollment: enrollmentsTable,
      course: coursesTable,
    })
    .from(enrollmentsTable)
    .innerJoin(coursesTable, eq(enrollmentsTable.courseId, coursesTable.id))
    .where(eq(enrollmentsTable.studentName, studentName));

  if (enrollments.length === 0) {
    res.json(ListEnrollmentsResponse.parse([]));
    return;
  }

  const courseIds = enrollments.map((e) => e.course.id);

  const lessonCounts = await db
    .select({
      courseId: lessonsTable.courseId,
      total: sql<number>`COUNT(*)::int`,
    })
    .from(lessonsTable)
    .where(inArray(lessonsTable.courseId, courseIds))
    .groupBy(lessonsTable.courseId);

  const completionCounts = await db
    .select({
      courseId: lessonsTable.courseId,
      done: sql<number>`COUNT(*)::int`,
    })
    .from(lessonCompletionsTable)
    .innerJoin(
      lessonsTable,
      eq(lessonCompletionsTable.lessonId, lessonsTable.id),
    )
    .where(
      and(
        eq(lessonCompletionsTable.studentName, studentName),
        inArray(lessonsTable.courseId, courseIds),
      ),
    )
    .groupBy(lessonsTable.courseId);

  const totalsByCourse = new Map(
    lessonCounts.map((r) => [r.courseId, Number(r.total)]),
  );
  const doneByCourse = new Map(
    completionCounts.map((r) => [r.courseId, Number(r.done)]),
  );
  const enrolledCounts = await db
    .select({
      courseId: enrollmentsTable.courseId,
      n: sql<number>`COUNT(*)::int`,
    })
    .from(enrollmentsTable)
    .where(inArray(enrollmentsTable.courseId, courseIds))
    .groupBy(enrollmentsTable.courseId);
  const enrolledByCourse = new Map(
    enrolledCounts.map((r) => [r.courseId, Number(r.n)]),
  );

  const items = enrollments.map((row) => {
    const total = totalsByCourse.get(row.course.id) ?? 0;
    const done = doneByCourse.get(row.course.id) ?? 0;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    return {
      id: row.enrollment.id,
      course: {
        id: row.course.id,
        title: row.course.title,
        description: row.course.description,
        category: row.course.category,
        level: row.course.level,
        coverColor: row.course.coverColor,
        instructor: row.course.instructor ?? undefined,
        createdAt: row.course.createdAt.toISOString(),
        lessonCount: total,
        enrolledCount: enrolledByCourse.get(row.course.id) ?? 0,
      },
      completedLessons: done,
      totalLessons: total,
      progressPercent: percent,
      enrolledAt: row.enrollment.enrolledAt.toISOString(),
    };
  });

  res.json(ListEnrollmentsResponse.parse(items));
});

router.post("/enrollments", async (req, res): Promise<void> => {
  const parsed = EnrollInCourseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const studentName = getCurrentStudent(req);

  const [course] = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.id, parsed.data.courseId));
  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }

  const [existing] = await db
    .select()
    .from(enrollmentsTable)
    .where(
      and(
        eq(enrollmentsTable.courseId, parsed.data.courseId),
        eq(enrollmentsTable.studentName, studentName),
      ),
    );

  if (existing) {
    res.status(201).json({
      id: existing.id,
      courseId: existing.courseId,
      studentName: existing.studentName,
      enrolledAt: existing.enrolledAt.toISOString(),
    });
    return;
  }

  const [created] = await db
    .insert(enrollmentsTable)
    .values({
      courseId: parsed.data.courseId,
      studentName,
    })
    .returning();
  if (!created) {
    res.status(500).json({ error: "Failed to enroll" });
    return;
  }
  res.status(201).json({
    id: created.id,
    courseId: created.courseId,
    studentName: created.studentName,
    enrolledAt: created.enrolledAt.toISOString(),
  });
});

export default router;

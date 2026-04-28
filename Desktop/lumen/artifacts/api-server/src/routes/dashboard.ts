import { Router, type IRouter } from "express";
import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import {
  db,
  coursesTable,
  lessonsTable,
  enrollmentsTable,
  lessonCompletionsTable,
  assignmentsTable,
  submissionsTable,
  quizzesTable,
  quizAttemptsTable,
} from "@workspace/db";
import {
  GetStudentDashboardResponse,
  GetAdminDashboardResponse,
  GetRecentActivityResponse,
} from "@workspace/api-zod";
import { getCurrentStudent } from "../lib/currentStudent";

const router: IRouter = Router();

router.get("/dashboard/student", async (req, res): Promise<void> => {
  const studentName = getCurrentStudent(req);

  const enrollments = await db
    .select({ enrollment: enrollmentsTable, course: coursesTable })
    .from(enrollmentsTable)
    .innerJoin(coursesTable, eq(enrollmentsTable.courseId, coursesTable.id))
    .where(eq(enrollmentsTable.studentName, studentName));

  const courseIds = enrollments.map((e) => e.course.id);

  const lessonTotals =
    courseIds.length === 0
      ? []
      : await db
          .select({
            courseId: lessonsTable.courseId,
            total: sql<number>`COUNT(*)::int`,
          })
          .from(lessonsTable)
          .where(inArray(lessonsTable.courseId, courseIds))
          .groupBy(lessonsTable.courseId);

  const completionTotals =
    courseIds.length === 0
      ? []
      : await db
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

  const totalsMap = new Map(lessonTotals.map((r) => [r.courseId, Number(r.total)]));
  const doneMap = new Map(completionTotals.map((r) => [r.courseId, Number(r.done)]));
  const completedLessons = Array.from(doneMap.values()).reduce((a, b) => a + b, 0);

  const enrolledCountsByCourse =
    courseIds.length === 0
      ? []
      : await db
          .select({
            courseId: enrollmentsTable.courseId,
            n: sql<number>`COUNT(*)::int`,
          })
          .from(enrollmentsTable)
          .where(inArray(enrollmentsTable.courseId, courseIds))
          .groupBy(enrollmentsTable.courseId);
  const enrolledMap = new Map(
    enrolledCountsByCourse.map((r) => [r.courseId, Number(r.n)]),
  );

  const currentEnrollments = enrollments.map((row) => {
    const total = totalsMap.get(row.course.id) ?? 0;
    const done = doneMap.get(row.course.id) ?? 0;
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
        enrolledCount: enrolledMap.get(row.course.id) ?? 0,
      },
      completedLessons: done,
      totalLessons: total,
      progressPercent: percent,
      enrolledAt: row.enrollment.enrolledAt.toISOString(),
    };
  });

  const allAssignments = await db
    .select({ a: assignmentsTable, courseTitle: coursesTable.title })
    .from(assignmentsTable)
    .innerJoin(coursesTable, eq(assignmentsTable.courseId, coursesTable.id))
    .orderBy(assignmentsTable.dueAt);

  const submissions = await db
    .select()
    .from(submissionsTable)
    .where(eq(submissionsTable.studentName, studentName));
  const subByAssignment = new Map(submissions.map((s) => [s.assignmentId, s]));

  const upcomingAssignments = allAssignments
    .map((r) => {
      const sub = subByAssignment.get(r.a.id);
      let status: "pending" | "submitted" | "graded" = "pending";
      if (sub) {
        status =
          sub.grade !== null && sub.grade !== undefined ? "graded" : "submitted";
      }
      return {
        id: r.a.id,
        courseId: r.a.courseId,
        courseTitle: r.courseTitle,
        title: r.a.title,
        instructions: r.a.instructions,
        points: r.a.points,
        dueAt: r.a.dueAt ? r.a.dueAt.toISOString() : undefined,
        createdAt: r.a.createdAt.toISOString(),
        status,
        grade: sub?.grade ?? undefined,
        submittedAt: sub?.submittedAt.toISOString() ?? undefined,
      };
    })
    .filter((a) => a.status !== "graded")
    .slice(0, 5);

  const pendingAssignments = upcomingAssignments.filter(
    (a) => a.status === "pending",
  ).length;

  const attempts = await db
    .select()
    .from(quizAttemptsTable)
    .where(eq(quizAttemptsTable.studentName, studentName));

  const averageQuizScore =
    attempts.length === 0
      ? 0
      : Math.round(
          attempts.reduce(
            (s, a) =>
              s + (a.totalPoints === 0 ? 0 : (a.score / a.totalPoints) * 100),
            0,
          ) / attempts.length,
        );

  res.json(
    GetStudentDashboardResponse.parse({
      enrolledCourses: enrollments.length,
      completedLessons,
      pendingAssignments,
      averageQuizScore,
      currentEnrollments,
      upcomingAssignments,
    }),
  );
});

router.get("/dashboard/admin", async (_req, res): Promise<void> => {
  const [{ value: totalCourses }] = await db
    .select({ value: sql<number>`COUNT(*)::int` })
    .from(coursesTable);
  const [{ value: totalLessons }] = await db
    .select({ value: sql<number>`COUNT(*)::int` })
    .from(lessonsTable);
  const [{ value: totalAssignments }] = await db
    .select({ value: sql<number>`COUNT(*)::int` })
    .from(assignmentsTable);
  const [{ value: totalQuizzes }] = await db
    .select({ value: sql<number>`COUNT(*)::int` })
    .from(quizzesTable);
  const [{ value: totalEnrollments }] = await db
    .select({ value: sql<number>`COUNT(*)::int` })
    .from(enrollmentsTable);
  const [{ value: totalSubmissions }] = await db
    .select({ value: sql<number>`COUNT(*)::int` })
    .from(submissionsTable);

  const byCategory = await db
    .select({
      category: coursesTable.category,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(coursesTable)
    .groupBy(coursesTable.category);

  const recentSubs = await db
    .select({ s: submissionsTable, a: assignmentsTable })
    .from(submissionsTable)
    .innerJoin(
      assignmentsTable,
      eq(submissionsTable.assignmentId, assignmentsTable.id),
    )
    .orderBy(desc(submissionsTable.submittedAt))
    .limit(5);

  res.json(
    GetAdminDashboardResponse.parse({
      totalCourses: Number(totalCourses),
      totalLessons: Number(totalLessons),
      totalAssignments: Number(totalAssignments),
      totalQuizzes: Number(totalQuizzes),
      totalEnrollments: Number(totalEnrollments),
      totalSubmissions: Number(totalSubmissions),
      coursesByCategory: byCategory.map((c) => ({
        category: c.category,
        count: Number(c.count),
      })),
      recentSubmissions: recentSubs.map((r) => ({
        id: r.s.id,
        assignmentId: r.s.assignmentId,
        studentName: r.s.studentName,
        content: r.s.content,
        grade: r.s.grade ?? undefined,
        submittedAt: r.s.submittedAt.toISOString(),
        assignmentTitle: r.a.title,
      })),
    }),
  );
});

router.get("/dashboard/recent-activity", async (_req, res): Promise<void> => {
  const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);

  const enrollments = await db
    .select({ e: enrollmentsTable, c: coursesTable })
    .from(enrollmentsTable)
    .innerJoin(coursesTable, eq(enrollmentsTable.courseId, coursesTable.id))
    .where(gte(enrollmentsTable.enrolledAt, since))
    .orderBy(desc(enrollmentsTable.enrolledAt))
    .limit(10);

  const submissions = await db
    .select({ s: submissionsTable, a: assignmentsTable })
    .from(submissionsTable)
    .innerJoin(
      assignmentsTable,
      eq(submissionsTable.assignmentId, assignmentsTable.id),
    )
    .where(gte(submissionsTable.submittedAt, since))
    .orderBy(desc(submissionsTable.submittedAt))
    .limit(10);

  const attempts = await db
    .select({ a: quizAttemptsTable, q: quizzesTable })
    .from(quizAttemptsTable)
    .innerJoin(quizzesTable, eq(quizAttemptsTable.quizId, quizzesTable.id))
    .where(gte(quizAttemptsTable.submittedAt, since))
    .orderBy(desc(quizAttemptsTable.submittedAt))
    .limit(10);

  const completions = await db
    .select({ c: lessonCompletionsTable, l: lessonsTable })
    .from(lessonCompletionsTable)
    .innerJoin(lessonsTable, eq(lessonCompletionsTable.lessonId, lessonsTable.id))
    .where(gte(lessonCompletionsTable.completedAt, since))
    .orderBy(desc(lessonCompletionsTable.completedAt))
    .limit(10);

  type Item = {
    id: string;
    type: "enrollment" | "submission" | "quiz_attempt" | "lesson_completion";
    description: string;
    actorName?: string;
    occurredAt: string;
    sortKey: number;
  };

  const items: Item[] = [
    ...enrollments.map((r) => ({
      id: `e-${r.e.id}`,
      type: "enrollment" as const,
      description: `${r.e.studentName} enrolled in ${r.c.title}`,
      actorName: r.e.studentName,
      occurredAt: r.e.enrolledAt.toISOString(),
      sortKey: r.e.enrolledAt.getTime(),
    })),
    ...submissions.map((r) => ({
      id: `s-${r.s.id}`,
      type: "submission" as const,
      description: `${r.s.studentName} submitted ${r.a.title}`,
      actorName: r.s.studentName,
      occurredAt: r.s.submittedAt.toISOString(),
      sortKey: r.s.submittedAt.getTime(),
    })),
    ...attempts.map((r) => ({
      id: `q-${r.a.id}`,
      type: "quiz_attempt" as const,
      description: `${r.a.studentName} scored ${r.a.totalPoints === 0 ? 0 : Math.round((r.a.score / r.a.totalPoints) * 100)}% on ${r.q.title}`,
      actorName: r.a.studentName,
      occurredAt: r.a.submittedAt.toISOString(),
      sortKey: r.a.submittedAt.getTime(),
    })),
    ...completions.map((r) => ({
      id: `l-${r.c.id}`,
      type: "lesson_completion" as const,
      description: `${r.c.studentName} completed ${r.l.title}`,
      actorName: r.c.studentName,
      occurredAt: r.c.completedAt.toISOString(),
      sortKey: r.c.completedAt.getTime(),
    })),
  ];

  items.sort((a, b) => b.sortKey - a.sortKey);

  res.json(
    GetRecentActivityResponse.parse(
      items.slice(0, 15).map(({ sortKey: _sortKey, ...rest }) => rest),
    ),
  );
});

export default router;

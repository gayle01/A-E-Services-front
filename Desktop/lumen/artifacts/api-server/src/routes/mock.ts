import { Router, type IRouter } from "express";

type CourseLevel = "beginner" | "intermediate" | "advanced";
type AssignmentStatus = "pending" | "submitted" | "graded";
type ActivityType = "enrollment" | "submission" | "quiz_attempt" | "lesson_completion";

function nowIso(): string {
  return new Date().toISOString();
}

function clampInt(value: unknown, fallback: number): number {
  const n = typeof value === "string" ? Number(value) : typeof value === "number" ? value : NaN;
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

const course1Id = "course_intro_web";
const course2Id = "course_sql_basics";

const courses = [
  {
    id: course1Id,
    title: "Intro to Web Development",
    description: "HTML, CSS, and a tiny bit of JavaScript to get you started.",
    category: "Web",
    level: "beginner" as CourseLevel,
    coverColor: "#2563eb",
    instructor: "Lumen Team",
    createdAt: nowIso(),
    lessonCount: 3,
    enrolledCount: 1,
  },
  {
    id: course2Id,
    title: "SQL Basics",
    description: "Learn SELECT, filtering, joins, and grouping with practice.",
    category: "Database",
    level: "beginner" as CourseLevel,
    coverColor: "#16a34a",
    instructor: "Lumen Team",
    createdAt: nowIso(),
    lessonCount: 2,
    enrolledCount: 0,
  },
];

const lessons = [
  {
    id: "lesson_html",
    courseId: course1Id,
    title: "HTML Foundations",
    content: "## HTML Foundations\n\nWelcome! This is sample content (mock API mode).",
    durationMinutes: 12,
    orderIndex: 1,
    createdAt: nowIso(),
  },
  {
    id: "lesson_css",
    courseId: course1Id,
    title: "CSS Layout",
    content: "## CSS Layout\n\nFlexbox, grid, and spacing basics (mock API mode).",
    durationMinutes: 18,
    orderIndex: 2,
    createdAt: nowIso(),
  },
  {
    id: "lesson_js",
    courseId: course1Id,
    title: "JavaScript Basics",
    content: "## JavaScript Basics\n\nVariables, functions, and events (mock API mode).",
    durationMinutes: 20,
    orderIndex: 3,
    createdAt: nowIso(),
  },
  {
    id: "lesson_sql_select",
    courseId: course2Id,
    title: "SELECT + WHERE",
    content: "## SELECT + WHERE\n\nQuerying and filtering rows (mock API mode).",
    durationMinutes: 15,
    orderIndex: 1,
    createdAt: nowIso(),
  },
  {
    id: "lesson_sql_joins",
    courseId: course2Id,
    title: "Joins",
    content: "## Joins\n\nINNER JOIN, LEFT JOIN (mock API mode).",
    durationMinutes: 22,
    orderIndex: 2,
    createdAt: nowIso(),
  },
];

const assignments = [
  {
    id: "assignment_portfolio",
    courseId: course1Id,
    courseTitle: "Intro to Web Development",
    title: "Build a simple portfolio page",
    instructions: "Create a one-page site with a header, about section, and projects list.",
    points: 100,
    dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: nowIso(),
  },
];

type MockQuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  points: number;
  orderIndex: number;
};

type MockQuiz = {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  description: string;
  createdAt: string;
  questionCount: number;
  totalPoints: number;
  questions: MockQuizQuestion[];
};

const quizzes: Array<MockQuiz> = [];
const quizAttempts: Array<any> = [];
const lessonCompletions = new Set<string>();
const enrollmentIdsByCourseId = new Map<string, string>([[course1Id, "enroll_1"]]);
const submissionsByAssignmentId = new Map<string, Array<any>>();

function getCourse(courseId: string) {
  return courses.find((c) => c.id === courseId) ?? null;
}

function getLesson(lessonId: string) {
  return lessons.find((l) => l.id === lessonId) ?? null;
}

function assignmentStatusFor(assignmentId: string): {
  status: AssignmentStatus;
  grade?: number;
  submittedAt?: string;
} {
  // Mock mode: always pending unless the client posts a submission.
  const latest = submissionsByAssignmentId.get(assignmentId)?.at(-1);
  if (latest) {
    return {
      status: "submitted",
      submittedAt: latest.submittedAt,
      grade: latest.grade ?? undefined,
    };
  }
  return { status: "pending" };
}

function studentDashboard() {
  const enrolledCourse = getCourse(course1Id);
  const enrolledLessons = lessons.filter((l) => l.courseId === course1Id);
  const completedLessons = enrolledLessons.filter((l) => lessonCompletions.has(l.id)).length;
  const totalLessons = enrolledLessons.length || 1;
  const progressPercent = Math.round((completedLessons / totalLessons) * 100);

  return {
    enrolledCourses: enrolledCourse ? 1 : 0,
    completedLessons,
    pendingAssignments: assignments.length,
    averageQuizScore: 0,
    currentEnrollments: enrolledCourse
      ? [
          {
            id: enrollmentIdsByCourseId.get(course1Id) ?? "enroll_1",
            course: enrolledCourse,
            completedLessons,
            totalLessons,
            progressPercent,
            enrolledAt: nowIso(),
          },
        ]
      : [],
    upcomingAssignments: assignments.map((a) => ({ ...a, ...assignmentStatusFor(a.id) })),
  };
}

function recentActivity() {
  const items: Array<{
    id: string;
    type: ActivityType;
    description: string;
    actorName?: string;
    occurredAt: string;
  }> = [];

  items.push({
    id: "activity_enroll",
    type: "enrollment",
    description: "Enrolled in Intro to Web Development",
    occurredAt: nowIso(),
  });

  for (const lessonId of lessonCompletions) {
    const lesson = getLesson(lessonId);
    if (!lesson) continue;
    items.push({
      id: `activity_${lessonId}`,
      type: "lesson_completion",
      description: `Completed lesson: ${lesson.title}`,
      occurredAt: nowIso(),
    });
  }

  return items.slice(0, 20);
}

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

router.get("/courses", (_req, res) => {
  res.json(courses);
});

router.post("/courses", (req, res) => {
  const title = typeof req.body?.title === "string" ? req.body.title : "Untitled course";
  const description =
    typeof req.body?.description === "string" ? req.body.description : "Mock course";
  const category = typeof req.body?.category === "string" ? req.body.category : "General";
  const level = (req.body?.level as CourseLevel) ?? "beginner";
  const coverColor = typeof req.body?.coverColor === "string" ? req.body.coverColor : "#64748b";
  const instructor = typeof req.body?.instructor === "string" ? req.body.instructor : "Lumen Team";

  const course = {
    id: `course_${Date.now()}`,
    title,
    description,
    category,
    level,
    coverColor,
    instructor,
    createdAt: nowIso(),
    lessonCount: 0,
    enrolledCount: 0,
  };
  courses.push(course);
  res.status(201).json(course);
});

router.get("/courses/:courseId", (req, res) => {
  const course = getCourse(req.params.courseId);
  if (!course) return res.status(404).json({ message: "Course not found" });

  const courseLessons = lessons
    .filter((l) => l.courseId === course.id)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  res.json({ ...course, lessons: courseLessons });
});

router.patch("/courses/:courseId", (req, res) => {
  const course = getCourse(req.params.courseId);
  if (!course) return res.status(404).json({ message: "Course not found" });

  Object.assign(course, req.body ?? {});
  res.json(course);
});

router.delete("/courses/:courseId", (req, res) => {
  const idx = courses.findIndex((c) => c.id === req.params.courseId);
  if (idx !== -1) courses.splice(idx, 1);
  res.status(204).end();
});

router.get("/courses/:courseId/lessons", (req, res) => {
  const courseId = req.params.courseId;
  res.json(lessons.filter((l) => l.courseId === courseId).sort((a, b) => a.orderIndex - b.orderIndex));
});

router.post("/courses/:courseId/lessons", (req, res) => {
  const courseId = req.params.courseId;
  const title = typeof req.body?.title === "string" ? req.body.title : "Untitled lesson";
  const content = typeof req.body?.content === "string" ? req.body.content : "";
  const durationMinutes = clampInt(req.body?.durationMinutes, 10);
  const orderIndex = clampInt(req.body?.orderIndex, lessons.filter((l) => l.courseId === courseId).length + 1);

  const lesson = {
    id: `lesson_${Date.now()}`,
    courseId,
    title,
    content,
    durationMinutes,
    orderIndex,
    createdAt: nowIso(),
  };
  lessons.push(lesson);
  res.status(201).json(lesson);
});

router.get("/lessons/:lessonId", (req, res) => {
  const lesson = getLesson(req.params.lessonId);
  if (!lesson) return res.status(404).json({ message: "Lesson not found" });
  res.json(lesson);
});

router.patch("/lessons/:lessonId", (req, res) => {
  const lesson = getLesson(req.params.lessonId);
  if (!lesson) return res.status(404).json({ message: "Lesson not found" });
  Object.assign(lesson, req.body ?? {});
  res.json(lesson);
});

router.delete("/lessons/:lessonId", (req, res) => {
  const idx = lessons.findIndex((l) => l.id === req.params.lessonId);
  if (idx !== -1) lessons.splice(idx, 1);
  res.status(204).end();
});

router.post("/lessons/:lessonId/complete", (req, res) => {
  const lessonId = req.params.lessonId;
  const lesson = getLesson(lessonId);
  if (!lesson) return res.status(404).json({ message: "Lesson not found" });

  lessonCompletions.add(lessonId);
  res.json({ lessonId, completedAt: nowIso() });
});

router.get("/enrollments", (_req, res) => {
  // Return enrollments with progress (EnrollmentWithProgress)
  const result = [];

  for (const [courseId, enrollmentId] of enrollmentIdsByCourseId.entries()) {
    const course = getCourse(courseId);
    if (!course) continue;
    const courseLessons = lessons.filter((l) => l.courseId === courseId);
    const completedLessons = courseLessons.filter((l) => lessonCompletions.has(l.id)).length;
    const totalLessons = courseLessons.length || 1;
    const progressPercent = Math.round((completedLessons / totalLessons) * 100);

    result.push({
      id: enrollmentId,
      course,
      completedLessons,
      totalLessons,
      progressPercent,
      enrolledAt: nowIso(),
    });
  }

  res.json(result);
});

router.post("/enrollments", (req, res) => {
  const courseId = typeof req.body?.courseId === "string" ? req.body.courseId : "";
  const course = getCourse(courseId);
  if (!course) return res.status(404).json({ message: "Course not found" });
  const id = `enroll_${Date.now()}`;
  enrollmentIdsByCourseId.set(courseId, id);
  res.status(201).json({ id, courseId, studentName: "Alex Rivera", enrolledAt: nowIso() });
});

router.get("/assignments", (_req, res) => {
  res.json(assignments);
});

router.post("/assignments", (req, res) => {
  const courseId = typeof req.body?.courseId === "string" ? req.body.courseId : course1Id;
  const course = getCourse(courseId);
  if (!course) return res.status(404).json({ message: "Course not found" });

  const assignment = {
    id: `assignment_${Date.now()}`,
    courseId,
    courseTitle: course.title,
    title: typeof req.body?.title === "string" ? req.body.title : "New assignment",
    instructions: typeof req.body?.instructions === "string" ? req.body.instructions : "",
    points: clampInt(req.body?.points, 100),
    dueAt: typeof req.body?.dueAt === "string" ? req.body.dueAt : undefined,
    createdAt: nowIso(),
  };
  assignments.push(assignment);
  res.status(201).json(assignment);
});

router.get("/assignments/my", (_req, res) => {
  res.json(assignments.map((a) => ({ ...a, ...assignmentStatusFor(a.id) })));
});

router.get("/assignments/:assignmentId", (req, res) => {
  const assignment = assignments.find((a) => a.id === req.params.assignmentId);
  if (!assignment) return res.status(404).json({ message: "Assignment not found" });
  res.json(assignment);
});

router.patch("/assignments/:assignmentId", (req, res) => {
  const assignment = assignments.find((a) => a.id === req.params.assignmentId);
  if (!assignment) return res.status(404).json({ message: "Assignment not found" });
  Object.assign(assignment, req.body ?? {});
  res.json(assignment);
});

router.delete("/assignments/:assignmentId", (req, res) => {
  const idx = assignments.findIndex((a) => a.id === req.params.assignmentId);
  if (idx !== -1) assignments.splice(idx, 1);
  res.status(204).end();
});

router.post("/assignments/:assignmentId/submissions", (req, res) => {
  const assignment = assignments.find((a) => a.id === req.params.assignmentId);
  if (!assignment) return res.status(404).json({ message: "Assignment not found" });

  const submittedAt = nowIso();
  const submission = {
    id: `sub_${Date.now()}`,
    assignmentId: assignment.id,
    studentName: "Alex Rivera",
    content: typeof req.body?.content === "string" ? req.body.content : "",
    submittedAt,
    grade: null,
    feedback: null,
  };

  const list = submissionsByAssignmentId.get(assignment.id) ?? [];
  list.push(submission);
  submissionsByAssignmentId.set(assignment.id, list);

  res.status(201).json(submission);
});

router.get("/assignments/:assignmentId/submissions", (req, res) => {
  const assignment = assignments.find((a) => a.id === req.params.assignmentId);
  if (!assignment) return res.status(404).json({ message: "Assignment not found" });
  res.json(submissionsByAssignmentId.get(assignment.id) ?? []);
});

router.get("/quizzes", (_req, res) => {
  res.json(quizzes);
});

router.post("/quizzes", (req, res) => {
  const courseId = typeof req.body?.courseId === "string" ? req.body.courseId : course1Id;
  const courseTitle = getCourse(courseId)?.title ?? "Unknown course";
  const rawQuestions = Array.isArray(req.body?.questions) ? req.body.questions : [];
  const questions: MockQuizQuestion[] = rawQuestions.map((raw: any, index: number) => ({
    id: `qq_${Date.now()}_${index}`,
    prompt: typeof raw?.prompt === "string" ? raw.prompt : "",
    options: Array.isArray(raw?.options)
      ? raw.options.map((option: unknown) => (typeof option === "string" ? option : ""))
      : ["", ""],
    correctIndex: clampInt(raw?.correctIndex, 0),
    points: clampInt(raw?.points, 1),
    orderIndex: index,
  }));

  const quiz: MockQuiz = {
    id: `quiz_${Date.now()}`,
    courseId,
    courseTitle,
    title: typeof req.body?.title === "string" ? req.body.title : "New quiz",
    description: typeof req.body?.description === "string" ? req.body.description : "",
    createdAt: nowIso(),
    questionCount: questions.length,
    totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
    questions,
  };
  quizzes.push(quiz);
  res.status(201).json(quiz);
});

router.get("/quizzes/:quizId", (req, res) => {
  const quiz = quizzes.find((q) => q.id === req.params.quizId);
  if (!quiz) return res.status(404).json({ message: "Quiz not found" });
  res.json(quiz);
});

router.patch("/quizzes/:quizId", (req, res) => {
  const quiz = quizzes.find((q) => q.id === req.params.quizId);
  if (!quiz) return res.status(404).json({ message: "Quiz not found" });
  const updates = req.body ?? {};
  const patch: Partial<MockQuiz> = {
    title: typeof updates.title === "string" ? updates.title : quiz.title,
    description: typeof updates.description === "string" ? updates.description : quiz.description,
  };

  if (Array.isArray(updates.questions)) {
    patch.questions = updates.questions.map((raw: any, index: number) => ({
      id:
        typeof raw?.id === "string" && raw.id.trim().length > 0
          ? raw.id
          : `qq_${Date.now()}_${index}`,
      prompt: typeof raw?.prompt === "string" ? raw.prompt : "",
      options: Array.isArray(raw?.options)
        ? raw.options.map((option: unknown) => (typeof option === "string" ? option : ""))
        : ["", ""],
      correctIndex: clampInt(raw?.correctIndex, 0),
      points: clampInt(raw?.points, 1),
      orderIndex: index,
    }));
    const nextQuestions = patch.questions;
    patch.questionCount = nextQuestions.length;
    patch.totalPoints = nextQuestions.reduce((sum, q) => sum + q.points, 0);
  }

  Object.assign(quiz, patch);
  res.json(quiz);
});

router.delete("/quizzes/:quizId", (req, res) => {
  const idx = quizzes.findIndex((q) => q.id === req.params.quizId);
  if (idx !== -1) quizzes.splice(idx, 1);
  res.status(204).end();
});

router.post("/quizzes/:quizId/attempts", (req, res) => {
  const quiz = quizzes.find((q) => q.id === req.params.quizId);
  if (!quiz) return res.status(404).json({ message: "Quiz not found" });

  const rawAnswers = Array.isArray(req.body?.answers) ? req.body.answers : [];
  const answerByQuestionId = new Map<string, number>();
  for (const answer of rawAnswers) {
    if (typeof answer?.questionId !== "string") continue;
    answerByQuestionId.set(answer.questionId, clampInt(answer?.selectedIndex, -1));
  }

  let score = 0;
  const breakdown = quiz.questions.map((question) => {
    const selectedIndex = answerByQuestionId.get(question.id) ?? -1;
    const isCorrect = selectedIndex === question.correctIndex;
    if (isCorrect) {
      score += question.points;
    }
    return {
      questionId: question.id,
      prompt: question.prompt,
      selectedIndex,
      correctIndex: question.correctIndex,
      isCorrect,
    };
  });

  const totalPoints = quiz.totalPoints;
  const percent = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
  const submittedAt = nowIso();
  const result = {
    id: `attempt_${Date.now()}`,
    quizId: quiz.id,
    score,
    totalPoints,
    percent,
    submittedAt,
    breakdown,
  };
  quizAttempts.push({
    id: result.id,
    quizId: quiz.id,
    quizTitle: quiz.title,
    courseTitle: getCourse(quiz.courseId)?.title ?? "",
    score: result.score,
    totalPoints: result.totalPoints,
    percent: result.percent,
    submittedAt,
  });
  res.status(201).json(result);
});

router.get("/quiz-attempts/my", (_req, res) => {
  res.json(quizAttempts.filter((a) => a.quizId));
});

router.get("/dashboard/student", (_req, res) => {
  res.json(studentDashboard());
});

router.get("/dashboard/admin", (_req, res) => {
  res.json({
    totalCourses: courses.length,
    totalLessons: lessons.length,
    totalAssignments: assignments.length,
    totalQuizzes: quizzes.length,
    totalEnrollments: enrollmentIdsByCourseId.size,
    totalSubmissions: quizAttempts.filter((a) => a.assignmentId).length,
    coursesByCategory: [],
    recentSubmissions: [],
  });
});

router.get("/dashboard/recent-activity", (_req, res) => {
  res.json(recentActivity());
});

export default router;

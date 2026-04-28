import { Router, type IRouter } from "express";

const router: IRouter = Router();

const useMockApi = process.env.MOCK_API === "1" || !process.env.DATABASE_URL;

if (useMockApi) {
  const { default: mockRouter } = await import("./mock");
  router.use(mockRouter);
} else {
  const [
    { default: healthRouter },
    { default: coursesRouter },
    { default: lessonsRouter },
    { default: enrollmentsRouter },
    { default: assignmentsRouter },
    { default: quizzesRouter },
    { default: dashboardRouter },
  ] = await Promise.all([
    import("./health"),
    import("./courses"),
    import("./lessons"),
    import("./enrollments"),
    import("./assignments"),
    import("./quizzes"),
    import("./dashboard"),
  ]);

  router.use(healthRouter);
  router.use(coursesRouter);
  router.use(lessonsRouter);
  router.use(enrollmentsRouter);
  router.use(assignmentsRouter);
  router.use(quizzesRouter);
  router.use(dashboardRouter);
}

export default router;

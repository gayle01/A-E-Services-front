import { Router, type IRouter } from "express";
import { and, desc, eq, inArray } from "drizzle-orm";
import {
  db,
  assignmentsTable,
  coursesTable,
  submissionsTable,
} from "@workspace/db";
import {
  CreateAssignmentBody,
  UpdateAssignmentBody,
  GetAssignmentParams,
  UpdateAssignmentParams,
  DeleteAssignmentParams,
  ListAssignmentsResponse,
  GetAssignmentResponse,
  UpdateAssignmentResponse,
  ListMyAssignmentsResponse,
  SubmitAssignmentParams,
  SubmitAssignmentBody,
  ListSubmissionsForAssignmentParams,
  ListSubmissionsForAssignmentResponse,
} from "@workspace/api-zod";
import { getCurrentStudent } from "../lib/currentStudent";
import { uploadSubmissionAttachment } from "../lib/attachments";

const router: IRouter = Router();
function serializeSubmission(s: typeof submissionsTable.$inferSelect) {
  return {
    id: s.id,
    assignmentId: s.assignmentId,
    studentName: s.studentName,
    content: s.content,
    attachment:
      s.attachmentPath && s.attachmentName && s.attachmentMimeType && s.attachmentUrl
        ? {
            fileName: s.attachmentName,
            mimeType: s.attachmentMimeType,
            size: s.attachmentSize ?? 0,
            storagePath: s.attachmentPath,
            publicUrl: s.attachmentUrl,
          }
        : undefined,
    grade: s.grade ?? undefined,
    submittedAt: s.submittedAt.toISOString(),
  };
}

function serializeAssignment(
  a: typeof assignmentsTable.$inferSelect,
  courseTitle: string,
) {
  return {
    id: a.id,
    courseId: a.courseId,
    courseTitle,
    title: a.title,
    instructions: a.instructions,
    points: a.points,
    dueAt: a.dueAt ? a.dueAt.toISOString() : undefined,
    createdAt: a.createdAt.toISOString(),
  };
}

router.get("/assignments", async (_req, res): Promise<void> => {
  const rows = await db
    .select({ a: assignmentsTable, courseTitle: coursesTable.title })
    .from(assignmentsTable)
    .innerJoin(coursesTable, eq(assignmentsTable.courseId, coursesTable.id))
    .orderBy(desc(assignmentsTable.createdAt));
  res.json(
    ListAssignmentsResponse.parse(
      rows.map((r) => serializeAssignment(r.a, r.courseTitle)),
    ),
  );
});

router.get("/assignments/my", async (req, res): Promise<void> => {
  const studentName = getCurrentStudent(req);
  const rows = await db
    .select({ a: assignmentsTable, courseTitle: coursesTable.title })
    .from(assignmentsTable)
    .innerJoin(coursesTable, eq(assignmentsTable.courseId, coursesTable.id))
    .orderBy(desc(assignmentsTable.createdAt));

  const assignmentIds = rows.map((r) => r.a.id);
  const submissions =
    assignmentIds.length === 0
      ? []
      : await db
          .select()
          .from(submissionsTable)
          .where(
            and(
              eq(submissionsTable.studentName, studentName),
              inArray(submissionsTable.assignmentId, assignmentIds),
            ),
          );

  const subByAssignment = new Map(
    submissions.map((s) => [s.assignmentId, s]),
  );

  const items = rows.map((r) => {
    const sub = subByAssignment.get(r.a.id);
    let status: "pending" | "submitted" | "graded" = "pending";
    if (sub) {
      status = sub.grade !== null && sub.grade !== undefined ? "graded" : "submitted";
    }
    return {
      ...serializeAssignment(r.a, r.courseTitle),
      status,
      grade: sub?.grade ?? undefined,
      submittedAt: sub?.submittedAt.toISOString() ?? undefined,
    };
  });

  res.json(ListMyAssignmentsResponse.parse(items));
});

router.post("/assignments", async (req, res): Promise<void> => {
  const parsed = CreateAssignmentBody.safeParse(req.body);
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
    .insert(assignmentsTable)
    .values({
      courseId: parsed.data.courseId,
      title: parsed.data.title,
      instructions: parsed.data.instructions,
      points: parsed.data.points,
      dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : null,
    })
    .returning();
  if (!created) {
    res.status(500).json({ error: "Failed to create assignment" });
    return;
  }
  res.status(201).json(serializeAssignment(created, course.title));
});

router.get("/assignments/:assignmentId", async (req, res): Promise<void> => {
  const params = GetAssignmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select({ a: assignmentsTable, courseTitle: coursesTable.title })
    .from(assignmentsTable)
    .innerJoin(coursesTable, eq(assignmentsTable.courseId, coursesTable.id))
    .where(eq(assignmentsTable.id, params.data.assignmentId));
  if (!row) {
    res.status(404).json({ error: "Assignment not found" });
    return;
  }
  res.json(GetAssignmentResponse.parse(serializeAssignment(row.a, row.courseTitle)));
});

router.patch("/assignments/:assignmentId", async (req, res): Promise<void> => {
  const params = UpdateAssignmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateAssignmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updates: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.instructions !== undefined)
    updates.instructions = parsed.data.instructions;
  if (parsed.data.points !== undefined) updates.points = parsed.data.points;
  if (parsed.data.dueAt !== undefined)
    updates.dueAt = parsed.data.dueAt ? new Date(parsed.data.dueAt) : null;

  const [updated] = await db
    .update(assignmentsTable)
    .set(updates)
    .where(eq(assignmentsTable.id, params.data.assignmentId))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Assignment not found" });
    return;
  }
  const [course] = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.id, updated.courseId));
  res.json(
    UpdateAssignmentResponse.parse(
      serializeAssignment(updated, course?.title ?? ""),
    ),
  );
});

router.delete(
  "/assignments/:assignmentId",
  async (req, res): Promise<void> => {
    const params = DeleteAssignmentParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const [deleted] = await db
      .delete(assignmentsTable)
      .where(eq(assignmentsTable.id, params.data.assignmentId))
      .returning();
    if (!deleted) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }
    res.sendStatus(204);
  },
);

router.post(
  "/assignments/:assignmentId/submissions",
  async (req, res): Promise<void> => {
    const params = SubmitAssignmentParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const parsed = SubmitAssignmentBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const studentName = getCurrentStudent(req);

    const [assignment] = await db
      .select()
      .from(assignmentsTable)
      .where(eq(assignmentsTable.id, params.data.assignmentId));
    if (!assignment) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }

    const [existing] = await db
      .select()
      .from(submissionsTable)
      .where(
        and(
          eq(submissionsTable.assignmentId, params.data.assignmentId),
          eq(submissionsTable.studentName, studentName),
        ),
      );

    let uploadedAttachment:
      | Awaited<ReturnType<typeof uploadSubmissionAttachment>>
      | undefined;
    if (parsed.data.attachment) {
      try {
        uploadedAttachment = await uploadSubmissionAttachment({
          fileName: parsed.data.attachment.fileName,
          mimeType: parsed.data.attachment.mimeType,
          size: parsed.data.attachment.size,
          base64Data: parsed.data.attachment.base64Data,
          assignmentId: params.data.assignmentId,
          studentName,
        });
      } catch (error) {
        res.status(500).json({ error: String(error) });
        return;
      }
    }

    let saved: typeof submissionsTable.$inferSelect | undefined;
    if (existing) {
      [saved] = await db
        .update(submissionsTable)
        .set({
          content: parsed.data.content,
          attachmentName: uploadedAttachment?.fileName ?? null,
          attachmentMimeType: uploadedAttachment?.mimeType ?? null,
          attachmentSize: uploadedAttachment?.size ?? null,
          attachmentPath: uploadedAttachment?.storagePath ?? null,
          attachmentUrl: uploadedAttachment?.publicUrl ?? null,
          submittedAt: new Date(),
        })
        .where(eq(submissionsTable.id, existing.id))
        .returning();
    } else {
      [saved] = await db
        .insert(submissionsTable)
        .values({
          assignmentId: params.data.assignmentId,
          studentName,
          content: parsed.data.content,
          attachmentName: uploadedAttachment?.fileName ?? null,
          attachmentMimeType: uploadedAttachment?.mimeType ?? null,
          attachmentSize: uploadedAttachment?.size ?? null,
          attachmentPath: uploadedAttachment?.storagePath ?? null,
          attachmentUrl: uploadedAttachment?.publicUrl ?? null,
        })
        .returning();
    }

    if (!saved) {
      res.status(500).json({ error: "Failed to save submission" });
      return;
    }

    res.status(201).json(serializeSubmission(saved));
  },
);

router.get(
  "/assignments/:assignmentId/submissions",
  async (req, res): Promise<void> => {
    const params = ListSubmissionsForAssignmentParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const [assignment] = await db
      .select()
      .from(assignmentsTable)
      .where(eq(assignmentsTable.id, params.data.assignmentId));
    if (!assignment) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }
    const rows = await db
      .select()
      .from(submissionsTable)
      .where(eq(submissionsTable.assignmentId, params.data.assignmentId))
      .orderBy(desc(submissionsTable.submittedAt));

    res.json(
      ListSubmissionsForAssignmentResponse.parse(
        rows.map((s) => ({
          ...serializeSubmission(s),
          assignmentTitle: assignment.title,
        })),
      ),
    );
  },
);

export default router;

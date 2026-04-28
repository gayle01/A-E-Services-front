import type { Request } from "express";

export const DEFAULT_STUDENT_NAME = "Alex Rivera";

export function getCurrentStudent(req: Request): string {
  const header = req.header("x-student-name");
  if (typeof header === "string" && header.trim().length > 0) {
    return header.trim();
  }
  return DEFAULT_STUDENT_NAME;
}

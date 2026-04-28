# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/scripts run seed` — reseed the LMS database with sample data

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

- `artifacts/lms` — **Lumen Academy** Learning Management System (React + Vite + Wouter + TanStack Query). Student dashboard, course library, lessons, assignments, and quizzes. Admin section for managing courses, lessons, assignments, and quizzes.
- `artifacts/api-server` — Express 5 API backing the LMS, with Drizzle ORM tables for courses, lessons, enrollments, lesson completions, assignments, submissions, quizzes, quiz questions, and quiz attempts.
- `artifacts/mockup-sandbox` — design exploration sandbox.

## LMS Notes

- No real auth: the current student is read from the `x-student-name` header (defaults to `Alex Rivera`). Admin vs. student is a UI toggle in the sidebar.
- Quiz `correctIndex` is intentionally never returned from `GET /api/quizzes/:id` — only from the attempt breakdown.
- Submissions, enrollments, and lesson completions have unique constraints on `(studentName, parentId)`. Re-submitting an assignment updates the existing row.

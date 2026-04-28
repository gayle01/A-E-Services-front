import {
  db,
  coursesTable,
  lessonsTable,
  assignmentsTable,
  quizzesTable,
  quizQuestionsTable,
  enrollmentsTable,
  lessonCompletionsTable,
  submissionsTable,
  pool,
} from "@workspace/db";

const STUDENT = "Alex Rivera";

async function seed() {
  console.log("Clearing existing data...");
  await db.delete(submissionsTable);
  await db.delete(lessonCompletionsTable);
  await db.delete(enrollmentsTable);
  await db.delete(quizQuestionsTable);
  await db.delete(quizzesTable);
  await db.delete(assignmentsTable);
  await db.delete(lessonsTable);
  await db.delete(coursesTable);

  console.log("Inserting courses...");
  const courses = await db
    .insert(coursesTable)
    .values([
      {
        title: "Architectural Design Process Fundamentals",
        description:
          "A practical walkthrough of concept design, schematic development, design development, and construction documentation in a studio workflow.",
        category: "Design Process",
        level: "beginner",
        coverColor: "#334155",
        instructor: "Ar. Nana Mensah",
      },
      {
        title: "BIM Coordination with Revit",
        description:
          "Build clean model structures, shared parameters, and clash-ready coordination habits for multidisciplinary architectural projects.",
        category: "BIM",
        level: "intermediate",
        coverColor: "#0f766e",
        instructor: "Ar. Daniel Tetteh",
      },
      {
        title: "Construction Documentation Standards",
        description:
          "Learn drawing set organization, annotation rules, sheet references, and detail quality checks expected in professional practice.",
        category: "Construction Docs",
        level: "intermediate",
        coverColor: "#92400e",
        instructor: "Ar. Elaine Boateng",
      },
      {
        title: "Building Codes and Compliance Review",
        description:
          "Interpret code requirements and apply occupancy, egress, fire safety, and accessibility checks within architectural submissions.",
        category: "Codes",
        level: "advanced",
        coverColor: "#9f1239",
        instructor: "Ar. Kofi Agyeman",
      },
      {
        title: "Client Presentations and Design Narratives",
        description:
          "Communicate design intent through concise narratives, diagrams, and visual sequencing that clients and review boards can follow.",
        category: "Client Communication",
        level: "beginner",
        coverColor: "#6d28d9",
        instructor: "Ar. Yaa Owusu",
      },
    ])
    .returning();

  const [js, design, ds, stats, writing] = courses;

  console.log("Inserting lessons...");
  await db.insert(lessonsTable).values([
    {
      courseId: js.id,
      title: "From Brief to Concept",
      content:
        "Translate project briefs into design drivers, adjacency diagrams, and early massing logic.\n\nYou will practice turning client requirements into a structured concept narrative.",
      durationMinutes: 18,
      orderIndex: 0,
    },
    {
      courseId: js.id,
      title: "Schematic Design Decisions",
      content:
        "Develop spatial organization, circulation, and facade direction while tracking trade-offs in cost, daylight, and constructability.",
      durationMinutes: 24,
      orderIndex: 1,
    },
    {
      courseId: js.id,
      title: "Design Development Handover",
      content:
        "Package key decisions, material intent, and room data so your team can move smoothly into documentation.",
      durationMinutes: 32,
      orderIndex: 2,
    },
    {
      courseId: js.id,
      title: "Review Milestone Readiness",
      content:
        "Set up internal review checklists for concept, schematic, and DD milestones to reduce rework and missed requirements.",
      durationMinutes: 22,
      orderIndex: 3,
    },

    {
      courseId: design.id,
      title: "Model Setup and Naming Standards",
      content:
        "Build a consistent template, naming convention, and view structure that supports collaboration across teams.",
      durationMinutes: 16,
      orderIndex: 0,
    },
    {
      courseId: design.id,
      title: "Worksharing and Linked Models",
      content:
        "Manage central files, worksets, consultant links, and coordination visibility without breaking team workflow.",
      durationMinutes: 28,
      orderIndex: 1,
    },
    {
      courseId: design.id,
      title: "Clash Detection Preparation",
      content:
        "Prepare discipline models and exported views for cleaner clash sessions and faster issue close-out.",
      durationMinutes: 20,
      orderIndex: 2,
    },

    {
      courseId: ds.id,
      title: "Drawing Set Structure",
      content:
        "Organize general, plans, elevations, sections, and details in a coherent package suitable for permit and construction.",
      durationMinutes: 25,
      orderIndex: 0,
    },
    {
      courseId: ds.id,
      title: "Annotation and Keynotes",
      content:
        "Apply office annotation standards, keynote systems, and dimensioning hierarchy for drawing clarity.",
      durationMinutes: 30,
      orderIndex: 1,
    },
    {
      courseId: ds.id,
      title: "Detail Coordination QA",
      content:
        "Run consistency checks across details, callouts, and sheet references before issue dates.",
      durationMinutes: 27,
      orderIndex: 2,
    },

    {
      courseId: stats.id,
      title: "Occupancy and Use Classification",
      content:
        "Classify projects correctly to drive area limits, fire strategy, and egress provisions.",
      durationMinutes: 26,
      orderIndex: 0,
    },
    {
      courseId: stats.id,
      title: "Means of Egress Checks",
      content:
        "Validate travel distances, exit widths, and discharge logic for compliant architecture submissions.",
      durationMinutes: 22,
      orderIndex: 1,
    },

    {
      courseId: writing.id,
      title: "Storyboarding a Client Presentation",
      content:
        "Sequence diagrams, plans, and renders to communicate design intent clearly to non-technical audiences.",
      durationMinutes: 14,
      orderIndex: 0,
    },
    {
      courseId: writing.id,
      title: "Handling Design Feedback",
      content:
        "Turn client feedback into action items while preserving core design principles and delivery timelines.",
      durationMinutes: 18,
      orderIndex: 1,
    },
    {
      courseId: writing.id,
      title: "Design Narrative Writing",
      content:
        "Write concise design statements for submissions, concept reports, and board presentations.",
      durationMinutes: 20,
      orderIndex: 2,
    },
  ]);

  console.log("Enrolling student...");
  await db.insert(enrollmentsTable).values([
    { courseId: js.id, studentName: STUDENT },
    { courseId: design.id, studentName: STUDENT },
    { courseId: ds.id, studentName: STUDENT },
  ]);

  console.log("Marking some lessons complete...");
  const jsLessons = await db
    .select()
    .from(lessonsTable)
    .where(eqCourse(lessonsTable, js.id));
  const designLessons = await db
    .select()
    .from(lessonsTable)
    .where(eqCourse(lessonsTable, design.id));
  await db.insert(lessonCompletionsTable).values([
    { lessonId: jsLessons[0].id, studentName: STUDENT },
    { lessonId: jsLessons[1].id, studentName: STUDENT },
    { lessonId: designLessons[0].id, studentName: STUDENT },
  ]);

  console.log("Inserting assignments...");
  const dueSoon = new Date(Date.now() + 1000 * 60 * 60 * 24 * 4);
  const dueLater = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);
  const overdue = new Date(Date.now() - 1000 * 60 * 60 * 24 * 2);
  const assignments = await db
    .insert(assignmentsTable)
    .values([
      {
        courseId: js.id,
        title: "Concept Board and Spatial Narrative",
        instructions:
          "Prepare a concept board with diagrams, zoning strategy, and a one-page design narrative for stakeholder review.",
        points: 100,
        dueAt: dueSoon,
      },
      {
        courseId: design.id,
        title: "Revit Coordination Issue Log",
        instructions:
          "Identify and document at least five model coordination issues with proposed resolution notes and responsible parties.",
        points: 80,
        dueAt: dueLater,
      },
      {
        courseId: writing.id,
        title: "Client Presentation Deck Draft",
        instructions:
          "Build a concise slide deck explaining the design intent, key constraints, and next-step decision requests.",
        points: 60,
        dueAt: overdue,
      },
      {
        courseId: ds.id,
        title: "Drawing Set QA Checklist",
        instructions:
          "Run QA on a drawing set and submit marked findings for annotation consistency, callout links, and detail references.",
        points: 120,
      },
    ])
    .returning();

  console.log("Submitting one assignment...");
  await db.insert(submissionsTable).values({
    assignmentId: assignments[2].id,
    studentName: STUDENT,
    content:
      "Deck included site strategy, massing options, daylight narrative, and client decision checkpoints. Revised section hierarchy improved clarity and reduced review comments.",
    grade: 54,
  });

  console.log("Inserting quizzes...");
  const [jsQuiz] = await db
    .insert(quizzesTable)
    .values([
      {
        courseId: js.id,
        title: "Design Process Fundamentals Check",
        description:
          "A quick review of early-stage architectural workflow and milestone expectations.",
      },
    ])
    .returning();

  const [designQuiz] = await db
    .insert(quizzesTable)
    .values([
      {
        courseId: design.id,
        title: "BIM Coordination Essentials",
        description:
          "Check your understanding of model standards and coordination routines.",
      },
    ])
    .returning();

  const [dsQuiz] = await db
    .insert(quizzesTable)
    .values([
      {
        courseId: ds.id,
        title: "Construction Documentation QA",
        description: "Validate drawing set standards and documentation accuracy.",
      },
    ])
    .returning();

  await db.insert(quizQuestionsTable).values([
    {
      quizId: jsQuiz.id,
      prompt: "Which phase typically defines project goals, constraints, and client priorities?",
      options: ["Construction Administration", "Project Briefing", "Tendering", "Post-occupancy"],
      correctIndex: 1,
      points: 10,
      orderIndex: 0,
    },
    {
      quizId: jsQuiz.id,
      prompt: "Schematic design primarily focuses on:",
      options: [
        "Final construction details only",
        "Spatial organization and key design direction",
        "Final as-built verification",
        "Site handover documentation",
      ],
      correctIndex: 1,
      points: 10,
      orderIndex: 1,
    },
    {
      quizId: jsQuiz.id,
      prompt: "Design development should produce enough clarity for:",
      options: [
        "Only concept sketches",
        "Construction documentation planning",
        "Material procurement only",
        "Final occupancy permit submission only",
      ],
      correctIndex: 1,
      points: 10,
      orderIndex: 2,
    },
    {
      quizId: jsQuiz.id,
      prompt: "A design narrative is most useful when it:",
      options: [
        "Lists software tools used",
        "Explains intent and decision rationale",
        "Avoids client language",
        "Contains only technical standards",
      ],
      correctIndex: 1,
      points: 10,
      orderIndex: 3,
    },
    {
      quizId: jsQuiz.id,
      prompt: "Which milestone is typically reviewed before major documentation effort begins?",
      options: [
        "Concept/Schematic alignment checkpoint",
        "Post-construction closeout",
        "Occupancy survey",
        "Facilities handback",
      ],
      correctIndex: 0,
      points: 10,
      orderIndex: 4,
    },
  ]);

  await db.insert(quizQuestionsTable).values([
    {
      quizId: designQuiz.id,
      prompt: "A shared model environment is primarily used to:",
      options: [
        "Export marketing renders only",
        "Coordinate multi-discipline design work",
        "Replace QA reviews",
        "Avoid naming standards",
      ],
      correctIndex: 1,
      points: 10,
      orderIndex: 0,
    },
    {
      quizId: designQuiz.id,
      prompt: "Which is most important for reliable model coordination?",
      options: [
        "Frequent file renaming",
        "Consistent naming and model structure",
        "Random workset creation",
        "Local-only modeling",
      ],
      correctIndex: 1,
      points: 10,
      orderIndex: 1,
    },
    {
      quizId: designQuiz.id,
      prompt: "Clash sessions are most effective when models are:",
      options: ["Unfiltered", "Fully linked with unresolved levels", "Prepared with scope-based views", "Exported as images"],
      correctIndex: 2,
      points: 10,
      orderIndex: 2,
    },
    {
      quizId: designQuiz.id,
      prompt: "A coordination issue log should include:",
      options: [
        "Only screenshots",
        "Issue, owner, due date, and resolution status",
        "Model file size only",
        "Rendering presets",
      ],
      correctIndex: 1,
      points: 10,
      orderIndex: 3,
    },
  ]);

  await db.insert(quizQuestionsTable).values([
    {
      quizId: dsQuiz.id,
      prompt: "A strong drawing set quality check should verify:",
      options: [
        "Only sheet titles",
        "Callout/detail references and annotation consistency",
        "Color palette only",
        "File names only",
      ],
      correctIndex: 1,
      points: 10,
      orderIndex: 0,
    },
    {
      quizId: dsQuiz.id,
      prompt: "The main goal of sheet indexing standards is to:",
      options: [
        "Increase drawing file size",
        "Improve navigation and coordination",
        "Reduce number of details",
        "Eliminate review meetings",
      ],
      correctIndex: 1,
      points: 10,
      orderIndex: 1,
    },
    {
      quizId: dsQuiz.id,
      prompt: "Before issue, teams should confirm details are:",
      options: [
        "Uncoordinated between sheets",
        "Fully coordinated with current notes and specs",
        "Hidden from consultants",
        "Exported without references",
      ],
      correctIndex: 1,
      points: 10,
      orderIndex: 2,
    },
  ]);

  console.log("Done!");
  await pool.end();
}

import { eq, type AnyColumn, sql } from "drizzle-orm";
function eqCourse(table: { courseId: AnyColumn }, id: string) {
  return eq(table.courseId, id);
}
void sql;

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

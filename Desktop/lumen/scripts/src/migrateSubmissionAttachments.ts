import { sql } from "drizzle-orm";
import { db, pool } from "@workspace/db";

async function run() {
  await db.execute(sql`
    ALTER TABLE submissions
      ADD COLUMN IF NOT EXISTS attachment_name text,
      ADD COLUMN IF NOT EXISTS attachment_mime_type text,
      ADD COLUMN IF NOT EXISTS attachment_size integer,
      ADD COLUMN IF NOT EXISTS attachment_path text,
      ADD COLUMN IF NOT EXISTS attachment_url text;
  `);

  console.log("submission_attachment_columns_ok");
  await pool.end();
}

run().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});

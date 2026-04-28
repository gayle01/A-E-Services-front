import { createClient } from "@supabase/supabase-js";

type UploadInput = {
  fileName: string;
  mimeType: string;
  size: number;
  base64Data: string;
  assignmentId: string;
  studentName: string;
};

type UploadResult = {
  fileName: string;
  mimeType: string;
  size: number;
  storagePath: string;
  publicUrl: string;
};

const bucketName = process.env["SUPABASE_STORAGE_BUCKET"] ?? "assignment-files";

function buildSupabaseClient() {
  const url = process.env["SUPABASE_URL"];
  const serviceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set to upload attachments.",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function uploadSubmissionAttachment(
  input: UploadInput,
): Promise<UploadResult> {
  const client = buildSupabaseClient();
  const cleanName = sanitizeFileName(input.fileName);
  const key = `${input.assignmentId}/${Date.now()}-${sanitizeFileName(input.studentName)}-${cleanName}`;
  const fileBytes = Buffer.from(input.base64Data, "base64");

  const { error } = await client.storage
    .from(bucketName)
    .upload(key, fileBytes, {
      contentType: input.mimeType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload attachment: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = client.storage.from(bucketName).getPublicUrl(key);

  return {
    fileName: input.fileName,
    mimeType: input.mimeType,
    size: input.size,
    storagePath: key,
    publicUrl,
  };
}

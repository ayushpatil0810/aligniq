import { createAdminClient } from './server';

const BUCKET = 'resumes';
const MAX_FILE_SIZE_MB = 10;
const SIGNED_URL_EXPIRES_IN = 60 * 60; // 1 hour

export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Upload a resume PDF to Supabase storage.
 * Path: resumes/{userId}/{timestamp}-{filename}
 */
export async function uploadResume(
  userId: string,
  file: File,
): Promise<{ path: string; url: string }> {
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    throw new StorageError(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit`);
  }

  if (file.type !== 'application/pdf') {
    throw new StorageError('Only PDF files are accepted');
  }

  const supabase = createAdminClient();
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `${userId}/${timestamp}-${safeName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: 'application/pdf',
      upsert: false,
    });

  if (error) {
    throw new StorageError(`Upload failed: ${error.message}`);
  }

  const url = await getSignedUrl(path);
  return { path, url };
}

/**
 * Generate a signed URL for secure resume access.
 */
export async function getSignedUrl(path: string): Promise<string> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_EXPIRES_IN);

  if (error || !data?.signedUrl) {
    throw new StorageError(`Failed to generate signed URL: ${error?.message}`);
  }

  return data.signedUrl;
}

/**
 * Delete a resume file from storage.
 */
export async function deleteResume(path: string): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase.storage.from(BUCKET).remove([path]);

  if (error) {
    throw new StorageError(`Delete failed: ${error.message}`);
  }
}

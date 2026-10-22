import fs from "fs";
import path from "path";

// Storage directory in project root: storage/assignments (isolated and not directly exposed by static routing)
const STORAGE_ROOT = path.join(process.cwd(), "storage", "assignments");

/**
 * Ensure storage directory exists
 */
function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_ROOT)) {
    fs.mkdirSync(STORAGE_ROOT, { recursive: true });
  }
}

/**
 * Save file buffer to local disk
 * @returns fileKey
 */
export async function saveAssignmentFile(
  fileBuffer: Buffer,
  originalFilename: string
): Promise<{ fileKey: string; fileSize: number }> {
  ensureStorageDir();
  const safeFilename = path.basename(originalFilename).replace(/[^a-zA-Z0-9._-]/g, "_");
  const uniqueKey = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${safeFilename}`;
  const filePath = path.join(STORAGE_ROOT, uniqueKey);

  await fs.promises.writeFile(filePath, fileBuffer);
  return {
    fileKey: uniqueKey,
    fileSize: fileBuffer.length,
  };
}

/**
 * Read file buffer from local disk using safe validated fileKey
 */
export async function getAssignmentFile(fileKey: string): Promise<{ buffer: Buffer; filePath: string } | null> {
  // Path traversal guard
  const safeKey = path.basename(fileKey);
  const filePath = path.join(STORAGE_ROOT, safeKey);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const buffer = await fs.promises.readFile(filePath);
  return { buffer, filePath };
}

/**
 * Delete file
 */
export async function deleteAssignmentFile(fileKey: string): Promise<boolean> {
  try {
    const safeKey = path.basename(fileKey);
    const filePath = path.join(STORAGE_ROOT, safeKey);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return true;
    }
  } catch {}
  return false;
}

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ITransactionAttachmentRepository,
  UploadedAttachment,
  UploadTransactionAttachmentsInput,
} from "@/core/domain/attachments";

const STORAGE_BUCKET = "transaction-attachments";

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export class SupabaseTransactionAttachmentRepository
  implements ITransactionAttachmentRepository
{
  constructor(private readonly supabase: SupabaseClient) {}

  async uploadTransactionAttachments(
    input: UploadTransactionAttachmentsInput
  ): Promise<UploadedAttachment[]> {
    const uploaded: UploadedAttachment[] = [];

    for (const item of input.files) {
      const safeName = sanitizeFileName(item.file.name);
      const path = `user_${input.userId}/transactions/${input.transactionId}/${Date.now()}_${safeName}`;
      const { error } = await this.supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, item.file, { upsert: false, contentType: item.mimeType });

      if (error) {
        throw new Error(`Upload failed for ${item.file.name}: ${error.message}`);
      }

      const { data } = this.supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      uploaded.push({
        storagePath: path,
        publicUrl: data.publicUrl ?? null,
        mimeType: item.mimeType,
        size: item.file.size,
        originalFileName: item.file.name,
      });
    }

    return uploaded;
  }
}

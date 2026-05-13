import type { SupabaseClient } from "@supabase/supabase-js";
import type { UploadableAttachment } from "@/core/domain/attachments";
import {
  ITransactionAttachmentRepository,
  InsertTransactionAttachmentRecordsInput,
  UploadedAttachment,
  UploadTransactionAttachmentsInput,
} from "@/core/domain/attachments";

const STORAGE_BUCKET = "attachments";

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export class SupabaseTransactionAttachmentRepository
  implements ITransactionAttachmentRepository
{
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Upload a single file to storage (used by create flow with per-file rollback at caller).
   */
  async uploadOneTransactionAttachment(input: {
    userId: string;
    transactionId: string;
    item: UploadableAttachment;
  }): Promise<UploadedAttachment> {
    const safeName = sanitizeFileName(input.item.file.name);
    const path = `user_${input.userId}/transactions/${input.transactionId}/${Date.now()}_${safeName}`;
    const { error } = await this.supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, input.item.file, { upsert: false, contentType: input.item.mimeType });

    if (error) {
      throw new Error(`Upload failed for ${input.item.file.name}: ${error.message}`);
    }

    const { data } = this.supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return {
      storagePath: path,
      publicUrl: data.publicUrl ?? null,
      mimeType: input.item.mimeType,
      size: input.item.file.size,
      originalFileName: input.item.file.name,
    };
  }

  async uploadTransactionAttachments(
    input: UploadTransactionAttachmentsInput
  ): Promise<UploadedAttachment[]> {
    const uploaded: UploadedAttachment[] = [];

    for (const item of input.files) {
      try {
        uploaded.push(
          await this.uploadOneTransactionAttachment({
            userId: input.userId,
            transactionId: input.transactionId,
            item,
          })
        );
      } catch (e) {
        await this.deleteStoragePaths(uploaded.map((u) => u.storagePath));
        throw e;
      }
    }

    return uploaded;
  }

  async insertAttachmentRecords(
    input: InsertTransactionAttachmentRecordsInput
  ): Promise<void> {
    if (input.items.length === 0) return;

    const rows = input.items.map((item) => ({
      transaction_id: input.transactionId,
      file_path: item.filePath,
      file_type: item.fileType,
      created_by: input.actorUserId,
      updated_by: input.actorUserId,
    }));

    const { error } = await this.supabase.from("transaction_attachments").insert(rows);
    if (error) {
      throw new Error(`Failed to save attachment records: ${error.message}`);
    }
  }

  async deleteStoragePaths(paths: string[]): Promise<void> {
    if (paths.length === 0) return;
    const { error } = await this.supabase.storage.from(STORAGE_BUCKET).remove(paths);
    if (error) {
      throw new Error(`Failed to remove files from storage: ${error.message}`);
    }
  }
}

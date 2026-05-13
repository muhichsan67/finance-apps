export const ALLOWED_ATTACHMENT_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
] as const;

export type AllowedAttachmentType = (typeof ALLOWED_ATTACHMENT_TYPES)[number];
export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
export const TARGET_IMAGE_SIZE_BYTES = 500 * 1024;

export interface UploadableAttachment {
  file: File;
  mimeType: AllowedAttachmentType;
}

export interface UploadedAttachment {
  storagePath: string;
  publicUrl: string | null;
  mimeType: AllowedAttachmentType;
  size: number;
  originalFileName: string;
}

export interface UploadTransactionAttachmentsInput {
  userId: string;
  transactionId: string;
  files: UploadableAttachment[];
}

export interface InsertTransactionAttachmentRecordsInput {
  transactionId: number;
  actorUserId: string;
  items: { filePath: string; fileType: string }[];
}

export interface ITransactionAttachmentRepository {
  uploadTransactionAttachments(
    input: UploadTransactionAttachmentsInput
  ): Promise<UploadedAttachment[]>;
  insertAttachmentRecords(input: InsertTransactionAttachmentRecordsInput): Promise<void>;
  /** Remove objects from the attachments bucket (compensation / rollback). */
  deleteStoragePaths(paths: string[]): Promise<void>;
}

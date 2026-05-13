import {
  ITransactionAttachmentRepository,
  UploadTransactionAttachmentsInput,
} from "@/core/domain/attachments";

export class UploadTransactionAttachmentsUseCase {
  constructor(private readonly repository: ITransactionAttachmentRepository) {}

  async execute(input: UploadTransactionAttachmentsInput) {
    const uploaded = await this.repository.uploadTransactionAttachments(input);
    const txId = Number.parseInt(String(input.transactionId), 10);
    if (Number.isFinite(txId) && txId > 0 && uploaded.length > 0) {
      try {
        await this.repository.insertAttachmentRecords({
          transactionId: txId,
          actorUserId: input.userId,
          items: uploaded.map((u) => ({ filePath: u.storagePath, fileType: u.mimeType })),
        });
      } catch (e) {
        await this.repository.deleteStoragePaths(uploaded.map((u) => u.storagePath));
        throw e;
      }
    }
    return uploaded;
  }
}

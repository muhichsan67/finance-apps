import {
  ITransactionAttachmentRepository,
  UploadTransactionAttachmentsInput,
} from "@/core/domain/attachments";

export class UploadTransactionAttachmentsUseCase {
  constructor(private readonly repository: ITransactionAttachmentRepository) {}

  async execute(input: UploadTransactionAttachmentsInput) {
    return this.repository.uploadTransactionAttachments(input);
  }
}

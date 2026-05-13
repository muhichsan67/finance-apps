"use client";

import imageCompression from "browser-image-compression";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import {
  ALLOWED_ATTACHMENT_TYPES,
  AllowedAttachmentType,
  MAX_FILE_SIZE_BYTES,
  TARGET_IMAGE_SIZE_BYTES,
  UploadableAttachment,
} from "@/core/domain/attachments";
import { UploadTransactionAttachmentsUseCase } from "@/core/use-cases/upload-transaction-attachments";
import { SupabaseTransactionAttachmentRepository } from "@/infrastructure/repositories/supabase-transaction-attachment-repository";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  transactionId: z.string().min(1, "Transaction ID is required."),
});

type UploadResult = {
  storagePath: string;
  originalFileName: string;
  size: number;
};

function isAllowedType(type: string): type is AllowedAttachmentType {
  return (ALLOWED_ATTACHMENT_TYPES as readonly string[]).includes(type);
}

async function prepareFile(file: File): Promise<UploadableAttachment> {
  if (!isAllowedType(file.type)) throw new Error(`Unsupported type: ${file.type} (${file.name})`);
  if (file.size > MAX_FILE_SIZE_BYTES) throw new Error(`File exceeds 20MB: ${file.name}`);
  if (file.type === "application/pdf") return { file, mimeType: file.type };

  const compressedBlob = await imageCompression(file, {
    maxSizeMB: TARGET_IMAGE_SIZE_BYTES / 1024 / 1024,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    initialQuality: 0.8,
    fileType: file.type,
  });
  const compressedFile = new File([compressedBlob], file.name, {
    type: file.type,
    lastModified: Date.now(),
  });
  if (compressedFile.size > TARGET_IMAGE_SIZE_BYTES) {
    throw new Error(`Image still exceeds 500KB after compression: ${file.name}`);
  }
  return { file: compressedFile, mimeType: file.type };
}

export function TransactionAttachmentUploader() {
  const [transactionId, setTransactionId] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [feedback, setFeedback] = useState("");

  const uploadMutation = useMutation<UploadResult[], Error>({
    mutationFn: async () => {
      const parsed = formSchema.parse({ transactionId });
      if (selectedFiles.length === 0) throw new Error("Please select at least one file.");

      const preparedFiles = await Promise.all(selectedFiles.map(prepareFile));
      const supabase = getSupabaseBrowserClient();
      const repository = new SupabaseTransactionAttachmentRepository(supabase);
      const useCase = new UploadTransactionAttachmentsUseCase(repository);

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) throw new Error("You must be logged in to upload attachments.");

      const uploaded = await useCase.execute({
        userId: user.id,
        transactionId: parsed.transactionId,
        files: preparedFiles,
      });

      return uploaded.map((item) => ({
        storagePath: item.storagePath,
        originalFileName: item.originalFileName,
        size: item.size,
      }));
    },
    onSuccess: (result) => {
      setFeedback(`Uploaded ${result.length} file(s) successfully.`);
      setSelectedFiles([]);
    },
    onError: (error) => setFeedback(error.message),
  });

  return (
    <section className="mt-6 rounded-lg border border-border p-4">
      <h2 className="text-base font-semibold">Transaction Proof Attachments</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Allowed: JPG, PNG, PDF. Max pre-compression: 20MB. Images are compressed below 500KB.
      </p>

      <div className="mt-4 grid gap-3">
        <input
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          placeholder="Transaction ID"
          className="h-10 rounded-md border border-border bg-background px-3 text-sm"
        />
        <input
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
          onChange={(e) => {
            setFeedback("");
            setSelectedFiles(Array.from(e.target.files ?? []));
          }}
          className="block w-full text-sm"
        />
        <Button
          onClick={() => uploadMutation.mutate()}
          disabled={uploadMutation.isPending}
          className="w-full"
        >
          {uploadMutation.isPending ? "Uploading..." : "Upload Attachments"}
        </Button>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          {selectedFiles.map((file) => (
            <p key={`${file.name}-${file.size}`}>
              {file.name} - {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          ))}
        </div>
      )}

      {feedback && <p className="mt-3 text-sm">{feedback}</p>}
    </section>
  );
}

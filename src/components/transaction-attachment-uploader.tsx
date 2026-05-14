"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { UploadTransactionAttachmentsUseCase } from "@/core/use-cases/upload-transaction-attachments";
import { SupabaseTransactionAttachmentRepository } from "@/infrastructure/repositories/supabase-transaction-attachment-repository";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { prepareClientAttachmentFile } from "@/lib/attachments/prepare-client-attachment-file";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  transactionId: z.string().min(1, "Transaction ID is required."),
});

type UploadResult = {
  storagePath: string;
  originalFileName: string;
  size: number;
};

export function TransactionAttachmentUploader() {
  const [transactionId, setTransactionId] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const uploadMutation = useMutation<UploadResult[], Error>({
    mutationFn: async () => {
      const parsed = formSchema.parse({ transactionId });
      if (selectedFiles.length === 0) throw new Error("Please select at least one file.");

      const preparedFiles = await Promise.all(selectedFiles.map((f) => prepareClientAttachmentFile(f)));
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
      toast.success(`Uploaded ${result.length} file(s).`);
      setSelectedFiles([]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <section className="app-card p-5">
      <h2 className="text-lg font-semibold tracking-tight">Transaction Proof Attachments</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Allowed: JPG, PNG, PDF. Max pre-compression: 20MB. Images are compressed below 500KB.
      </p>

      <div className="mt-4 grid gap-3">
        <input
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          placeholder="Transaction ID"
          className="h-12 rounded-2xl border border-border/80 bg-card/80 px-4 text-sm shadow-sm backdrop-blur-sm transition-all duration-200 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
        <input
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
          onChange={(e) => {
            setSelectedFiles(Array.from(e.target.files ?? []));
          }}
          className="block w-full text-sm"
        />
        <Button
          onClick={() => uploadMutation.mutate()}
          disabled={uploadMutation.isPending}
          className="w-full gap-2"
        >
          {uploadMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : null}
          {uploadMutation.isPending ? "Uploading…" : "Upload attachments"}
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

    </section>
  );
}

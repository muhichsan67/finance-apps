"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { AllowedAttachmentType } from "@/core/domain/attachments";
import {
  ALLOWED_ATTACHMENT_TYPES,
  MAX_FILE_SIZE_BYTES,
} from "@/core/domain/attachments";
import { CreateTransactionUseCase } from "@/core/use-cases/transaction/create-transaction";
import { SupabaseTransactionAttachmentRepository } from "@/infrastructure/repositories/supabase-transaction-attachment-repository";
import { SupabaseTransactionRepository } from "@/infrastructure/repositories/supabase-transaction-repository";
import { getCurrentUserRole } from "@/lib/auth/get-current-user-role";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function isAllowedType(type: string): type is AllowedAttachmentType {
  return (ALLOWED_ATTACHMENT_TYPES as readonly string[]).includes(type);
}

const formSchema = z.object({
  category_id: z.coerce.number().int().positive(),
  source_id: z.coerce.number().int().positive(),
  amount: z
    .string()
    .trim()
    .min(1, "Amount is required.")
    .refine((s) => {
      const n = Number(s);
      return !Number.isNaN(n) && n > 0;
    }, "Enter a valid positive amount."),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a valid date."),
  description: z.string().max(2000).optional(),
});

export type CreateTransactionResult =
  | { ok: true; transactionId: number }
  | { ok: false; error: string };

export async function createTransactionAction(
  formData: FormData
): Promise<CreateTransactionResult> {
  try {
    const { userId } = await getCurrentUserRole();

    const parsed = formSchema.safeParse({
      category_id: formData.get("category_id"),
      source_id: formData.get("source_id"),
      amount: formData.get("amount"),
      transaction_date: formData.get("transaction_date"),
      description: formData.get("description") ?? "",
    });
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid form." };
    }

    const description =
      typeof parsed.data.description === "string" && parsed.data.description.trim() !== ""
        ? parsed.data.description.trim()
        : null;

    const rawFiles = formData.getAll("attachments");
    const files = rawFiles.filter((v): v is File => v instanceof File && v.size > 0);

    for (const file of files) {
      if (!isAllowedType(file.type)) {
        return { ok: false, error: `Unsupported file type: ${file.name}` };
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return { ok: false, error: `File too large (max 20MB): ${file.name}` };
      }
    }

    const supabase = await createSupabaseServerClient();
    const txRepo = new SupabaseTransactionRepository(supabase);
    const createTx = new CreateTransactionUseCase(txRepo);
    const transactionId = await createTx.execute({
      userId,
      categoryId: parsed.data.category_id,
      sourceId: parsed.data.source_id,
      amount: parsed.data.amount,
      transactionDate: parsed.data.transaction_date,
      description,
      actorUserId: userId,
    });

    if (files.length > 0) {
      const attRepo = new SupabaseTransactionAttachmentRepository(supabase);
      const storagePaths: string[] = [];
      try {
        const uploadables = files.map((file) => ({
          file,
          mimeType: file.type as AllowedAttachmentType,
        }));

        const items: { filePath: string; fileType: string }[] = [];
        for (const item of uploadables) {
          const uploaded = await attRepo.uploadOneTransactionAttachment({
            userId,
            transactionId: String(transactionId),
            item,
          });
          storagePaths.push(uploaded.storagePath);
          items.push({ filePath: uploaded.storagePath, fileType: uploaded.mimeType });
        }

        await attRepo.insertAttachmentRecords({
          transactionId,
          actorUserId: userId,
          items,
        });
      } catch (e) {
        try {
          if (storagePaths.length > 0) {
            await attRepo.deleteStoragePaths(storagePaths);
          }
        } catch {
          /* best-effort storage cleanup */
        }
        try {
          await txRepo.softDeleteTransaction(transactionId, userId);
        } catch {
          /* best-effort soft-delete */
        }
        throw e;
      }
    }

    revalidatePath("/transactions");
    revalidatePath("/transactions/new");
    revalidatePath(`/transactions/${transactionId}`);
    return { ok: true, transactionId };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Something went wrong.";
    return { ok: false, error: message };
  }
}

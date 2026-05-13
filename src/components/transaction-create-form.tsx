"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import type { Category } from "@/core/domain/category";
import type { Source } from "@/core/domain/source";
import { prepareClientAttachmentFile } from "@/lib/attachments/prepare-client-attachment-file";
import { createTransactionAction } from "@/app/(protected)/transactions/actions";
import { Button } from "@/components/ui/button";

const fieldClass =
  "h-12 w-full rounded-2xl border border-border/80 bg-card/80 px-4 text-sm shadow-sm backdrop-blur-sm transition-all duration-200 placeholder:text-muted-foreground/70 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/30";

const labelClass = "text-sm font-medium text-foreground";

export function TransactionCreateForm({
  categories,
  sources,
  defaultTransactionDate,
}: {
  categories: Category[];
  sources: Source[];
  defaultTransactionDate: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const canSubmit = categories.length > 0 && sources.length > 0;

  return (
    <form
      ref={formRef}
      className="app-card grid gap-4 p-5"
      onSubmit={(e) => {
        e.preventDefault();
        setMessage(null);
        const form = e.currentTarget;

        startTransition(() => {
          void (async () => {
            try {
              const fd = new FormData(form);
              fd.delete("attachments");
              const rawFiles = Array.from(fileInputRef.current?.files ?? []);
              const prepared = await Promise.all(
                rawFiles.map((f) => prepareClientAttachmentFile(f))
              );
              for (const { file } of prepared) {
                fd.append("attachments", file);
              }

              const result = await createTransactionAction(fd);
              if (!result.ok) {
                setMessage({ type: "err", text: result.error });
                return;
              }
              router.push(`/transactions/${result.transactionId}`);
            } catch (err) {
              setMessage({
                type: "err",
                text: err instanceof Error ? err.message : "Could not save transaction.",
              });
            }
          })();
        });
      }}
    >
      <h3 className="text-lg font-semibold tracking-tight">Details</h3>
      <p className="text-sm text-muted-foreground">
        Required fields match your database: category, source, amount, date, and optional description.
        Optional files upload to the <span className="font-medium text-foreground">attachments</span>{" "}
        bucket and are linked in <span className="font-medium text-foreground">transaction_attachments</span>.
      </p>

      {!canSubmit && (
        <p className="rounded-2xl border border-border/80 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Add at least one category and one source (admin master data) before creating transactions.
        </p>
      )}

      <div className="grid gap-2">
        <label className={labelClass} htmlFor="category_id">
          Category
        </label>
        <select
          id="category_id"
          name="category_id"
          required
          disabled={!canSubmit}
          className={fieldClass}
          defaultValue=""
        >
          <option value="" disabled>
            Select category
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.type})
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <label className={labelClass} htmlFor="source_id">
          Source
        </label>
        <select
          id="source_id"
          name="source_id"
          required
          disabled={!canSubmit}
          className={fieldClass}
          defaultValue=""
        >
          <option value="" disabled>
            Select source
          </option>
          {sources.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.type})
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
        <div className="grid gap-2">
          <label className={labelClass} htmlFor="amount">
            Amount
          </label>
          <input
            id="amount"
            name="amount"
            type="text"
            inputMode="decimal"
            required
            disabled={!canSubmit}
            placeholder="0.00"
            className={fieldClass}
          />
        </div>
        <div className="grid gap-2">
          <label className={labelClass} htmlFor="transaction_date">
            Date
          </label>
          <input
            id="transaction_date"
            name="transaction_date"
            type="date"
            required
            disabled={!canSubmit}
            defaultValue={defaultTransactionDate}
            className={fieldClass}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label className={labelClass} htmlFor="description">
          Description <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          disabled={!canSubmit}
          placeholder="Note, merchant, or reference"
          className={`${fieldClass} min-h-[5.5rem] resize-y py-3`}
        />
      </div>

      <div className="grid gap-2">
        <label className={labelClass} htmlFor="attachments">
          Attachments <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <input
          ref={fileInputRef}
          id="attachments"
          name="attachments"
          type="file"
          multiple
          disabled={!canSubmit}
          accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
          className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-xl file:border-0 file:bg-primary/15 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-foreground hover:file:bg-primary/25"
        />
        <p className="text-xs text-muted-foreground">
          JPG, PNG, or PDF — max 20MB each before compression. Images are compressed in the browser
          before upload.
        </p>
      </div>

      {message && (
        <p
          className={
            message.type === "ok"
              ? "text-sm font-medium text-emerald-700 dark:text-emerald-400"
              : "text-sm font-medium text-red-600 dark:text-red-400"
          }
        >
          {message.text}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={!canSubmit || pending}>
        {pending ? "Saving…" : "Save transaction"}
      </Button>
    </form>
  );
}

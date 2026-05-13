"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, FileText, Paperclip } from "lucide-react";
import type { TransactionDetail } from "@/core/domain/transaction";
import { AttachmentPreviewModal } from "@/components/attachment-preview-modal";

const money = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDisplayDate(isoDate: string) {
  const d = new Date(isoDate + "T12:00:00");
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function fileLabel(filePath: string, index: number) {
  const base = filePath.split("/").pop() ?? `file-${index + 1}`;
  return base.replace(/^\d+_/, "");
}

export function TransactionDetailClient({ detail }: { detail: TransactionDetail }) {
  const [preview, setPreview] = useState<{
    id: number;
    title: string;
    viewUrl: string | null;
    mimeType: string;
  } | null>(null);

  return (
    <section className="grid gap-4">
      <div className="flex items-center gap-2">
        <Link
          href="/transactions"
          className="inline-flex items-center gap-1.5 rounded-2xl border border-border/80 bg-card/80 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/35 hover:bg-primary/10 hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          All transactions
        </Link>
      </div>

      <div className="app-card grid gap-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Transaction
            </p>
            <h1 className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
              {money.format(Number(detail.amount))}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{formatDisplayDate(detail.transactionDate)}</p>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            #{detail.id}
          </span>
        </div>

        <dl className="grid gap-3 border-t border-border/60 pt-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Category</dt>
            <dd className="text-right font-medium">
              {detail.categoryName ?? (detail.categoryId != null ? `#${detail.categoryId}` : "—")}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Source</dt>
            <dd className="text-right font-medium">
              {detail.sourceName ?? (detail.sourceId != null ? `#${detail.sourceId}` : "—")}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Created</dt>
            <dd className="text-right font-medium tabular-nums">{formatDateTime(detail.createdAt)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Updated</dt>
            <dd className="text-right font-medium tabular-nums">{formatDateTime(detail.updatedAt)}</dd>
          </div>
        </dl>

        <div className="border-t border-border/60 pt-4">
          <h2 className="text-sm font-semibold text-foreground">Description</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {detail.description?.trim() ? detail.description : "No description."}
          </p>
        </div>
      </div>

      <div className="app-card grid gap-3 p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <Paperclip className="size-5 text-primary" aria-hidden />
          Attachments
          <span className="text-sm font-normal text-muted-foreground">({detail.attachments.length})</span>
        </h2>

        {detail.attachments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No files linked to this transaction.</p>
        ) : (
          <ul className="grid gap-2">
            {detail.attachments.map((att, index) => (
              <li key={att.id}>
                <button
                  type="button"
                  onClick={() =>
                    setPreview({
                      id: att.id,
                      title: fileLabel(att.filePath, index),
                      viewUrl: att.viewUrl,
                      mimeType: att.fileType,
                    })
                  }
                  className="flex w-full items-center gap-3 rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/10"
                >
                  <FileText className="size-9 shrink-0 text-primary" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{fileLabel(att.filePath, index)}</p>
                    <p className="truncate text-xs text-muted-foreground">{att.fileType}</p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-primary">View</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AttachmentPreviewModal
        key={preview?.id ?? "closed"}
        open={preview != null}
        onClose={() => setPreview(null)}
        title={preview?.title ?? ""}
        viewUrl={preview?.viewUrl ?? null}
        mimeType={preview?.mimeType ?? "application/octet-stream"}
      />
    </section>
  );
}

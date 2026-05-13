"use client";

import * as React from "react";
import { Minus, Plus, RotateCcw, X } from "lucide-react";

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 4;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function AttachmentPreviewModal({
  open,
  onClose,
  title,
  viewUrl,
  mimeType,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  viewUrl: string | null;
  mimeType: string;
}) {
  const [scale, setScale] = React.useState(1);
  const isPdf = mimeType === "application/pdf";
  const isImage = mimeType.startsWith("image/");

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  React.useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/70 p-3 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Attachment preview"
    >
      <div className="mx-auto flex w-full max-w-3xl flex-1 min-h-0 flex-col gap-2">
        <div className="flex shrink-0 items-center justify-between gap-2 rounded-2xl border border-white/15 bg-card/95 px-3 py-2 text-foreground shadow-lg backdrop-blur-md">
          <p className="min-w-0 truncate text-sm font-medium">{title}</p>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-primary/15 hover:text-foreground"
              aria-label="Zoom out"
              onClick={() => setScale((s) => clamp(s - 0.15, ZOOM_MIN, ZOOM_MAX))}
            >
              <Minus className="size-5" />
            </button>
            <span className="w-14 text-center text-xs tabular-nums text-muted-foreground">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-primary/15 hover:text-foreground"
              aria-label="Zoom in"
              onClick={() => setScale((s) => clamp(s + 0.15, ZOOM_MIN, ZOOM_MAX))}
            >
              <Plus className="size-5" />
            </button>
            <button
              type="button"
              className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-primary/15 hover:text-foreground"
              aria-label="Reset zoom"
              onClick={() => setScale(1)}
            >
              <RotateCcw className="size-5" />
            </button>
            <button
              type="button"
              className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-primary/15 hover:text-foreground"
              aria-label="Close"
              onClick={onClose}
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        <div
          className="relative flex min-h-0 flex-1 cursor-grab flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a]/90 active:cursor-grabbing"
          onWheel={(e) => {
            e.preventDefault();
            setScale((s) => clamp(s - e.deltaY * 0.0015, ZOOM_MIN, ZOOM_MAX));
          }}
        >
          {!viewUrl ? (
            <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-muted-foreground">
              Preview link could not be created. Check storage policies for the{" "}
              <span className="mx-1 font-medium text-foreground">attachments</span> bucket.
            </div>
          ) : isImage ? (
            <div className="flex min-h-0 flex-1 overflow-auto p-4">
              <div
                className="m-auto transition-transform duration-150 ease-out"
                style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={viewUrl} alt={title} className="max-w-[min(100%,92vw)] select-none" draggable={false} />
              </div>
            </div>
          ) : isPdf ? (
            <div
              className="flex min-h-0 flex-1 flex-col overflow-hidden p-2"
              style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
            >
              <iframe
                title={title}
                src={viewUrl}
                className="min-h-[70dvh] w-full flex-1 rounded-xl border border-white/10 bg-white"
              />
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
              <p className="text-sm text-muted-foreground">This file type cannot be previewed here.</p>
              <a
                href={viewUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Open in new tab
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ViewportToggle } from "@/components/viewport-toggle";
import { TransactionAttachmentUploader } from "@/components/transaction-attachment-uploader";

export default function TransactionsPage() {
  const [desktopMode, setDesktopMode] = useState(false);

  return (
    <section className={`grid gap-4 ${desktopMode ? "max-w-5xl" : "max-w-md"}`}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="font-semibold">Transactions</h2>
          <p className="text-sm text-muted-foreground">
            User role area for transaction management.
          </p>
        </div>
        <ViewportToggle
          desktopMode={desktopMode}
          onDesktopModeChange={setDesktopMode}
        />
      </div>

      <div className="grid gap-3">
        <Button className="w-full">Create Transaction (next)</Button>
        <Button variant="outline" className="w-full">
          View Transaction History (next)
        </Button>
      </div>

      <TransactionAttachmentUploader />
    </section>
  );
}

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import * as Popover from "@radix-ui/react-popover";
import * as Select from "@radix-ui/react-select";
import { format, isValid, parseISO } from "date-fns";
import { DayPicker, DayFlag, SelectionState, UI } from "react-day-picker";
import { Calendar, Check, ChevronDown, ChevronUp, X } from "lucide-react";
import type { Source } from "@/core/domain/source";
import type { TransactionListFilters } from "@/app/(protected)/transactions/transaction-list-query";
import { buildTransactionsListHref } from "@/app/(protected)/transactions/transaction-list-query";
import { cn } from "@/lib/utils";

import "react-day-picker/style.css";

const triggerClass =
  "flex h-12 w-full items-center justify-between gap-2 rounded-2xl border border-border/80 bg-card/90 px-4 text-left text-sm font-medium text-foreground shadow-sm backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-card focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50";

const popoverContentClass =
  "z-[60] w-[min(calc(100vw-2rem),20rem)] rounded-2xl border border-border/80 bg-card p-3 shadow-xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95";

const selectContentClass =
  "z-[60] max-h-[min(18rem,var(--radix-select-content-available-height))] overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xl";

const selectItemClass =
  "relative flex cursor-pointer select-none items-center rounded-xl py-2.5 pl-9 pr-3 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[highlighted]:bg-primary/15 data-[state=checked]:font-semibold";

function parseFilterDate(iso: string | null): Date | undefined {
  if (!iso) return undefined;
  const d = parseISO(iso);
  return isValid(d) ? d : undefined;
}

function FilterDateField({
  label,
  value,
  onChange,
  id,
}: {
  label: string;
  value: string | null;
  onChange: (iso: string | null) => void;
  id: string;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = parseFilterDate(value);

  const display =
    selected != null ? format(selected, "MMM d, yyyy") : "Any date";

  return (
    <div className="grid gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor={id}>
        {label}
      </label>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <div role="button" id={id} className={triggerClass} tabIndex={0}>
            <span className="flex min-w-0 items-center gap-2">
              <Calendar className="size-4 shrink-0 text-primary" aria-hidden />
              <span className={cn("truncate", !value && "text-muted-foreground")}>{display}</span>
            </span>
            <span className="flex shrink-0 items-center gap-1">
              {value ? (
                <button
                  type="button"
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange(null);
                  }}
                  aria-label={`Clear ${label}`}
                >
                  <X className="size-4" />
                </button>
              ) : null}
              <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
            </span>
          </div>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className={popoverContentClass}
            sideOffset={8}
            align="start"
            collisionPadding={16}
          >
            {/* <DayPicker
              mode="single"
              selected={selected}
              onSelect={(d) => {
                onChange(d ? format(d, "yyyy-MM-dd") : null);
                setOpen(false);
              }}
              captionLayout="dropdown"
              startMonth={new Date(2020, 0)}
              endMonth={new Date(new Date().getFullYear() + 1, 11)}
              className="mx-auto rounded-xl p-1 [--rdp-accent-color:var(--primary)] [--rdp-background-color:var(--card)]"
              classNames={{
                [UI.Root]: "w-full",
                [UI.Weekdays]: "mt-2",
                [UI.Weekday]: "text-[0.7rem] font-medium uppercase text-muted-foreground",
                [UI.Day]: "text-sm",
                [SelectionState.selected]:
                  "rounded-xl bg-primary font-semibold text-primary-foreground [&_button]:text-primary-foreground",
                [DayFlag.today]: "font-semibold text-primary",
              }}
            /> */}
            <DayPicker
              mode="single"
              selected={selected}
              onSelect={(d) => {
                onChange(d ? format(d, "yyyy-MM-dd") : null);
                setOpen(false);
              }}
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                month_caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                day_button: cn(
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                ),
                day: cn(
                  "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent"
                ),
                selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                today: "bg-accent text-accent-foreground",
                outside: "text-muted-foreground opacity-50",
                disabled: "text-muted-foreground opacity-50",
              }}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}

export function TransactionFiltersForm({
  sources,
  filters,
}: {
  sources: Source[];
  filters: TransactionListFilters;
}) {
  const router = useRouter();
  const [dateFrom, setDateFrom] = React.useState<string | null>(filters.dateFrom);
  const [dateTo, setDateTo] = React.useState<string | null>(filters.dateTo);
  const [sourceId, setSourceId] = React.useState<number | null>(filters.sourceId);
  const [categoryType, setCategoryType] = React.useState<"inbound" | "outbound" | null>(
    filters.categoryType
  );

  const apply = React.useCallback(() => {
    const next: TransactionListFilters = {
      dateFrom,
      dateTo,
      sourceId,
      categoryType,
    };
    router.push(buildTransactionsListHref(next, 1));
  }, [router, dateFrom, dateTo, sourceId, categoryType]);

  const selectedSource = React.useMemo(
    () => (sourceId != null ? sources.find((s) => s.id === sourceId) : undefined),
    [sources, sourceId]
  );

  const sourceTriggerLabel =
    sourceId == null
      ? "All sources"
      : `${selectedSource?.name ?? "Source"} (${selectedSource?.type ?? ""})`;

  const clearAll = React.useCallback(() => {
    setDateFrom(null);
    setDateTo(null);
    setSourceId(null);
    setCategoryType(null);
    router.push("/transactions");
  }, [router]);

  return (
    <div className="app-card p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Filters</h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Narrow by period, account source, or money flow.
          </p>
        </div>
        <button
          type="button"
          onClick={clearAll}
          className="mt-2 self-start text-xs font-medium text-primary underline-offset-2 hover:underline sm:mt-0"
        >
          Reset all
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <FilterDateField id="tx-from" label="From" value={dateFrom} onChange={setDateFrom} />
        <FilterDateField id="tx-to" label="To" value={dateTo} onChange={setDateTo} />

        <div className="grid gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="tx-source">
            Source
          </label>
          <Select.Root
            value={sourceId != null ? String(sourceId) : "all"}
            onValueChange={(v) => setSourceId(v === "all" ? null : Number.parseInt(v, 10))}
          >
            <Select.Trigger id="tx-source" className={triggerClass} aria-label="Source">
              <span className="truncate text-left">{sourceTriggerLabel}</span>
              <Select.Icon>
                <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className={selectContentClass} position="popper" sideOffset={8} collisionPadding={16}>
                <Select.ScrollUpButton className="flex justify-center py-1 text-muted-foreground">
                  <ChevronUp className="size-4" />
                </Select.ScrollUpButton>
                <Select.Viewport className="p-1">
                  <Select.Item value="all" className={selectItemClass}>
                    <Select.ItemIndicator className="absolute left-2 flex size-4 items-center justify-center">
                      <Check className="size-3.5 text-primary" />
                    </Select.ItemIndicator>
                    <Select.ItemText>All sources</Select.ItemText>
                  </Select.Item>
                  {sources.map((s) => (
                    <Select.Item key={s.id} value={String(s.id)} className={selectItemClass}>
                      <Select.ItemIndicator className="absolute left-2 flex size-4 items-center justify-center">
                        <Check className="size-3.5 text-primary" />
                      </Select.ItemIndicator>
                      <Select.ItemText>
                        {s.name}
                        <span className="ml-1 text-xs text-muted-foreground">({s.type})</span>
                      </Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
                <Select.ScrollDownButton className="flex justify-center py-1 text-muted-foreground">
                  <ChevronDown className="size-4" />
                </Select.ScrollDownButton>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>

        <div className="grid gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="tx-flow">
            Flow
          </label>
          <Select.Root
            value={categoryType ?? "all"}
            onValueChange={(v) =>
              setCategoryType(v === "all" ? null : (v as "inbound" | "outbound"))
            }
          >
            <Select.Trigger id="tx-flow" className={triggerClass} aria-label="Category flow">
              <span className="truncate text-left">
                {categoryType == null
                  ? "All flows"
                  : categoryType === "inbound"
                    ? "Inbound"
                    : "Outbound"}
              </span>
              <Select.Icon>
                <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className={selectContentClass} position="popper" sideOffset={8} collisionPadding={16}>
                <Select.Viewport className="p-1">
                  <Select.Item value="all" className={selectItemClass}>
                    <Select.ItemIndicator className="absolute left-2 flex size-4 items-center justify-center">
                      <Check className="size-3.5 text-primary" />
                    </Select.ItemIndicator>
                    <Select.ItemText>All flows</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="inbound" className={selectItemClass}>
                    <Select.ItemIndicator className="absolute left-2 flex size-4 items-center justify-center">
                      <Check className="size-3.5 text-primary" />
                    </Select.ItemIndicator>
                    <Select.ItemText>Inbound</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="outbound" className={selectItemClass}>
                    <Select.ItemIndicator className="absolute left-2 flex size-4 items-center justify-center">
                      <Check className="size-3.5 text-primary" />
                    </Select.ItemIndicator>
                    <Select.ItemText>Outbound</Select.ItemText>
                  </Select.Item>
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={apply}
          className="h-12 w-full rounded-2xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:brightness-105 active:scale-[0.98] sm:w-auto sm:min-w-[10rem]"
        >
          Apply filters
        </button>
      </div>
    </div>
  );
}

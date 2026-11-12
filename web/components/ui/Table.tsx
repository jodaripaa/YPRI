import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cx } from "./cx";

export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table className={cx("w-full border-collapse text-left text-sm [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-muted/40", className)} {...props} />
    </div>
  );
}

export function Th({ className, numerico, ...props }: ThHTMLAttributes<HTMLTableCellElement> & { numerico?: boolean }) {
  return (
    <th
      scope="col"
      className={cx(
        "whitespace-nowrap border-b border-border bg-muted/50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
        numerico && "text-right",
        className,
      )}
      {...props}
    />
  );
}

export function Td({ className, numerico, ...props }: TdHTMLAttributes<HTMLTableCellElement> & { numerico?: boolean }) {
  return (
    <td
      className={cx("whitespace-nowrap border-b border-border/70 px-4 py-3 text-foreground/80", numerico && "text-right tabular-nums", className)}
      {...props}
    />
  );
}

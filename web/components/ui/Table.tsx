import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cx } from "./cx";

export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table className={cx("w-full border-collapse text-left text-sm", className)} {...props} />
    </div>
  );
}

export function Th({ className, numerico, ...props }: ThHTMLAttributes<HTMLTableCellElement> & { numerico?: boolean }) {
  return (
    <th
      scope="col"
      className={cx(
        "whitespace-nowrap border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-slate-500",
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
      className={cx("whitespace-nowrap border-b border-slate-100 px-4 py-3 text-slate-700", numerico && "text-right tabular-nums", className)}
      {...props}
    />
  );
}

import { Wrench } from "lucide-react";
import { cx } from "@/components/ui";

export function Logo({ claro, className }: { claro?: boolean; className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-2.5", className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
        <Wrench className="h-4 w-4 text-white" aria-hidden />
      </span>
      <span className={cx("text-lg font-semibold tracking-tight", claro ? "text-white" : "text-slate-900")}>YPRI</span>
    </span>
  );
}

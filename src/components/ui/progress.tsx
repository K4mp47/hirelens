import * as React from "react";
import { cn } from "@/lib/utils";

function Progress({ value = 0, className, ...props }: React.ComponentProps<"div"> & { value?: number }) {
  const normalized = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={normalized}
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-secondary", className)}
      {...props}
    >
      <div className="h-full w-full flex-1 bg-primary transition-transform" style={{ transform: `translateX(-${100 - normalized}%)` }} />
    </div>
  );
}

export { Progress };

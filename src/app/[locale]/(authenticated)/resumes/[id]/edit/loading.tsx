import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-5rem)] w-full items-center justify-center pb-[20vh]">
      <Loader2
        className="size-16 animate-spin text-primary/60"
        strokeWidth={1}
      />
    </div>
  );
}

import * as React from "react";
import { cn } from "./utils";

interface GhostInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  isHighlighted?: boolean;
  multiline?: boolean;
  readOnly?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export function GhostInput({
  value,
  onChange,
  placeholder,
  className,
  isHighlighted,
  multiline = false,
  readOnly = false,
  onKeyDown,
}: GhostInputProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  // Synchronize internal div content with value prop when not focused
  React.useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) {
      ref.current.textContent = value;
    }
  }, [value]);

  return (
    <div
      ref={ref}
      contentEditable={!readOnly}
      suppressContentEditableWarning
      onBlur={(e) => {
        if (!readOnly) {
          onChange(e.currentTarget.textContent || "");
        }
      }}
      onKeyDown={(e) => {
        if (!readOnly) {
          if (!multiline && e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }
          onKeyDown?.(e);
        }
      }}
      onPaste={(e) => {
        if (!readOnly) {
          e.preventDefault();
          const text = e.clipboardData.getData("text/plain");
          document.execCommand("insertText", false, text);
        }
      }}
      data-placeholder={placeholder}
      className={cn(
        "outline-none transition-all duration-200 rounded px-2 py-1 -mx-2",
        !readOnly
          ? "cursor-text hover:bg-accent/50 focus:bg-accent focus:ring-2 focus:ring-ring/20"
          : "cursor-default",
        "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30",
        "whitespace-pre-wrap break-words",
        isHighlighted &&
          "bg-yellow-100 dark:bg-yellow-500/20 ring-1 ring-yellow-400/50 duration-1000",
        className,
      )}
    >
      {value}
    </div>
  );
}

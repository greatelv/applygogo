import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { motion } from "motion/react";
import { GripVertical, RefreshCw, Trash2, Loader2, Plus } from "lucide-react";
import { useLocale } from "next-intl";
import { Button } from "../ui/button";
import { TranslatedExperience } from "./types";
import { ItemTypes } from "./constants";

interface DraggableExperienceItemProps {
  exp: TranslatedExperience;
  index: number;
  moveExperience: (dragIndex: number, hoverIndex: number) => void;
  isTranslating: boolean;
  onRetranslate: (id: string) => void;
  onRemove: (id: string) => void;
  onChange: (
    id: string,
    field: keyof TranslatedExperience,
    value: string
  ) => void;
  onBulletEdit: (
    id: string,
    index: number,
    value: string,
    isEnglish: boolean
  ) => void;
  onAddBullet: (id: string) => void;
  onRemoveBullet: (id: string, index: number) => void;
  highlightedBullets?: number[];
}

export const DraggableExperienceItem = ({
  exp,
  index,
  moveExperience,
  isTranslating,
  onRetranslate,
  onRemove,
  onChange,
  onBulletEdit,
  onAddBullet,
  onRemoveBullet,
  leftLabel,
  rightLabel,
  highlightedBullets,
}: DraggableExperienceItemProps & {
  leftLabel: string;
  rightLabel: string;
}) => {
  const locale = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  // ... rest of useDrop/useDrag ...
  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.EXPERIENCE,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: any, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveExperience(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.EXPERIENCE,
    item: () => {
      return { id: exp.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drop(preview(ref));

  return (
    <motion.div
      ref={ref}
      layout
      initial={false}
      style={{ opacity: isDragging ? 0.4 : 1 }}
      data-handler-id={handlerId}
      className={`relative flex group/item mb-6 ${isDragging ? "z-0" : "z-10"}`}
    >
      <div
        ref={drag as any}
        className="hidden lg:flex w-6 items-start pt-6 justify-center cursor-grab active:cursor-grabbing text-muted-foreground/0 group-hover/item:text-muted-foreground/50 hover:text-muted-foreground transition-colors absolute -left-8 h-full top-0"
        title="드래그하여 순서 변경"
      >
        <GripVertical className="size-5" />
      </div>

      <div
        className={`flex-1 bg-card border border-border rounded-lg overflow-hidden transition-colors duration-200 ${
          isDragging ? "border-dashed border-2 bg-accent/20 shadow-none" : ""
        }`}
      >
        <div className="bg-muted/50 px-6 py-4 border-b border-border relative">
          <div className="hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <p className="text-xs text-muted-foreground font-semibold mb-1">
                {leftLabel}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold mb-1">
                {rightLabel}
              </p>
            </div>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 right-4 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRetranslate(exp.id)}
              disabled={isTranslating}
              className="text-muted-foreground hover:text-foreground h-8 px-2"
            >
              {isTranslating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
              <span className="hidden lg:inline ml-2 text-xs">
                {isTranslating ? "Processing..." : "Sync & Retranslate"}
              </span>
            </Button>
            <button
              onClick={() => onRemove(exp.id)}
              className="p-1.5 hover:bg-destructive/10 rounded text-destructive flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="size-4" />
              <span className="text-xs hidden lg:inline">Delete</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left: Original (KR) */}
            <div>
              <p className="text-xs text-muted-foreground font-semibold mb-2 lg:hidden">
                {leftLabel}
              </p>
              <div className="mb-4 space-y-1">
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    onChange(
                      exp.id,
                      "company",
                      e.currentTarget.textContent || ""
                    )
                  }
                  data-placeholder={
                    locale === "ko"
                      ? "회사/조직명 (예: 삼성전자)"
                      : "Company/Organization"
                  }
                  className="font-semibold text-xl outline-none hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 transition-colors cursor-text inline-block min-w-[100px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                >
                  {exp.company}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      onChange(
                        exp.id,
                        "position",
                        e.currentTarget.textContent || ""
                      )
                    }
                    data-placeholder={locale === "ko" ? "직무" : "Position"}
                    className="outline-none hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 -my-1 transition-colors cursor-text min-w-[50px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                  >
                    {exp.position}
                  </div>
                  <span className="text-muted-foreground select-none">•</span>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      onChange(
                        exp.id,
                        "period",
                        e.currentTarget.textContent || ""
                      )
                    }
                    data-placeholder={
                      locale === "ko"
                        ? "기간 (예: 2020.01 - 2023.12)"
                        : "Period"
                    }
                    className="outline-none hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 -my-1 transition-colors cursor-text min-w-[50px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                  >
                    {exp.period}
                  </div>
                </div>
              </div>

              <ul className="space-y-3">
                {exp.bullets.map((bullet, index) => (
                  <li key={index} className="flex gap-4 text-sm group">
                    <span className="text-muted-foreground flex-shrink-0">
                      •
                    </span>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        onBulletEdit(
                          exp.id,
                          index,
                          e.currentTarget.textContent || "",
                          false
                        )
                      }
                      data-placeholder={
                        locale === "ko"
                          ? "업무 성과 및 활동 내용"
                          : "Key achievement/Responsibility"
                      }
                      className="flex-1 text-muted-foreground outline-none px-2 py-1 -mx-2 -my-1 rounded transition-colors hover:bg-accent/50 focus:bg-accent focus:ring-2 focus:ring-ring/20 cursor-text min-h-[24px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                    >
                      {bullet}
                    </div>
                    <button
                      onClick={() => onRemoveBullet(exp.id, index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-1 hover:bg-destructive/10 rounded"
                    >
                      <Trash2 className="size-3.5 text-destructive" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Translated (EN) */}
            <div>
              <p className="text-xs text-muted-foreground font-semibold mb-2 lg:hidden">
                {rightLabel}
              </p>
              <div className="mb-4 space-y-1">
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    onChange(
                      exp.id,
                      "companyTranslated",
                      e.currentTarget.textContent || ""
                    )
                  }
                  data-placeholder="Company Name (EN)"
                  className="font-semibold text-xl outline-none hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 transition-colors cursor-text inline-block min-w-[100px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                >
                  {exp.companyTranslated}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      onChange(
                        exp.id,
                        "positionTranslated",
                        e.currentTarget.textContent || ""
                      )
                    }
                    data-placeholder="Position (EN)"
                    className="outline-none hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 -my-1 transition-colors cursor-text min-w-[50px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                  >
                    {exp.positionTranslated}
                  </div>
                  <span className="text-muted-foreground select-none">•</span>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      onChange(
                        exp.id,
                        "period",
                        e.currentTarget.textContent || ""
                      )
                    }
                    data-placeholder="Period (EN)"
                    className="outline-none hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 -my-1 transition-colors cursor-text min-w-[50px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                  >
                    {exp.period}
                  </div>
                </div>
              </div>

              <ul className="space-y-3">
                {exp.bulletsTranslated.map((bullet, index) => (
                  <li key={index} className="flex gap-4 text-sm group">
                    <span className="text-muted-foreground flex-shrink-0">
                      •
                    </span>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        onBulletEdit(
                          exp.id,
                          index,
                          e.currentTarget.textContent || "",
                          true
                        )
                      }
                      data-placeholder="Achievements and activities (EN)"
                      className={`flex-1 outline-none px-2 py-1 -mx-2 -my-1 rounded transition-all duration-1000 hover:bg-accent/50 focus:bg-accent focus:ring-2 focus:ring-ring/20 cursor-text min-h-[24px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30 ${
                        highlightedBullets?.includes(index)
                          ? "bg-yellow-100 dark:bg-yellow-500/20 ring-1 ring-yellow-400/50"
                          : ""
                      }`}
                    >
                      {bullet}
                    </div>
                    <button
                      onClick={() => onRemoveBullet(exp.id, index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-1 hover:bg-destructive/10 rounded"
                    >
                      <Trash2 className="size-3.5 text-destructive" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-6">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onAddBullet(exp.id)}
              className="w-full h-10 border border-border shadow-sm hover:bg-accent transition-colors text-sm font-medium"
            >
              <Plus className="size-4 mr-2" /> Add Item
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { motion } from "motion/react";
import { GripVertical, RefreshCw, Trash2, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "../ui/button";
import { Education } from "./types";
import { ItemTypes } from "./constants";

interface DraggableEducationItemProps {
  edu: Education;
  index: number;
  moveEducation: (dragIndex: number, hoverIndex: number) => void;
  isTranslating: boolean;
  onTranslate: (id: string) => void;
  onRemove: (id: string) => void;
  onChange: (id: string, field: keyof Education, value: string) => void;
}

export const DraggableEducationItem = ({
  edu,
  index,
  moveEducation,
  isTranslating,
  onTranslate,
  onRemove,
  onChange,
}: DraggableEducationItemProps) => {
  const t = useTranslations();
  const ref = useRef<HTMLDivElement>(null);
  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.EDUCATION,
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
      moveEducation(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.EDUCATION,
    item: () => {
      return { id: edu.id, index };
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
        title={t("editorItems.dragToReorder")}
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
              <p className="text-xs text-muted-foreground font-semibold">
                {t("editorItems.korean")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold">
                {t("editorItems.english")}
              </p>
            </div>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 right-4 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTranslate(edu.id)}
              disabled={isTranslating}
              className="text-muted-foreground hover:text-foreground h-8 px-2"
            >
              {isTranslating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
              <span className="ml-2 hidden lg:inline text-xs">
                {isTranslating
                  ? t("editPage.actions.processing")
                  : t("editPage.actions.retranslate")}
              </span>
            </Button>
            <button
              onClick={() => onRemove(edu.id)}
              className="p-1.5 hover:bg-destructive/10 rounded text-destructive flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="size-4" />
              <span className="text-xs hidden lg:inline">
                {t("editorItems.delete")}
              </span>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Korean Education */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-semibold mb-2 lg:hidden">
                {t("editorItems.korean")}
              </p>
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) =>
                  onChange(
                    edu.id,
                    "school_name",
                    e.currentTarget.textContent || "",
                  )
                }
                data-placeholder={t("editorItems.placeholders.school")}
                className="font-semibold text-xl outline-none hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 transition-colors cursor-text min-w-[100px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
              >
                {edu.school_name}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    onChange(edu.id, "major", e.currentTarget.textContent || "")
                  }
                  data-placeholder={t("editorItems.placeholders.major")}
                  className="outline-none hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 transition-colors cursor-text min-w-[50px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                >
                  {edu.major}
                </div>
                <span className="text-muted-foreground select-none">•</span>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    onChange(
                      edu.id,
                      "degree",
                      e.currentTarget.textContent || "",
                    )
                  }
                  data-placeholder={t("editorItems.placeholders.degree")}
                  className="outline-none hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 transition-colors cursor-text min-w-[30px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                >
                  {edu.degree}
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    onChange(
                      edu.id,
                      "start_date",
                      e.currentTarget.textContent || "",
                    )
                  }
                  data-placeholder="Start Date"
                  className="outline-none hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 transition-colors cursor-text min-w-[60px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                >
                  {edu.start_date}
                </div>
                <span className="text-muted-foreground select-none">~</span>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    onChange(
                      edu.id,
                      "end_date",
                      e.currentTarget.textContent || "",
                    )
                  }
                  data-placeholder="End Date"
                  className="outline-none hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 transition-colors cursor-text min-w-[60px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                >
                  {edu.end_date}
                </div>
              </div>
            </div>

            {/* English Education */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-semibold mb-2 lg:hidden">
                {t("editorItems.english")}
              </p>
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) =>
                  onChange(
                    edu.id,
                    "school_name_en",
                    e.currentTarget.textContent || "",
                  )
                }
                data-placeholder="School Name"
                className="font-semibold text-xl outline-none hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 transition-colors cursor-text min-w-[100px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
              >
                {edu.school_name_en || edu.school_name}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    onChange(
                      edu.id,
                      "major_en",
                      e.currentTarget.textContent || "",
                    )
                  }
                  data-placeholder="Major"
                  className="outline-none hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 transition-colors cursor-text min-w-[50px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                >
                  {edu.major_en || edu.major}
                </div>
                <span className="text-muted-foreground select-none">•</span>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    onChange(
                      edu.id,
                      "degree_en",
                      e.currentTarget.textContent || "",
                    )
                  }
                  data-placeholder="Degree"
                  className="outline-none hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 -my-1 transition-colors cursor-text min-w-[30px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                >
                  {edu.degree_en || edu.degree}
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    onChange(
                      edu.id,
                      "start_date",
                      e.currentTarget.textContent || "",
                    )
                  }
                  data-placeholder="Start Date"
                  className="outline-none hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 -my-1 transition-colors cursor-text min-w-[60px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                >
                  {edu.start_date}
                </div>
                <span className="text-muted-foreground select-none">~</span>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    onChange(
                      edu.id,
                      "end_date",
                      e.currentTarget.textContent || "",
                    )
                  }
                  data-placeholder="End Date"
                  className="outline-none hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 -my-1 transition-colors cursor-text min-w-[60px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                >
                  {edu.end_date}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

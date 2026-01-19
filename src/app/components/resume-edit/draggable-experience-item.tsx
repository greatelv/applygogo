import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { motion } from "motion/react";
import { GripVertical, RefreshCw, Trash2, Loader2, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
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
    value: string,
  ) => void;
  onBulletEdit: (
    id: string,
    index: number,
    value: string,
    isTarget: boolean,
  ) => void;
  onAddBullet: (id: string) => void;
  onRemoveBullet: (id: string, index: number) => void;
  highlightedBullets?: number[];
  sourceLabel: string;
  targetLabel: string;
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
  highlightedBullets,
  sourceLabel,
  targetLabel,
}: DraggableExperienceItemProps) => {
  const t = useTranslations();
  const ref = useRef<HTMLDivElement>(null);
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
              <p className="text-xs text-muted-foreground font-semibold mb-1">
                {sourceLabel}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold mb-1">
                {targetLabel}
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
                {isTranslating
                  ? t("editPage.actions.processing")
                  : t("editPage.actions.retranslate")}
              </span>
            </Button>
            <button
              onClick={() => onRemove(exp.id)}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left: Source */}
            <div>
              <p className="text-xs text-muted-foreground font-semibold mb-2 lg:hidden">
                {sourceLabel}
              </p>
              <div className="mb-4 space-y-1">
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    onChange(
                      exp.id,
                      "company_name_source",
                      e.currentTarget.textContent || "",
                    )
                  }
                  data-placeholder={t("editorItems.placeholders.company")}
                  className="font-semibold text-xl outline-none hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 transition-colors cursor-text inline-block min-w-[100px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                >
                  {exp.company_name_source}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      onChange(
                        exp.id,
                        "role_source",
                        e.currentTarget.textContent || "",
                      )
                    }
                    data-placeholder={t("editorItems.placeholders.position")}
                    className="outline-none hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 -my-1 transition-colors cursor-text min-w-[50px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                  >
                    {exp.role_source}
                  </div>
                  <span className="text-muted-foreground select-none">•</span>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      onChange(
                        exp.id,
                        "start_date", // Shared field, assuming start_date/period mapping
                        e.currentTarget.textContent || "",
                      )
                    }
                    data-placeholder={t("editorItems.placeholders.period")}
                    className="outline-none hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 -my-1 transition-colors cursor-text min-w-[50px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                  >
                    {exp.start_date}
                  </div>
                  <span className="text-muted-foreground select-none">-</span>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      onChange(
                        exp.id,
                        "end_date",
                        e.currentTarget.textContent || "",
                      )
                    }
                    data-placeholder={t("editorItems.placeholders.period")}
                    className="outline-none hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 -my-1 transition-colors cursor-text min-w-[50px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                  >
                    {exp.end_date}
                  </div>
                </div>
              </div>

              <ul className="space-y-3">
                {(exp.bullets_source || []).map((bullet, index) => (
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
                          false,
                        )
                      }
                      data-placeholder={t("editorItems.placeholders.bullet")}
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

            {/* Right: Target */}
            <div>
              <p className="text-xs text-muted-foreground font-semibold mb-2 lg:hidden">
                {targetLabel}
              </p>
              <div className="mb-4 space-y-1">
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    onChange(
                      exp.id,
                      "company_name_target",
                      e.currentTarget.textContent || "",
                    )
                  }
                  data-placeholder="Company Name"
                  className="font-semibold text-xl outline-none hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 transition-colors cursor-text inline-block min-w-[100px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                >
                  {exp.company_name_target}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      onChange(
                        exp.id,
                        "role_target",
                        e.currentTarget.textContent || "",
                      )
                    }
                    data-placeholder="Position"
                    className="outline-none hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 -my-1 transition-colors cursor-text min-w-[50px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                  >
                    {exp.role_target}
                  </div>
                  {/* Shared Date (typically not translated, so just read-only or shared)
                      If we want editable dates on target side, we'd need checks. 
                      For now, just showing same dates or source dates is fine. 
                   */}
                  <span className="text-muted-foreground select-none">•</span>
                  <span>
                    {exp.start_date || ""} - {exp.end_date || ""}
                  </span>
                </div>
              </div>

              <ul className="space-y-3">
                {(exp.bullets_target || []).map((bullet, index) => (
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
                          true,
                        )
                      }
                      data-placeholder="Highlights"
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
              <Plus className="size-4 mr-2" /> {t("editorItems.addBullet")}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

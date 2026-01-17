import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { motion } from "motion/react";
import { GripVertical, RefreshCw, Trash2, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { AdditionalItem } from "./types";
import { ItemTypes } from "./constants";

interface DraggableAdditionalItemProps {
  item: AdditionalItem;
  index: number;
  moveAdditionalItem: (dragIndex: number, hoverIndex: number) => void;
  isTranslating: boolean;
  onRetranslate: (id: string) => void;
  onRemove: (id: string) => void;
  onChange: (id: string, field: keyof AdditionalItem, value: string) => void;
  hideOriginal?: boolean; // New Prop
}

export const DraggableAdditionalItem = ({
  item,
  index,
  moveAdditionalItem,
  isTranslating,
  onRetranslate,
  onRemove,
  onChange,
  hideOriginal = false,
}: DraggableAdditionalItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.ADDITIONAL_ITEM,
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
      moveAdditionalItem(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.ADDITIONAL_ITEM,
    item: () => {
      return { id: item.id, index };
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
          <div
            className={`hidden lg:grid grid-cols-1 ${
              hideOriginal ? "" : "lg:grid-cols-2"
            } gap-8`}
          >
            {!hideOriginal && (
              <div>
                <p className="text-xs text-muted-foreground font-semibold">
                  한글 (원본)
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground font-semibold">
                English (번역)
              </p>
            </div>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 right-4 flex items-center gap-2">
            {!hideOriginal && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRetranslate(item.id)}
                disabled={isTranslating}
                className="text-muted-foreground hover:text-foreground h-8 px-2"
              >
                {isTranslating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RefreshCw className="size-4" />
                )}
                <span className="hidden lg:inline ml-2 text-xs">
                  {isTranslating ? "처리 중..." : "동기화 후 재번역"}
                </span>
              </Button>
            )}
            <button
              onClick={() => onRemove(item.id)}
              className="p-1.5 hover:bg-destructive/10 rounded text-destructive flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="size-4" />
              <span className="text-xs hidden lg:inline">삭제</span>
            </button>
          </div>
        </div>
        <div className="p-6">
          <div
            className={`grid grid-cols-1 ${
              hideOriginal ? "" : "lg:grid-cols-2"
            } gap-10`}
          >
            {/* Left: Original (KR) - Hide if hideOriginal */}
            {!hideOriginal && (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground font-semibold mb-2 lg:hidden">
                  한글 (원본)
                </p>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    onChange(
                      item.id,
                      "name_kr",
                      e.currentTarget.textContent || "",
                    )
                  }
                  data-placeholder="활동/자격증/수상 명칭 (예: 정보처리기사)"
                  className="text-base font-semibold outline-none px-2 py-1 -mx-2 rounded transition-colors hover:bg-accent/50 focus:bg-accent cursor-text min-h-[1.5rem] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                >
                  {item.name_kr}
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-2">
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        onChange(
                          item.id,
                          "description_kr",
                          e.currentTarget.textContent || "",
                        )
                      }
                      data-placeholder="발급기관, 상세 내용, 점수 등 (예: 한국산업인력공단)"
                      className="text-sm text-muted-foreground outline-none px-2 py-1 -mx-2 rounded transition-colors hover:bg-accent/50 focus:bg-accent cursor-text min-h-[1.25rem] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                    >
                      {item.description_kr}
                    </div>
                  </div>
                  <div className="col-span-1">
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        onChange(
                          item.id,
                          "date",
                          e.currentTarget.textContent || "",
                        )
                      }
                      data-placeholder="날짜 (YYYY.MM)"
                      className="text-sm text-muted-foreground font-medium outline-none px-2 py-1 -mx-2 rounded transition-colors hover:bg-accent/50 focus:bg-accent cursor-text min-h-[1.25rem] text-right empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/40"
                    >
                      {item.date}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Right: Translated (EN) */}
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground font-semibold mb-2 lg:hidden">
                English (번역)
              </p>
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) =>
                  onChange(
                    item.id,
                    "name_en",
                    e.currentTarget.textContent || "",
                  )
                }
                data-placeholder="Item Name (EN)"
                className="text-base font-semibold outline-none px-2 py-1 -mx-2 rounded transition-colors hover:bg-accent/50 focus:bg-accent cursor-text min-h-[1.5rem] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
              >
                {item.name_en}
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2">
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      onChange(
                        item.id,
                        "description_en",
                        e.currentTarget.textContent || "",
                      )
                    }
                    data-placeholder="Description/Issuer/Level (EN)"
                    className="text-sm text-muted-foreground outline-none px-2 py-1 -mx-2 rounded transition-colors hover:bg-accent/50 focus:bg-accent cursor-text min-h-[1.25rem] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                  >
                    {item.description_en}
                  </div>
                </div>
                <div className="col-span-1">
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      onChange(
                        item.id,
                        "date",
                        e.currentTarget.textContent || "",
                      )
                    }
                    data-placeholder="Date (YYYY.MM)"
                    className="text-sm text-muted-foreground font-medium outline-none px-2 py-1 -mx-2 rounded transition-colors hover:bg-accent/50 focus:bg-accent cursor-text min-h-[1.25rem] text-right empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/40"
                  >
                    {item.date}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

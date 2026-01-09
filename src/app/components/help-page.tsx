import { useState } from "react";
import { CircleHelp, ChevronDown, Mail } from "lucide-react";
import { cn } from "../lib/utils";

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    id: "1",
    category: "시작하기",
    question: "지원고고는 어떻게 사용하나요?",
    answer:
      "1) PDF 이력서를 업로드하세요. 2) AI가 이력서를 분석하여 핵심 내용을 요약하고 번역합니다. 3) 요약된 내용을 검토하고, 한/영 분할 화면에서 번역 결과를 직접 수정하세요. 4) 원하는 디자인 템플릿을 적용해 PDF로 다운로드하세요.",
  },
  {
    id: "2",
    category: "시작하기",
    question: "어떤 파일 형식을 지원하나요?",
    answer:
      "현재 PDF 파일만 지원합니다. 파일 크기는 최대 10MB까지 업로드 가능합니다. Word나 한글 파일은 PDF로 변환 후 업로드해주세요.",
  },
  {
    id: "3",
    category: "기능",
    question: "Free 플랜과 Pro 플랜의 차이는 무엇인가요?",
    answer:
      "Free 플랜은 월 3 크레딧과 기본 템플릿(Modern, Classic)을 제공하며, 이력서를 1개까지 저장할 수 있습니다. Pro 플랜(월 9,900원)은 월 100 크레딧, 모든 템플릿(Minimal 포함), 그리고 이력서 무제한 저장을 지원합니다.",
  },
  {
    id: "4",
    category: "기능",
    question: "크레딧은 어떻게 차감되나요?",
    answer:
      "이력서 1개를 생성(AI 처리)할 때마다 크레딧 1개가 차감됩니다. 특정 항목을 '재번역'할 경우 0.5 크레딧이 차감됩니다. 단순 다운로드는 크레딧이 소모되지 않습니다.",
  },
  {
    id: "5",
    category: "기능",
    question: "Word 파일로 다운로드할 수 있나요?",
    answer:
      "현재는 레이아웃 깨짐 없이 최적의 디자인을 보장하기 위해 PDF 형식의 다운로드만 지원하고 있습니다.",
  },
  {
    id: "6",
    category: "기능",
    question: "번역 결과를 수정할 수 있나요?",
    answer:
      "네, 가능합니다. 편집 단계에서 'Split View' 기능을 통해 한글 원본과 영문 번역을 나란히 보며 문장 단위로 자유롭게 수정할 수 있습니다.",
  },
  {
    id: "7",
    category: "결제",
    question: "플랜 변경 및 해지는 어떻게 하나요?",
    answer:
      "설정 > 결제 관리 페이지에서 언제든지 플랜을 업그레이드하거나 해지할 수 있습니다. 구독을 해지하더라도 남은 기간 동안은 Pro 혜택이 유지됩니다.",
  },
  {
    id: "8",
    category: "보안",
    question: "내 이력서 데이터는 안전한가요?",
    answer:
      "네, 모든 데이터는 강력하게 암호화되어 저장됩니다. 사용자가 직접 삭제하기 전까지 안전하게 보관되며, 제3자에게 절대 공유되지 않으니 안심하셔도 됩니다.",
  },
];

const categories = ["전체", "시작하기", "기능", "결제", "보안"];

export function HelpPage() {
  const [activeCategory, setActiveCategory] = useState("전체");
  const [openId, setOpenId] = useState<string | null>(null);

  const filteredFaqs =
    activeCategory === "전체"
      ? faqs
      : faqs.filter((faq) => faq.category === activeCategory);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 mb-4">
          <CircleHelp className="size-8 text-primary" />
        </div>
        <h1 className="text-3xl mb-3">도움이 필요하신가요?</h1>
        <p className="text-muted-foreground">
          자주 묻는 질문을 확인하거나 문의해주세요
        </p>
      </div>

      {/* FAQ Section */}
      <div id="faq">
        <h2 className="text-2xl font-semibold mb-6">자주 묻는 질문</h2>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors",
                activeCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {filteredFaqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-card border border-border rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <span className="text-xs text-primary font-medium">
                    {faq.category}
                  </span>
                  <p className="font-medium mt-1">{faq.question}</p>
                </div>
                <ChevronDown
                  className={cn(
                    "size-5 text-muted-foreground transition-transform flex-shrink-0 ml-4",
                    openId === faq.id && "rotate-180"
                  )}
                />
              </button>

              {openId === faq.id && (
                <div className="px-4 pb-4 text-sm text-muted-foreground border-t border-border pt-4">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div
        id="contact"
        className="mt-16 bg-card border border-border rounded-lg p-8 text-center"
      >
        <Mail className="size-12 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">답변을 찾지 못하셨나요?</h3>
        <p className="text-muted-foreground mb-6">
          이메일로 문의해주시면 24시간 내에 답변드리겠습니다
        </p>
        <a
          href="mailto:patakeique@gmail.com"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Mail className="size-4" />
          patakeique@gmail.com
        </a>
      </div>
    </div>
  );
}

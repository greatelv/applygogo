import { useState } from "react";
import {
  CircleHelp,
  ChevronDown,
  Mail,
  FileText,
  CreditCard,
  Shield,
} from "lucide-react";
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
      "1) PDF 이력서를 업로드하세요. 2) AI가 자동으로 요약하고 번역합니다. 3) 결과를 확인하고 수정하세요. 4) 원하는 템플릿으로 PDF를 다운로드하세요.",
  },
  {
    id: "2",
    category: "시작하기",
    question: "어떤 파일 형식을 지원하나요?",
    answer:
      "현재 PDF 파일만 지원합니다. 한글, MS Word 등의 파일은 PDF로 변환 후 업로드해주세요. 파일 크기는 최대 10MB까지 가능합니다.",
  },
  {
    id: "3",
    category: "기능",
    question: "크레딧은 어떻게 사용되나요?",
    answer:
      "이력서 1개를 처리할 때마다 크레딧 1개가 소모됩니다. Free 플랜은 월 2 크레딧, Standard는 6 크레딧, Pro는 20 크레딧이 제공됩니다. 크레딧은 매월 1일에 자동으로 갱신됩니다.",
  },
  {
    id: "4",
    category: "기능",
    question: "번역 결과를 수정할 수 있나요?",
    answer:
      "네, 가능합니다. 요약과 번역 단계에서 모든 내용을 직접 수정할 수 있습니다. Split View를 통해 한글 원본과 영문 번역을 동시에 확인하며 편집하세요.",
  },
  {
    id: "5",
    category: "기능",
    question: "템플릿을 변경할 수 있나요?",
    answer:
      "이력서 생성 시 선택한 템플릿은 나중에 변경 가능합니다. 이력서 상세 페이지에서 '템플릿 변경' 버튼을 클릭하여 다른 디자인을 선택할 수 있습니다.",
  },
  {
    id: "6",
    category: "결제",
    question: "플랜은 언제든지 변경할 수 있나요?",
    answer:
      "네, 언제든지 업그레이드 또는 다운그레이드할 수 있습니다. 업그레이드 시 즉시 적용되며, 다운그레이드는 다음 결제일부터 적용됩니다.",
  },
  {
    id: "7",
    category: "결제",
    question: "환불이 가능한가요?",
    answer:
      "결제일로부터 7일 이내에 서비스를 사용하지 않았다면 전액 환불이 가능합니다. 문의 메뉴를 통해 환불 요청을 해주세요.",
  },
  {
    id: "8",
    category: "보안",
    question: "업로드한 이력서는 안전한가요?",
    answer:
      "모든 데이터는 암호화되어 저장되며, 엄격한 보안 프로토콜을 따릅니다. AI 처리 후 원본 PDF는 30일 후 자동 삭제되며, 언제든지 수동으로 삭제할 수 있습니다.",
  },
  {
    id: "9",
    category: "보안",
    question: "제 정보가 다른 용도로 사용되나요?",
    answer:
      "절대 그렇지 않습니다. 업로드된 이력서는 오직 사용자의 이력서 변환 목적으로만 사용되며, 제3자와 공유되지 않습니다.",
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

      {/* Quick Links */}
      <div className="grid md:grid-cols-4 gap-4 mb-12">
        <a
          href="#faq"
          className="flex flex-col items-center gap-2 p-6 bg-card border border-border rounded-lg hover:border-foreground/30 transition-colors"
        >
          <CircleHelp className="size-8 text-primary" />
          <span className="text-sm font-medium">FAQ</span>
        </a>

        <a
          href="#contact"
          className="flex flex-col items-center gap-2 p-6 bg-card border border-border rounded-lg hover:border-foreground/30 transition-colors"
        >
          <Mail className="size-8 text-primary" />
          <span className="text-sm font-medium">문의하기</span>
        </a>

        <a
          href="#guide"
          className="flex flex-col items-center gap-2 p-6 bg-card border border-border rounded-lg hover:border-foreground/30 transition-colors"
        >
          <FileText className="size-8 text-primary" />
          <span className="text-sm font-medium">사용 가이드</span>
        </a>

        <a
          href="#pricing"
          className="flex flex-col items-center gap-2 p-6 bg-card border border-border rounded-lg hover:border-foreground/30 transition-colors"
        >
          <CreditCard className="size-8 text-primary" />
          <span className="text-sm font-medium">요금제 안내</span>
        </a>
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
          href="mailto:support@ApplyGogo.com"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Mail className="size-4" />
          support@ApplyGogo.com
        </a>
      </div>
    </div>
  );
}

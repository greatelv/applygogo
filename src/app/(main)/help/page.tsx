"use strict";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">도움말</h2>
        <p className="text-muted-foreground">
          자주 묻는 질문과 가이드를 확인하세요.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>FAQ</CardTitle>
          <CardDescription>자주 묻는 질문</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>크레딧은 언제 충전되나요?</AccordionTrigger>
              <AccordionContent>
                매월 결제일에 자동으로 충전됩니다. FREE 플랜은 매월 1일에 3
                크레딧이 갱신됩니다.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>
                이력서를 PDF로 다운로드하면 크레딧이 차감되나요?
              </AccordionTrigger>
              <AccordionContent>
                아니요, PDF 다운로드는 무제한이며 크레딧이 차감되지 않습니다. AI
                번역 및 요약 기능 사용 시에만 차감됩니다.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>
                영문 이력서 양식을 바꿀 수 있나요?
              </AccordionTrigger>
              <AccordionContent>
                네, 이력서 편집 화면에서 '템플릿' 단계를 통해 다양한 디자인을
                선택할 수 있습니다.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

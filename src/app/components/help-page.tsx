import { useState } from "react";
import { CircleHelp, ChevronDown, Mail } from "lucide-react";
import { cn } from "../lib/utils";
import { PLAN_PRODUCTS } from "@/lib/constants/plans";

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    id: "1",
    category: "Getting Started",
    question: "How do I use ApplyGoGo?",
    answer:
      "1) Upload your PDF resume. 2) AI analyzes the resume to summarize and translate key content. 3) Review the summary and edit translation results in the split-view editor. 4) Apply your preferred design template and download as a PDF.",
  },
  {
    id: "2",
    category: "Getting Started",
    question: "Which file formats are supported?",
    answer:
      "Currently, only PDF files are supported. You can upload files up to 10MB. Please convert Word or HWP files to PDF before uploading.",
  },
  {
    id: "3",
    category: "Features",
    question: "What's the difference between Free and Pro plans?",
    answer: `The Free plan offers 10 credits and a basic template upon signup, and lets you save up to 1 resume. The Pro plan (Regular price ${(
      PLAN_PRODUCTS.PASS_30DAY.price * 2
    ).toLocaleString()} KRW → Launch Special ${PLAN_PRODUCTS.PASS_30DAY.price.toLocaleString()} KRW) includes ${
      PLAN_PRODUCTS.PASS_30DAY.credits
    } monthly credits, all templates (including Minimal), and unlimited resume storage.`,
  },
  {
    id: "4",
    category: "Features",
    question: "How are credits deducted?",
    answer:
      "5 credits are deducted each time you generate a resume (AI processing). 'Re-translating' a specific section costs 1 credit. Downloading does not consume credits.",
  },
  {
    id: "5",
    category: "Features",
    question: "Can I download it as a Word file?",
    answer:
      "Currently, we only support PDF downloads to ensure the best design layout without formatting issues.",
  },
  {
    id: "6",
    category: "Features",
    question: "Can I edit the translation results?",
    answer:
      "Yes, you can. In the Edit step, you can use the 'Split View' feature to see the original Korean and English translation side-by-side and edit sentence by sentence.",
  },
  {
    id: "7",
    category: "Billing",
    question: "How do I change or cancel my plan?",
    answer:
      "You can upgrade or cancel your plan at any time in Settings > Billing Management. Even if you cancel, your Pro benefits will remain active until the end of the billing period.",
  },
  {
    id: "8",
    category: "Security",
    question: "Is my resume data secure?",
    answer:
      "Yes, all data is stored with strong encryption. Your data is kept secure until you delete it and is never shared with third parties.",
  },
];

const categories = [
  "All",
  "Getting Started",
  "Features",
  "Billing",
  "Security",
];

export function HelpPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [openId, setOpenId] = useState<string | null>(null);

  const filteredFaqs =
    activeCategory === "All"
      ? faqs
      : faqs.filter((faq) => faq.category === activeCategory);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 mb-4">
          <CircleHelp className="size-8 text-primary" />
        </div>
        <h1 className="text-3xl mb-3">Need Help?</h1>
        <p className="text-muted-foreground">
          Check our Frequently Asked Questions or contact us directly.
        </p>
      </div>

      {/* FAQ Section */}
      <div id="faq">
        <h2 className="text-2xl font-semibold mb-6">
          Frequently Asked Questions
        </h2>

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
        <h3 className="text-xl font-semibold mb-2">
          Can't find what you're looking for?
        </h3>
        <p className="text-muted-foreground mb-6">
          Contact us via email and we'll get back to you within 24 hours.
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

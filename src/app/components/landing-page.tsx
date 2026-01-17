import {
  ArrowRight,
  Check,
  Sparkles,
  FileText,
  Globe,
  Download,
} from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ThemeToggle } from "./theme-toggle";
import { SiteFooter } from "./site-footer";
import { TemplatePreviewDialog } from "./template-preview-dialog";
import { PLAN_PRODUCTS } from "@/lib/constants/plans";
import { BetaBanner } from "./beta-banner";
import { Logo } from "./logo";

interface LandingPageProps {
  onGetStarted: () => void;
  isLoading?: boolean;
}

export function LandingPage({
  onGetStarted,
  isLoading = false,
}: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <BetaBanner />
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo />
            <div className="flex items-center gap-4">
              <Link
                href="/blog"
                className="hidden md:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Blog
              </Link>
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
              <Button onClick={onGetStarted} size="sm" isLoading={isLoading}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted mb-6">
              <Sparkles className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                AI-Powered Resume Conversion
              </span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
              Convert Your Resumes
              <br />
              <span className="text-muted-foreground">
                to Global Standard Korean
              </span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              AI automatically converts your English resume to professional
              Korean in minutes, creating a local-ready CV that top companies in
              Korea notice.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={onGetStarted}
                size="lg"
                isLoading={isLoading}
                className="w-full sm:w-auto"
              >
                Start for Free
                <ArrowRight className="size-4" />
              </Button>
              <TemplatePreviewDialog
                onSelectTemplate={() => onGetStarted()}
                trigger={
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    View Samples
                  </Button>
                }
              />
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              Start for free without a credit card • First 2 conversions free
            </p>
          </div>
        </div>
      </section>

      {/* Cost Hook Section */}
      <section className="py-20 border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-primary/5 via-primary/5 to-background rounded-3xl p-8 lg:p-12 overflow-hidden relative border border-primary/10">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />
            <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
              <div className="space-y-6 text-center lg:text-left">
                <Badge
                  variant="outline"
                  className="bg-background text-primary border-primary/30 px-3 py-1"
                >
                  Unbeatable Value
                </Badge>
                <h2 className="text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
                  Faster than outsourcing,
                  <br />
                  <span className="text-primary">at 1/10th the cost</span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  Don't spend $50-$100 on a single English resume. Get
                  professional results instantly at a reasonable price without
                  the long wait.
                </p>

                <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <div className="flex items-center gap-3 bg-background/50 rounded-lg p-3 shadow-sm border border-border">
                    <div className="size-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                      <span className="text-red-600 dark:text-red-400 font-bold text-sm">
                        Previous
                      </span>
                    </div>
                    <div className="text-left">
                      <div className="text-xs text-muted-foreground">
                        Average Cost
                      </div>
                      <div className="font-semibold text-sm line-through text-muted-foreground decoration-red-500/50">
                        $100.00
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="hidden sm:block size-5 text-muted-foreground self-center" />
                  <div className="flex items-center gap-3 bg-background rounded-lg p-3 shadow-sm border border-primary/20 ring-1 ring-primary/10">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold text-sm">
                        Now
                      </span>
                    </div>
                    <div className="text-left">
                      <div className="text-xs text-muted-foreground">
                        ApplyGogo
                      </div>
                      <div className="font-bold text-lg text-primary">
                        ${PLAN_PRODUCTS.PASS_30DAY.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side Visual */}
              <div className="relative mx-auto lg:ml-auto w-full max-w-sm">
                <div className="bg-background rounded-2xl shadow-xl border border-border overflow-hidden transform hover:scale-105 transition-transform duration-500">
                  <div className="p-6 border-b border-border bg-muted/30">
                    <div className="text-sm font-medium text-center text-muted-foreground">
                      Price Comparison
                    </div>
                  </div>
                  <div className="p-8 space-y-8">
                    {/* Bar 1 */}
                    <div className="space-y-2 opacity-60">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Other Services
                        </span>
                        <span className="font-medium">$100+</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-gray-400 w-full" />
                      </div>
                    </div>
                    {/* Bar 2 */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-base">
                        <span className="font-bold text-primary">
                          ApplyGogo
                        </span>
                        <span className="font-bold text-primary">
                          ${PLAN_PRODUCTS.PASS_30DAY.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="h-4 bg-primary/10 rounded-full overflow-hidden relative">
                        <div className="h-full bg-primary w-[10%] rounded-full relative">
                          <div className="absolute -right-1 top-0 bottom-0 w-2 bg-white/50 blur-[2px] animate-pulse" />
                        </div>
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] text-primary font-bold pr-3">
                          88% SAVE
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl tracking-tight mb-4">Why ApplyGogo?</h3>
            <p className="text-muted-foreground">
              We create resumes optimized for the Korean job market, not just
              simple translations.
            </p>
          </div>

          <ul className="grid md:grid-cols-3 gap-8">
            <li className="bg-card border border-border rounded-lg p-6">
              <div className="inline-flex items-center justify-center size-12 rounded-lg bg-primary/10 mb-4">
                <Sparkles className="size-6 text-primary" />
              </div>
              <h4 className="text-lg font-semibold mb-2">AI Summarization</h4>
              <p className="text-muted-foreground text-sm">
                Gemini Pro analyzes your English career and reconstructs it into
                3-4 impactful bullet points. Exactly the format Korean
                recruiters want.
              </p>
            </li>

            <li className="bg-card border border-border rounded-lg p-6">
              <div className="inline-flex items-center justify-center size-12 rounded-lg bg-primary/10 mb-4">
                <Globe className="size-6 text-primary" />
              </div>
              <h4 className="text-lg font-semibold mb-2">
                Professional Translation
              </h4>
              <p className="text-muted-foreground text-sm">
                Edit and compare English/Korean side-by-side with Split View.
                Fully customizable with direct editing.
              </p>
            </li>

            <li className="bg-card border border-border rounded-lg p-6">
              <div className="inline-flex items-center justify-center size-12 rounded-lg bg-primary/10 mb-4">
                <Download className="size-6 text-primary" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Premium Templates</h4>
              <p className="text-muted-foreground text-sm">
                Choose from Modern, Professional, Executive, and more. Download
                as PDF instantly and submit to Korean top companies.
              </p>
            </li>
          </ul>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl tracking-tight mb-4">
              Complete in 3 Steps
            </h3>
            <p className="text-muted-foreground">
              Fast and easy without complex processes
            </p>
          </div>

          <ol className="grid md:grid-cols-3 gap-8">
            <li className="text-center">
              <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary text-primary-foreground mb-4 text-xl font-bold">
                1
              </div>
              <h4 className="text-lg font-semibold mb-2">Upload PDF</h4>
              <p className="text-muted-foreground text-sm">
                Drag and drop your English resume PDF
              </p>
            </li>

            <li className="text-center">
              <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary text-primary-foreground mb-4 text-xl font-bold">
                2
              </div>
              <h4 className="text-lg font-semibold mb-2">AI Conversion</h4>
              <p className="text-muted-foreground text-sm">
                AI handles summarization and professional Korean translation
                automatically. You can also edit directly.
              </p>
            </li>

            <li className="text-center">
              <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary text-primary-foreground mb-4 text-xl font-bold">
                3
              </div>
              <h4 className="text-lg font-semibold mb-2">Download PDF</h4>
              <p className="text-muted-foreground text-sm">
                Export to your favorite template and you're done
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* Recommended For */}
      <section className="py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl tracking-tight mb-6 leading-tight">
                Built for Global Talents Applying to Korea
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <Globe className="size-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-1">
                      Korean Company Resume & CV
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      We provide global standard Korean formats for those
                      unfamiliar with local styles and professional Korean
                      translations.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="size-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                    <Sparkles className="size-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-1">
                      Fast English to Korean Conversion
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Need a Korean resume now? Just upload your existing
                      English resume and finish in 5 minutes.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="size-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                    <FileText className="size-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-1">
                      AI Korean Resume Editing
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Not just translation—we polish your experience into
                      sophisticated Korean matching local recruitment standards.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-muted/50 rounded-2xl p-8 border border-border">
              {/* Abstract Visual Representation */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border shadow-sm">
                  <div className="size-8 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-1/3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                    <div className="h-3 w-3/4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                  </div>
                </div>
                <div className="flex justify-center text-muted-foreground">
                  <ArrowRight className="size-5 rotate-90 my-2" />
                </div>
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-primary/20 shadow-sm ring-1 ring-primary/10">
                  <div className="size-8 rounded bg-primary/10 flex items-center justify-center">
                    <Check className="size-4 text-primary" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium">
                      Professional Korean Resume
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Perfectly formatted & translated
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-4">
            <h3 className="text-3xl tracking-tight font-bold">Simple Passes</h3>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-foreground/5 border border-foreground/10 text-foreground text-sm font-medium">
              <span>🎉</span>
              <span>Limited Launch Special</span>
            </div>
            <p className="text-muted-foreground">
              Prices you won't see again. Start with a reasonable pass.
            </p>
          </div>

          <ul className="grid md:grid-cols-3 gap-6">
            {/* Free Plan */}
            <li className="bg-card border border-border rounded-lg p-6 text-center flex flex-col h-full">
              <h4 className="text-lg font-semibold mb-2">Start for Free</h4>
              <div className="flex flex-col items-center justify-center mb-4">
                <span className="text-lg font-medium text-transparent mb-1 min-h-[28px]">
                  Placeholder
                </span>
                <div className="text-4xl font-bold">$0</div>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Try the service
              </p>
              <ul className="space-y-2.5 mb-6 text-sm text-muted-foreground text-left flex-1">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600 shrink-0" />
                  <span className="font-semibold text-foreground">10</span>{" "}
                  Credits provided
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600 shrink-0" />
                  Basic Templates
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600 shrink-0" />1 Credit
                  per Re-translation
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600 shrink-0" />
                  Unlimited duration
                </li>
              </ul>
              <Button
                variant="outline"
                className="w-full mt-auto"
                onClick={onGetStarted}
                isLoading={isLoading}
              >
                Get Started
              </Button>
            </li>

            {/* 7-Day Pass */}
            <li className="bg-card border border-border rounded-lg p-6 text-center flex flex-col h-full">
              <h4 className="text-lg font-semibold mb-2">7-Day Pass</h4>
              <div className="flex flex-col items-center justify-center mb-4">
                <span className="text-lg font-medium text-muted-foreground/60 line-through mb-1 min-h-[28px]">
                  ${PLAN_PRODUCTS.PASS_7DAY.originalPrice?.toFixed(2)}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-bold">
                    ${PLAN_PRODUCTS.PASS_7DAY.price.toFixed(2)}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-sm px-2 py-0.5 text-foreground border-foreground/10 bg-foreground/5"
                  >
                    55% OFF
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                All functions for 7 days
              </p>
              <ul className="space-y-2.5 mb-6 text-sm text-muted-foreground text-left flex-1">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600 shrink-0" />
                  <span className="font-semibold text-foreground">
                    {PLAN_PRODUCTS.PASS_7DAY.credits}
                  </span>{" "}
                  Credits included
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600 shrink-0" />
                  All Templates
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600 shrink-0" />
                  Unlimited Re-translation
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600 shrink-0" />7 Days
                  Access
                </li>
              </ul>
              <Button
                variant="outline"
                className="w-full mt-auto"
                onClick={onGetStarted}
                isLoading={isLoading}
              >
                Get Started
              </Button>
            </li>

            {/* 30-Day Pass (Recommended) */}
            <li className="bg-card border border-primary rounded-lg p-6 text-center shadow-lg relative ring-1 ring-primary/20 flex flex-col h-full">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs rounded-full font-medium">
                Recommended
              </div>
              <h4 className="text-lg font-semibold mb-2">30-Day Pass</h4>
              <div className="flex flex-col items-center justify-center mb-4">
                <span className="text-lg font-medium text-muted-foreground/60 line-through mb-1 min-h-[28px]">
                  ${PLAN_PRODUCTS.PASS_30DAY.originalPrice?.toFixed(2)}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-bold text-primary">
                    ${PLAN_PRODUCTS.PASS_30DAY.price.toFixed(2)}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-sm px-2 py-0.5 text-foreground border-foreground/10 bg-foreground/5"
                  >
                    60% OFF
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                All functions for a month
              </p>
              <ul className="space-y-2.5 mb-6 text-sm text-muted-foreground text-left flex-1">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600 shrink-0" />
                  <span className="font-semibold text-foreground">
                    {PLAN_PRODUCTS.PASS_30DAY.credits}
                  </span>{" "}
                  Credits included
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600 shrink-0" />
                  All Templates
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600 shrink-0" />
                  Unlimited Re-translation
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600 shrink-0" />
                  30 Days Access
                </li>
              </ul>
              <Button
                className="w-full mt-auto"
                onClick={onGetStarted}
                isLoading={isLoading}
              >
                Get Started
              </Button>
            </li>
          </ul>
          <p className="text-center text-sm text-muted-foreground mt-8">
            * 5 credits deducted per resume creation. Free for pass holders or 1
            credit for free users for re-translations.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl tracking-tight mb-4">FAQ</h3>
            <p className="text-muted-foreground">Check common questions</p>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-border p-6 bg-card">
              <h4 className="font-semibold mb-2">
                Does the Korean resume format matter?
              </h4>
              <p className="text-sm text-muted-foreground">
                No, we support most PDF formats including free-form and
                downloads from job sites. AI extracts and analyzes text
                regardless of complexity.
              </p>
            </div>
            <div className="rounded-lg border border-border p-6 bg-card">
              <h4 className="font-semibold mb-2">
                Can I edit the translated content?
              </h4>
              <p className="text-sm text-muted-foreground">
                Yes! After AI conversion, you can freely edit the summary and
                English translation in our editor. Use Split View to refine it
                alongside the original.
              </p>
            </div>
            <div className="rounded-lg border border-border p-6 bg-card">
              <h4 className="font-semibold mb-2">Is the free plan enough?</h4>
              <p className="text-sm text-muted-foreground">
                We provide 10 credits monthly for you to try the service. It's
                enough to complete and download a resume, but we recommend a
                pass for premium templates and unlimited edits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl tracking-tight mb-4">
            Start Your Global Career Now
          </h3>
          <p className="text-muted-foreground mb-8">
            Stop worrying about Korean resumes with ApplyGogo.
          </p>
          <Button onClick={onGetStarted} size="lg" isLoading={isLoading}>
            Start for Free
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

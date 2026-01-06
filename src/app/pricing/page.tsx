"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ThemeProvider } from "@/components/theme-provider";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  const handleNavigate = (item: string) => {
    if (item === "Dashboard") router.push("/");
    // Add other routes as needed
  };

  const handleSubscribe = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      // Mock Payment Process
      // In reality, this would open PortOne payment window
      const confirmPayment = confirm(
        "Simulating Payment for PRO Plan (₩9,900). Proceed?"
      );

      if (confirmPayment) {
        // Call API to upgrade subscription
        const res = await fetch("/api/subscriptions/upgrade", {
          method: "POST",
        });

        if (res.ok) {
          alert(
            "Subscription upgraded successfully! You now have unlimited access."
          );
          router.push("/");
          router.refresh(); // Refresh to update quota in header
        } else {
          alert("Upgrade failed. Please try again.");
        }
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <DashboardLayout
        userEmail={session?.user?.email || ""}
        userName={session?.user?.name || ""}
        userImage={session?.user?.image || ""}
        plan="FREE" // TODO: Fetch real plan
        quota={1} // TODO: Fetch real quota
        activeItem="Subscription"
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      >
        <div className="py-12 bg-background">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base font-semibold text-primary tracking-wide uppercase">
                PRICING
              </h2>
              <p className="mt-2 text-3xl font-extrabold text-foreground sm:text-4xl">
                Choose the plan that fits you
              </p>
              <p className="mt-4 max-w-2xl text-xl text-muted-foreground mx-auto">
                Simple pricing, no hidden fees.
              </p>
            </div>

            <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-12">
              {/* Free Plan */}
              <Card>
                <CardHeader>
                  <CardTitle>Free</CardTitle>
                  <CardDescription>
                    Perfect for trying out the service.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline text-5xl font-extrabold">
                    ₩0
                    <span className="text-xl font-medium text-muted-foreground">
                      /mo
                    </span>
                  </div>
                  <ul className="mt-6 space-y-4">
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-6 w-6 text-green-500" />
                      </div>
                      <p className="ml-3 text-base text-muted-foreground">
                        1 Resume per month
                      </p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-6 w-6 text-green-500" />
                      </div>
                      <p className="ml-3 text-base text-muted-foreground">
                        Basic AI Summaries
                      </p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-6 w-6 text-green-500" />
                      </div>
                      <p className="ml-3 text-base text-muted-foreground">
                        PDF Export
                      </p>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline" disabled>
                    Current Plan
                  </Button>
                </CardFooter>
              </Card>

              {/* Pro Plan */}
              <Card className="border-primary shadow-lg relative">
                <div className="absolute top-0 right-0 -mt-2 -mr-2 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                  POPULAR
                </div>
                <CardHeader>
                  <CardTitle>Pro</CardTitle>
                  <CardDescription>For serious job seekers.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline text-5xl font-extrabold">
                    ₩9,900
                    <span className="text-xl font-medium text-muted-foreground">
                      /mo
                    </span>
                  </div>
                  <ul className="mt-6 space-y-4">
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-6 w-6 text-green-500" />
                      </div>
                      <p className="ml-3 text-base text-muted-foreground">
                        Unlimited Resumes
                      </p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-6 w-6 text-green-500" />
                      </div>
                      <p className="ml-3 text-base text-muted-foreground">
                        Advanced AI & Translation
                      </p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-6 w-6 text-green-500" />
                      </div>
                      <p className="ml-3 text-base text-muted-foreground">
                        Priority Support
                      </p>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={handleSubscribe}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Upgrade to Pro"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ThemeProvider>
  );
}

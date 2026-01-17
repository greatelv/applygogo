import { Metadata } from "next";
import { SharedDashboardLayout } from "@/app/components/shared-dashboard-layout";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SharedDashboardLayout>{children}</SharedDashboardLayout>;
}

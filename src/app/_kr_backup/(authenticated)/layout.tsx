import { Metadata } from "next";
import { SharedServiceLayout } from "@/app/components/shared-service-layout";

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
  return <SharedServiceLayout>{children}</SharedServiceLayout>;
}

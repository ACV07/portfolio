import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = { title: "Landing pages" };

export default function Page() {
  return <ComingSoon title="Landing pages" />;
}

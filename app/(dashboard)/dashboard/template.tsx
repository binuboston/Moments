import { PageEnter } from "@/components/motion/page-enter";

/** Remounts on every dashboard navigation so each page plays its entrance. */
export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  return <PageEnter>{children}</PageEnter>;
}

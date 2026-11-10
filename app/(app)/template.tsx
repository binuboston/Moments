import { PageEnter } from "@/components/motion/page-enter";

/** Remounts on every app navigation so each page plays its entrance. */
export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return <PageEnter>{children}</PageEnter>;
}

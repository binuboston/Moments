import { cn } from "@/lib/utils/cn";

export function Branding({ show, className }: { show: boolean; className?: string }) {
  if (!show) return null;
  return (
    <p className={cn("px-6 pb-8 text-center text-xs text-(--inv-muted)", className)}>
      Made with{" "}
      <a href="/" className="font-semibold underline-offset-2 hover:underline" target="_blank" rel="noopener noreferrer">
        Mirth
      </a>
    </p>
  );
}

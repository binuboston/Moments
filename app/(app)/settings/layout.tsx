/** Page container for app sections (home manages its own full-bleed feed). */
export default function SectionLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl min-w-0 px-4 py-4 sm:px-6 sm:py-6">{children}</div>;
}

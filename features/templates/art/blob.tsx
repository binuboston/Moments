/** Soft organic blob, filled with the current colour. */
export function Blob({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M47.7,-56.6C60.8,-47.1,69.6,-30.5,72.5,-13.1C75.5,4.3,72.6,22.5,63.1,36.8C53.6,51.1,37.5,61.5,20.5,66.4C3.5,71.3,-14.4,70.7,-30.3,64.1C-46.2,57.5,-60.1,44.9,-66.8,29.3C-73.5,13.7,-73,-4.9,-66.5,-20.6C-60,-36.3,-47.5,-49.1,-33.3,-57.1C-19.1,-65.1,-3.2,-68.3,11.6,-66.9C26.4,-65.5,34.6,-66.1,47.7,-56.6Z"
        transform="translate(100 100)"
      />
    </svg>
  );
}

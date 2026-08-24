export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const scale = { sm: "text-lg", md: "text-2xl", lg: "text-4xl" }[size];
  return (
    <span className={`display-tight ${scale} inline-flex items-baseline gap-[0.15em] leading-none`}>
      <span className="text-bone">RAP</span>
      <span className="relative text-blood">
        TRENDS
        <span
          aria-hidden
          className="absolute -right-[0.28em] top-[0.06em] block h-[0.34em] w-[0.34em] rounded-full bg-volt"
        />
      </span>
    </span>
  );
}

export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} role="img" aria-label="RAP TRENDS">
      <rect width="32" height="32" rx="4" fill="#050506" />
      <path d="M5 24V8h7.6c3.4 0 5.6 1.9 5.6 4.9 0 2.2-1.2 3.8-3.2 4.5L19 24h-4.2l-3.4-6h-1.6v6H5Zm4.8-9.3h2.3c1.3 0 2.1-.7 2.1-1.8s-.8-1.8-2.1-1.8H9.8v3.6Z" fill="#EFEAE0" />
      <path d="M20 24 27 8h.2l-2.3 16H20Z" fill="#D42026" />
      <circle cx="27" cy="6" r="2.4" fill="#1B57F5" />
    </svg>
  );
}

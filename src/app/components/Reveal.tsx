import { useRef, useState, useEffect, type ReactNode } from "react";

export default function Reveal({
  children,
  className = "",
  delay = 0,
  y = 24,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Reveal if genuinely intersecting, or if a fast/instant scroll jumped
        // past this element entirely (it's already above the viewport) so
        // content never gets stuck invisible.
        if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? "opacity-100" : "opacity-0"} ${className}`}
      style={{ transitionDelay: `${delay}ms`, transform: visible ? "translateY(0)" : `translateY(${y}px)` }}
    >
      {children}
    </div>
  );
}

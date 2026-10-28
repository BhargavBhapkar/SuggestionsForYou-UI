import { useEffect, useRef, useState } from "react";

const PARTS = /^(\D*)(\d[\d,]*(?:\.\d+)?)(.*)$/;

// Counts the number inside a value like "1,500+", "99.9%" or "₹180Cr+" up from zero the first
// time it scrolls into view. With reduced motion it just shows the value.
export default function CountUp({ value, duration = 1400 }: { value: string; duration?: number }) {
  const match = value.match(PARTS);
  const ref = useRef<HTMLSpanElement>(null);
  const [text, setText] = useState(value);

  useEffect(() => {
    setText(value);
    const el = ref.current;
    if (!match || !el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const [, prefix, num, suffix] = match;
    const target = parseFloat(num.replace(/,/g, ""));
    const decimals = num.includes(".") ? num.split(".")[1].length : 0;
    const grouped = num.includes(",");
    const fmt = (v: number) => (grouped ? v.toLocaleString("en-IN", { maximumFractionDigits: decimals, minimumFractionDigits: decimals }) : v.toFixed(decimals));
    let raf = 0;

    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 4);
        setText(`${prefix}${fmt(target * eased)}${suffix}`);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    setText(`${prefix}${fmt(0)}${suffix}`);
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { io.disconnect(); run(); }
    }, { threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value, duration]); // eslint-disable-line react-hooks/exhaustive-deps

  return <span ref={ref} className="tabular-nums">{text}</span>;
}

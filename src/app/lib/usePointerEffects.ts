import { useEffect } from "react";

const TILT_VARS = ["--rx", "--ry", "--gx", "--gy"];
const MAGNET_SELECTOR = 'button[class*="bg-[#F97316]"], a[class*="bg-[#F97316]"]';

function resetTilt(el: HTMLElement) {
  for (const v of TILT_VARS) el.style.removeProperty(v);
  delete el.dataset.tilting;
}

function resetMagnet(el: HTMLElement) {
  el.style.removeProperty("--tx");
  el.style.removeProperty("--ty");
}

// One pointer listener for the whole page. It publishes the pointer position as --mx/--my
// (-1..1) for parallax layers, tilts whichever [data-tilt] element is under the pointer and
// nudges primary buttons toward the pointer ("magnetic" buttons). The matching styles live in
// styles/bordeaux.css. Does nothing on touch screens or when reduced motion is requested.
export default function usePointerEffects() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    let raf = 0;
    let last: PointerEvent | null = null;
    let activeTilt: HTMLElement | null = null;
    let activeMagnet: HTMLElement | null = null;

    const frame = () => {
      raf = 0;
      const e = last;
      if (!e) return;
      root.style.setProperty("--mx", String((e.clientX / window.innerWidth - 0.5) * 2));
      root.style.setProperty("--my", String((e.clientY / window.innerHeight - 0.5) * 2));

      const el = e.target instanceof Element ? e.target : null;

      const tilt = el ? el.closest<HTMLElement>("[data-tilt]") : null;
      if (activeTilt && activeTilt !== tilt) resetTilt(activeTilt);
      if (tilt) {
        const r = tilt.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const max = Number(tilt.dataset.tilt) || 6;
        tilt.style.setProperty("--rx", `${((0.5 - py) * 2 * max).toFixed(2)}deg`);
        tilt.style.setProperty("--ry", `${((px - 0.5) * 2 * max).toFixed(2)}deg`);
        tilt.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
        tilt.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
        tilt.dataset.tilting = "true";
      }
      activeTilt = tilt;

      const btn = el ? el.closest<HTMLElement>(MAGNET_SELECTOR) : null;
      if (activeMagnet && activeMagnet !== btn) resetMagnet(activeMagnet);
      if (btn) {
        const r = btn.getBoundingClientRect();
        const nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        const reach = Math.min(r.width, 220) / 220; // wide buttons move less
        btn.dataset.magnetic = "true";
        btn.style.setProperty("--tx", `${(nx * 7 * reach).toFixed(1)}px`);
        btn.style.setProperty("--ty", `${(ny * 5 * reach).toFixed(1)}px`);
      }
      activeMagnet = btn;
    };

    const onMove = (e: PointerEvent) => {
      last = e;
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const onLeave = () => {
      if (activeTilt) resetTilt(activeTilt);
      if (activeMagnet) resetMagnet(activeMagnet);
      activeTilt = null;
      activeMagnet = null;
      root.style.setProperty("--mx", "0");
      root.style.setProperty("--my", "0");
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
      if (activeTilt) resetTilt(activeTilt);
      if (activeMagnet) resetMagnet(activeMagnet);
      root.style.removeProperty("--mx");
      root.style.removeProperty("--my");
    };
  }, []);
}

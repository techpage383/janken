import { useEffect } from "react";
import { toast } from "sonner";

const SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

export function KonamiRainbow() {
  useEffect(() => {
    let buf: string[] = [];
    function onKey(e: KeyboardEvent) {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      buf = [...buf, k].slice(-SEQUENCE.length);
      if (SEQUENCE.every((s, i) => s.toLowerCase() === buf[i]?.toLowerCase())) {
        const on = document.body.classList.toggle("rainbow-mode");
        toast(on ? "🌈 RAINBOW MODE 起動！" : "通常モードに戻りました", {
          description: on ? "↑↑↓↓←→←→BAでもう一度OFFに" : undefined,
        });
        buf = [];
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return null;
}
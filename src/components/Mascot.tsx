import { useEffect, useState } from "react";

// 画面下を時々横切る、踊りながら走るドット絵風マスコット 🤖✊✌🖐
const FACES = ["✊", "✌", "🖐", "🤖", "👾", "🎲"];

export function Mascot() {
  const [run, setRun] = useState<{ id: number; face: string; dir: 1 | -1 } | null>(null);

  useEffect(() => {
    let id = 0;
    function go() {
      id += 1;
      setRun({
        id,
        face: FACES[Math.floor(Math.random() * FACES.length)],
        dir: Math.random() > 0.5 ? 1 : -1,
      });
      setTimeout(() => setRun(null), 8500);
    }
    const initial = setTimeout(go, 2500);
    const iv = setInterval(go, 14000);
    return () => {
      clearTimeout(initial);
      clearInterval(iv);
    };
  }, []);

  if (!run) return null;
  return (
    <div
      key={run.id}
      aria-hidden
      className="pointer-events-none fixed bottom-10 left-0 z-30 select-none"
      style={{
        animation: `mascot-run-${run.dir === 1 ? "lr" : "rl"} 8s linear forwards`,
      }}
    >
      <span className="inline-block text-3xl animate-mascot-bob drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">
        {run.face}
      </span>
    </div>
  );
}
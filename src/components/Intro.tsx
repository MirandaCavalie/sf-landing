"use client";

import { useEffect, useRef } from "react";
import SFScene from "@/components/SFScene";

// Opening animation: an electric car flies in over SF, lands on the Golden Gate
// deck (squash + fog puff), then the "SF LANDING" wordmark slams in. ~3.5s.
const TOTAL_MS = 3500;
const REDUCED_MS = 600;

export default function Intro({ onDone }: { onDone: () => void }) {
  const doneRef = useRef(onDone);
  const firedRef = useRef(false);

  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const finish = () => {
      if (firedRef.current) return;
      firedRef.current = true;
      doneRef.current();
    };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(finish, reduced ? REDUCED_MS : TOTAL_MS);
    window.addEventListener("keydown", finish);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", finish);
    };
  }, []);

  const skip = () => {
    if (firedRef.current) return;
    firedRef.current = true;
    doneRef.current();
  };

  return (
    <div
      className="intro-root fixed inset-0 z-[100] cursor-pointer select-none overflow-hidden bg-bay"
      onClick={skip}
      role="presentation"
    >
      <style>{CSS}</style>

      <SFScene animate />

      <div className="pointer-events-none absolute inset-x-0 top-[11%] flex flex-col items-center px-4 text-center">
        <h1 className="intro-word font-display uppercase leading-none tracking-wide text-paper text-[clamp(64px,15vw,190px)] [text-shadow:0_6px_30px_rgba(18,18,18,.45)]">
          SF <span className="text-bridge">Landing</span>
        </h1>
        <p className="intro-tag mt-3 font-mono text-[clamp(12px,2vw,20px)] uppercase tracking-[0.3em] text-fog">
          Land like a local.
        </p>
      </div>

      <span className="absolute bottom-3 right-4 font-mono text-[10px] uppercase tracking-widest text-paper/70">
        Skip &middot; click or any key
      </span>
    </div>
  );
}

const CSS = `
.intro-scene{transform-origin:50% 100%}
.intro-fly,.intro-squash,.intro-puff{transform-box:fill-box}
.intro-squash{transform-origin:50% 100%}
.intro-puff{transform-origin:50% 50%;opacity:0}
.intro-thrust{opacity:0}
@media (prefers-reduced-motion:no-preference){
  .intro-root{animation:in-out .4s ease-in 3.1s both}
  .intro-scene{animation:in-cam 3.5s cubic-bezier(.2,.7,.2,1) both}
  .intro-fly{animation:in-fly 1.5s cubic-bezier(.25,.6,.3,1) both}
  .intro-squash{animation:in-squash .6s ease-out 1.5s both}
  .intro-thrust{animation:in-thrust 1.6s ease-out both}
  .intro-beam{animation:in-beam 1.2s ease-out .3s both}
  .intro-puff{animation:in-puff 1s ease-out both}
  .intro-word{animation:in-slam .45s cubic-bezier(.2,1.4,.4,1) 2s both}
  .intro-tag{animation:in-fade .5s ease-out 2.55s both}
}
@keyframes in-out{to{opacity:0}}
@keyframes in-cam{
  0%{transform:scale(1.12)}
  43%{transform:scale(1.1) translateY(0)}
  47%{transform:scale(1.1) translateY(6px)}
  54%{transform:scale(1.09) translateY(-2px)}
  100%{transform:scale(1) translateY(0)}
}
@keyframes in-fly{
  0%{transform:translate(-520px,-620px) rotate(-16deg);opacity:0}
  8%{opacity:1}
  70%{transform:translate(-70px,-90px) rotate(6deg);opacity:1}
  100%{transform:translate(0,0) rotate(0);opacity:1}
}
@keyframes in-squash{
  0%{transform:scale(1,1)}
  22%{transform:scale(1.08,.86)}
  52%{transform:translateY(-10px) scale(.99,1.03)}
  78%{transform:scale(1.03,.95)}
  100%{transform:scale(1,1)}
}
@keyframes in-thrust{0%{opacity:.9}85%{opacity:.8}100%{opacity:0}}
@keyframes in-beam{from{opacity:.1}to{opacity:.75}}
@keyframes in-puff{
  0%{opacity:0;transform:translate(0,0) scale(.3)}
  20%{opacity:.85}
  100%{opacity:0;transform:translate(var(--dx),-22px) scale(2.4)}
}
@keyframes in-slam{
  0%{opacity:0;transform:scale(2.2)}
  60%{opacity:1;transform:scale(.95)}
  100%{opacity:1;transform:scale(1)}
}
@keyframes in-fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
`;

"use client";

import { useEffect, useRef } from "react";

// Opening animation: an electric car flies in over SF, lands on the Golden Gate
// deck (squash + fog puff), then the "SF LANDING" wordmark slams in. ~3.5s.
const TOTAL_MS = 3500;
const REDUCED_MS = 600;

const SUSPENDERS = Array.from({ length: 15 }, (_, i) => 304 + i * 14);
const PUFFS = [
  { dx: -150, r: 16, d: 0 },
  { dx: -90, r: 22, d: 0.04 },
  { dx: -40, r: 14, d: 0.08 },
  { dx: 45, r: 15, d: 0.02 },
  { dx: 100, r: 22, d: 0.06 },
  { dx: 160, r: 16, d: 0.1 },
];

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

      <svg
        className="intro-scene absolute inset-0 h-full w-full"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="in-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#121b2e" />
            <stop offset=".28" stopColor="#1f3a5f" />
            <stop offset=".55" stopColor="#8fa3b5" />
            <stop offset=".72" stopColor="#f6a47f" />
            <stop offset="1" stopColor="#eeebe5" />
          </linearGradient>
          <linearGradient id="in-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a5575" />
            <stop offset="1" stopColor="#1f3a5f" />
          </linearGradient>
          <linearGradient id="in-fog" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#eeebe5" stopOpacity="0" />
            <stop offset="1" stopColor="#eeebe5" stopOpacity=".75" />
          </linearGradient>
          <linearGradient id="in-beam" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff3cf" stopOpacity=".95" />
            <stop offset="1" stopColor="#fff3cf" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="in-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f6f6f4" />
            <stop offset="1" stopColor="#b9bec4" />
          </linearGradient>
          <radialGradient id="in-glow">
            <stop offset="0" stopColor="#7fd8ff" stopOpacity=".9" />
            <stop offset="1" stopColor="#7fd8ff" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="800" height="600" fill="url(#in-sky)" />
        <circle cx="400" cy="395" r="95" fill="#ffd9b0" opacity=".55" />
        <path d="M0 440 Q120 385 260 425 T520 415 T800 405 L800 600 L0 600Z" fill="#3a5575" opacity=".85" />
        <rect y="488" width="800" height="112" fill="url(#in-water)" />
        <rect y="400" width="800" height="100" fill="url(#in-fog)" />

        {/* Golden Gate */}
        <g fill="var(--bridge)">
          {[290, 510].map((x) => (
            <g key={x}>
              <rect x={x - 13} y="250" width="9" height="222" />
              <rect x={x + 4} y="250" width="9" height="222" />
              {[290, 340, 395].map((y) => (
                <rect key={y} x={x - 13} y={y} width="26" height="6" />
              ))}
              <rect x={x - 16} y="242" width="32" height="9" />
            </g>
          ))}
        </g>
        <g stroke="var(--bridge)" strokeWidth="3" fill="none">
          <path d="M-20 440 Q145 405 290 252" />
          <path d="M290 252 Q400 392 510 252" />
          <path d="M510 252 Q655 405 820 440" />
          <g strokeWidth="1.5">
            {SUSPENDERS.map((x) => {
              const t = (x - 290) / 220;
              return <line key={x} x1={x} y1={252 + 280 * t * (1 - t)} x2={x} y2="470" />;
            })}
          </g>
        </g>
        <rect x="-20" y="470" width="840" height="8" fill="var(--bridge-ink)" />
        <rect x="-20" y="478" width="840" height="9" fill="#8f2310" opacity=".8" />
        <rect x="-20" y="469" width="840" height="1.5" fill="#fbfaf7" opacity=".6" />
        <rect y="540" width="800" height="60" fill="#eeebe5" opacity=".55" />

        {/* Touchdown fog / dust puff */}
        <g>
          {PUFFS.map((p) => (
            <circle
              key={p.dx}
              className="intro-puff"
              cx="400"
              cy="466"
              r={p.r}
              fill="#eeebe5"
              style={{ ["--dx" as string]: `${p.dx}px`, animationDelay: `${1.45 + p.d}s` }}
            />
          ))}
        </g>

        {/* Car: outer = placement, fly = descent, squash = suspension */}
        <g transform="translate(400 470) scale(1.15)">
          <g className="intro-fly">
            <g className="intro-squash">
              <ellipse className="intro-thrust" cx="0" cy="6" rx="95" ry="16" fill="url(#in-glow)" />
              <polygon className="intro-beam" points="80,-19 330,-52 330,10" fill="url(#in-beam)" />
              <path
                d="M-82 -10 C-84 -22 -70 -25 -52 -28 C-34 -44 -8 -48 16 -46 C36 -44 50 -32 64 -27 C78 -24 84 -20 84 -12 L84 -8 L-82 -8Z"
                fill="url(#in-body)"
              />
              <path d="M-40 -29 C-26 -41 -6 -43 14 -41 C28 -39 38 -33 46 -28Z" fill="#121212" opacity=".88" />
              <path d="M-4 -42 L-1 -29" stroke="#b9bec4" strokeWidth="2" />
              <path d="M-78 -16 L80 -16" stroke="#121212" strokeOpacity=".25" strokeWidth="1" />
              <rect x="70" y="-24" width="14" height="4" rx="2" fill="#fff3cf" />
              <rect x="-84" y="-23" width="9" height="3" rx="1.5" fill="var(--bridge)" />
              {[-48, 52].map((x) => (
                <g key={x}>
                  <circle cx={x} cy="-11" r="12" fill="#121212" />
                  <circle cx={x} cy="-11" r="6" fill="#8fa3b5" />
                </g>
              ))}
            </g>
          </g>
        </g>
      </svg>

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

"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (val: string) => void;
}

function ease(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function OtpInput({ length = 4, value, onChange }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const ringSvgRef = useRef<SVGSVGElement | null>(null);
  const centerDotRef = useRef<HTMLDivElement | null>(null);

  const [activeInput, setActiveInput] = useState<number>(0);
  const [orbited, setOrbited] = useState(false);

  // Layout constants based on a 312x312 stage
  const hub = { x: 156, y: 156 };
  const rowPos = [
    { x: 64, y: 156 },
    { x: 124, y: 156 },
    { x: 184, y: 156 },
    { x: 244, y: 156 },
  ];
  const ringPos = [
    { x: 156, y: 50 },
    { x: 262, y: 156 },
    { x: 156, y: 262 },
    { x: 50, y: 156 },
  ];

  const orbitBox = useCallback((box: HTMLElement, start: {x:number, y:number}, end: {x:number, y:number}, delay: number, duration: number) => {
    const dx0 = start.x - hub.x;
    const dy0 = start.y - hub.y;
    const dx1 = end.x - hub.x;
    const dy1 = end.y - hub.y;
    const r0 = Math.hypot(dx0, dy0);
    const r1 = Math.hypot(dx1, dy1);
    const a0 = Math.atan2(dy0, dx0);
    const a1 = Math.atan2(dy1, dx1);
    let delta = a1 - a0;
    while (delta <= 0) delta += 2 * Math.PI;
    delta += 2 * Math.PI; // do an extra loop for visual effect
    const startTime = performance.now() + delay;

    function frame(now: number) {
      if (now < startTime) {
        requestAnimationFrame(frame);
        return;
      }
      let t = (now - startTime) / duration;
      if (t > 1) t = 1;
      const et = ease(t);
      const ang = a0 + delta * et;
      const rad = r0 + (r1 - r0) * et;
      const x = hub.x + rad * Math.cos(ang);
      const y = hub.y + rad * Math.sin(ang);
      const tilt = (ang - a1) * (180 / Math.PI) * 0.6;
      
      box.style.left = `${x}px`;
      box.style.top = `${y}px`;
      box.style.transform = `translate(-50%,-50%) rotate(${tilt}deg)`;
      
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        box.style.transform = `translate(-50%,-50%) rotate(0deg)`;
        box.classList.add("border-[#2ee6a8]", "text-[#2ee6a8]");
        box.classList.remove("border-slate-600", "border-indigo-400");
      }
    }
    requestAnimationFrame(frame);
  }, []);

  const startOrbit = useCallback(() => {
    if (orbited) return;
    setOrbited(true);
    
    // Blur all inputs
    inputRefs.current.forEach((b) => b?.blur());
    
    // Show SVG ring and center dot
    if (ringSvgRef.current) ringSvgRef.current.style.opacity = "1";
    if (centerDotRef.current) centerDotRef.current.style.opacity = "1";
    
    // Start animation for each box
    inputRefs.current.forEach((box, i) => {
      if (box) {
        orbitBox(box, rowPos[i], ringPos[i], i * 90, 900);
      }
    });
  }, [orbited, orbitBox]);

  // Check if we should orbit
  useEffect(() => {
    if (value.length === length && !orbited) {
      const timer = setTimeout(startOrbit, 200);
      return () => clearTimeout(timer);
    }
  }, [value, length, orbited, startOrbit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (orbited) return;
    const val = e.target.value.replace(/[^0-9]/g, "");
    const newValue = value.split("");
    newValue[index] = val.slice(-1);
    
    const finalVal = newValue.join("").slice(0, length);
    onChange(finalVal);

    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (orbited) return;
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (orbited) return;
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, length);
    onChange(pasteData);
    
    const nextIndex = Math.min(pasteData.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="relative mx-auto" style={{ width: 312, height: 312 }}>
      {/* Orbit Ring Background SVG */}
      <svg
        ref={ringSvgRef}
        className="absolute inset-0 transition-opacity duration-500 pointer-events-none"
        style={{ opacity: 0 }}
        width="312"
        height="312"
        viewBox="0 0 312 312"
      >
        <circle cx="156" cy="156" r="106" fill="none" stroke="#33333e" strokeWidth="1.5" />
      </svg>
      
      {/* Center Pulse Dot */}
      <div
        ref={centerDotRef}
        className="absolute w-1.5 h-1.5 rounded-full bg-[#2ee6a8] transition-opacity duration-500 animate-pulse pointer-events-none"
        style={{ opacity: 0, top: 156, left: 156, transform: "translate(-50%, -50%)" }}
      />

      {/* The 4 OTP Inputs */}
      {Array.from({ length }).map((_, index) => {
        // Initial absolute positions matching rowPos
        const initialTop = rowPos[index].y;
        const initialLeft = rowPos[index].x;
        
        return (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={value[index] || ""}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={index === 0 ? handlePaste : undefined}
            onFocus={() => !orbited && setActiveInput(index)}
            className={`
              absolute w-12 h-14 text-center text-2xl font-medium rounded-xl 
              bg-[#1A2332] border-2 outline-none transition-colors duration-300
              ${
                !orbited && activeInput === index
                  ? "border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                  : value[index]
                  ? "border-slate-600 text-slate-200"
                  : "border-[#2e2e38] text-slate-500"
              }
            `}
            style={{
              top: initialTop,
              left: initialLeft,
              transform: "translate(-50%, -50%)",
            }}
          />
        );
      })}
    </div>
  );
}

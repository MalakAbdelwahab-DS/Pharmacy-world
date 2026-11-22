"use client";

import { useEffect, useRef } from "react";

// Interactive globe for the About hero, drawn on a canvas.
// Echoes the logo: a blue line globe with a gold orbit. Medicine names circle it,
// Jordan pulses in gold, and the globe can be dragged to spin (with inertia).

const NAMES = [
  "Panadol",
  "باراسيتامول",
  "Vitamin D",
  "فيتامين د",
  "Amoxicillin",
  "إيبوبروفين",
  "Omeprazole",
  "أموكسيسيلين",
  "Ibuprofen",
  "أوميبرازول",
];

const JORDAN = { lat: (31.95 * Math.PI) / 180, lon: (35.93 * Math.PI) / 180 };
const TILT = 0.38; // tip the globe so Jordan sits just above the centre
const ORBIT_TILT = 0.32;

export function HeroGlobe({ label, hint }: { label: string; hint: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const css = getComputedStyle(document.documentElement);
    const gold = css.getPropertyValue("--color-gold").trim() || "#ecb04c";
    const navy = css.getPropertyValue("--color-navy").trim() || "#132e5c";
    const blue = css.getPropertyValue("--color-blue").trim() || "#1b4a8f";

    // Start with Jordan facing the viewer
    let rot = -JORDAN.lon;
    let velocity = reduceMotion ? 0 : 0.0025;
    let orbit = 0;
    let dragging = false;
    let lastX = 0;
    let lastT = 0;
    let parallaxX = 0;
    let parallaxY = 0;
    let targetPX = 0;
    let targetPY = 0;
    let size = 0;
    let dpr = 1;
    let frame = 0;
    let visible = true;
    let t = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = canvas.clientWidth;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);

    // Point on the globe -> screen, with z > 0 facing the viewer
    const project = (lat: number, lon: number, R: number, cx: number, cy: number) => {
      const x0 = Math.cos(lat) * Math.sin(lon + rot);
      const y0 = Math.sin(lat);
      const z0 = Math.cos(lat) * Math.cos(lon + rot);
      const tilt = TILT + parallaxY * 0.15;
      const y = y0 * Math.cos(tilt) - z0 * Math.sin(tilt);
      const z = y0 * Math.sin(tilt) + z0 * Math.cos(tilt);
      return { x: cx + x0 * R, y: cy - y * R, z };
    };

    const line = (pts: { x: number; y: number; z: number }[], R: number) => {
      // Front of the globe bright, back faint
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1];
        const b = pts[i];
        const front = (a.z + b.z) / 2 > 0;
        ctx.strokeStyle = front ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.09)";
        ctx.lineWidth = (front ? 1.2 : 0.8) * (R / 200);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    };

    const chip = (text: string, x: number, y: number, depth: number, R: number) => {
      // depth: -1 (behind) .. 1 (in front)
      const scale = 0.72 + 0.28 * ((depth + 1) / 2);
      const fontSize = Math.round(Math.max(11 * dpr, 16 * scale * (R / 200)));
      ctx.font = `500 ${fontSize}px "Readex Pro", system-ui, sans-serif`;
      const w = ctx.measureText(text).width + fontSize * 1.5;
      const h = fontSize * 2;
      ctx.globalAlpha = depth > 0 ? 1 : 0.35 + 0.35 * (depth + 1);
      ctx.fillStyle = depth > 0 ? "#ffffff" : "rgba(255,255,255,0.85)";
      ctx.shadowColor = "rgba(10,20,40,0.35)";
      ctx.shadowBlur = depth > 0 ? 12 : 0;
      ctx.shadowOffsetY = depth > 0 ? 4 : 0;
      ctx.beginPath();
      ctx.roundRect(x - w / 2, y - h / 2, w, h, h / 2);
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.fillStyle = navy;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, x, y + 1);
      ctx.globalAlpha = 1;
    };

    const draw = () => {
      frame = requestAnimationFrame(draw);
      if (!visible) return;
      t += 1;

      if (!dragging) {
        // Ease back toward the slow default spin
        const base = reduceMotion ? 0 : 0.0025;
        velocity += (base - velocity) * 0.02;
      }
      rot += velocity;
      if (!reduceMotion) orbit += 0.0045;
      parallaxX += (targetPX - parallaxX) * 0.06;
      parallaxY += (targetPY - parallaxY) * 0.06;

      const W = size * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, W, W);
      const R = W * 0.25;
      const cx = W / 2 + parallaxX * W * 0.02;
      const cy = W / 2 + parallaxY * W * 0.02;

      // Orbit ring and chips: compute positions, split into behind / in front
      const ringPts: { x: number; y: number; z: number }[] = [];
      const ORX = R * 1.62;
      for (let i = 0; i <= 120; i++) {
        const a = (i / 120) * Math.PI * 2;
        ringPts.push({
          x: cx + Math.cos(a) * ORX,
          y: cy + Math.sin(a) * ORX * Math.sin(ORBIT_TILT) * 0.9,
          z: Math.sin(a),
        });
      }
      const chips = NAMES.map((name, i) => {
        const a = orbit + (i / NAMES.length) * Math.PI * 2;
        return {
          name,
          x: cx + Math.cos(a) * ORX,
          y: cy + Math.sin(a) * ORX * Math.sin(ORBIT_TILT) * 0.9 - R * 0.05,
          z: Math.sin(a),
        };
      });

      const ring = (front: boolean) => {
        ctx.strokeStyle = gold;
        ctx.lineWidth = (front ? 3 : 2) * (R / 200);
        ctx.globalAlpha = front ? 0.95 : 0.3;
        ctx.beginPath();
        let started = false;
        for (const p of ringPts) {
          if ((p.z > 0) === front) {
            if (!started) {
              ctx.moveTo(p.x, p.y);
              started = true;
            } else ctx.lineTo(p.x, p.y);
          } else started = false;
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      };

      // Behind the globe
      ring(false);
      chips.filter((c) => c.z <= 0).sort((a, b) => a.z - b.z).forEach((c) => chip(c.name, c.x, c.y, c.z, R));

      // Glow and sphere
      const glow = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.5);
      glow.addColorStop(0, "rgba(236,176,76,0.18)");
      glow.addColorStop(1, "rgba(236,176,76,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.5, 0, Math.PI * 2);
      ctx.fill();

      const sphere = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
      sphere.addColorStop(0, "#3a6fc0");
      sphere.addColorStop(0.55, blue);
      sphere.addColorStop(1, navy);
      ctx.fillStyle = sphere;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      // Grid
      for (let lat = -75; lat <= 75; lat += 15) {
        const pts = [];
        for (let lon = 0; lon <= 360; lon += 6) pts.push(project((lat * Math.PI) / 180, (lon * Math.PI) / 180, R, cx, cy));
        line(pts, R);
      }
      for (let lon = 0; lon < 360; lon += 20) {
        const pts = [];
        for (let lat = -90; lat <= 90; lat += 6) pts.push(project((lat * Math.PI) / 180, (lon * Math.PI) / 180, R, cx, cy));
        line(pts, R);
      }

      // Rim
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 1.5 * (R / 200);
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();

      // Jordan
      const j = project(JORDAN.lat, JORDAN.lon, R, cx, cy);
      if (j.z > 0) {
        const pulse = (t % 90) / 90;
        ctx.strokeStyle = gold;
        for (const offset of [0, 0.5]) {
          const p = (pulse + offset) % 1;
          ctx.globalAlpha = (1 - p) * j.z;
          ctx.lineWidth = 2 * (R / 200);
          ctx.beginPath();
          ctx.arc(j.x, j.y, (6 + p * 26) * (R / 200), 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.globalAlpha = Math.min(1, j.z * 1.4);
        ctx.fillStyle = gold;
        ctx.beginPath();
        ctx.arc(j.x, j.y, 6 * (R / 200), 0, Math.PI * 2);
        ctx.fill();
        ctx.font = `600 ${Math.round(13 * (R / 200))}px "Readex Pro", system-ui, sans-serif`;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(label, j.x + 12 * (R / 200), j.y - 12 * (R / 200));
        ctx.globalAlpha = 1;
      }

      // In front of the globe
      ring(true);
      chips.filter((c) => c.z > 0).sort((a, b) => a.z - b.z).forEach((c) => chip(c.name, c.x, c.y, c.z, R));
    };

    document.fonts?.ready.then(() => {}).catch(() => {});
    draw();

    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastT = performance.now();
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      targetPX = ((e.clientX - r.left) / r.width - 0.5) * 2;
      targetPY = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!dragging) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      const step = (dx / r.width) * Math.PI * 1.4;
      rot += step;
      velocity = step / Math.max(1, (now - lastT) / 16);
      lastX = e.clientX;
      lastT = now;
    };
    const onUp = () => (dragging = false);
    const onLeave = () => {
      targetPX = 0;
      targetPY = 0;
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [label]);

  return (
    <div className="relative w-full aspect-square">
      <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-pan-y" aria-hidden />
      <p className="absolute bottom-2 inset-x-0 text-center t-caption text-white/60 select-none">{hint}</p>
    </div>
  );
}

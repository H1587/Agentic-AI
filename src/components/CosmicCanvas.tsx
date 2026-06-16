/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { SimMode, Star, Galaxy } from '../types';
import { generateCatalogGalaxies } from '../data/galaxies';

interface CosmicCanvasProps {
  mode: SimMode;
  activeGalaxyId: number | null;
  onSecondsElapsed: (seconds: number) => void;
  whiteholeCountdown: number; // time left for Big Bang in seconds
}

const FOCAL_LENGTH = 350;     // 3D perspective focal length
const FOCUS_Z = 2.5;          // Focal plane for Depth of Field
const PASSIVE_MAX_STARS = 1500; // Stars in ambient mode
const ACTIVE_MAX_STARS = 2500;  // High performance limit for dense simulation

const STAR_PALETTES: { [key: string]: string[] } = {
  blue: ['186, 230, 253', '125, 211, 252', '56, 189, 248', '14, 165, 233'],
  pink: ['253, 164, 182', '244, 63, 94', '225, 29, 72', '254, 205, 211'],
  gold: ['254, 240, 138', '253, 224, 71', '234, 179, 8', '254, 215, 170'],
  purple: ['216, 180, 254', '192, 132, 252', '168, 85, 247', '233, 213, 255'],
  white: ['255, 255, 255', '241, 245, 249', '226, 232, 240', '203, 213, 225'],
};

export default function CosmicCanvas({
  mode,
  activeGalaxyId,
  onSecondsElapsed,
  whiteholeCountdown,
}: CosmicCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animation values kept in ref to preserve 60fps frame rates
  const stateRef = useRef({
    width: 800,
    height: 600,
    stars: [] as Star[],
    galaxies: [] as Galaxy[],
    mode: 'passive' as SimMode,
    modeStartTime: Date.now(),
    lastFrameTime: Date.now(),
    whiteholeBurstTriggered: false,
    activeGalaxyId: null as number | null,
    blackholeRotation: 0,
    spinSpeed: 0.05,
    whiteholeCountdown: 10,
    blastWaveRadius: 0,
    blastWaveAlpha: 0,
  });

  // Track state for canvas overlay timing indicators
  const [, setFrameTrigger] = useState(0);

  // Initialize background star clusters
  const initSimulation = () => {
    const list = generateCatalogGalaxies();
    stateRef.current.galaxies = list;

    // Build immediate visual stars representing the cluster system
    const stars: Star[] = [];
    let starIdCounter = 0;

    // Place stars across 35 of the dense center galaxies to avoid CPU bottleneck while looking dense
    const denseGalaxyCount = 35;
    const themes = ['blue', 'pink', 'gold', 'purple', 'white'];

    for (let i = 0; i < denseGalaxyCount; i++) {
      const g = list[i];
      const starsInGalaxy = 40 + (i % 5) * 10;
      const palette = STAR_PALETTES[g.colorTheme] || STAR_PALETTES.blue;

      for (let j = 0; j < starsInGalaxy; j++) {
        const distRatio = Math.pow(Math.random(), 1.5);
        const distance = distRatio * g.radius;
        const armIndex = j % g.arms;
        const armAngleBase = (armIndex * 2 * Math.PI) / g.arms;
        const winding = distRatio * Math.PI * 3.5;
        const scatter = (Math.random() - 0.5) * 0.3;
        const angle = armAngleBase + winding + scatter;

        stars.push({
          id: starIdCounter++,
          x: g.cx + distance * Math.cos(angle),
          y: g.cy + distance * Math.sin(angle) * 0.5,
          z: g.cz + (Math.random() - 0.5) * 0.3,
          size: 0.6 + Math.random() * 1.5,
          color: palette[Math.floor(Math.random() * palette.length)],
          alpha: 0.4 + Math.random() * 0.6,
          vx: 0,
          vy: 0,
          angle: angle,
          distance: distance,
          galaxyId: g.id,
          angularSpeed: (0.003 + (1 - distRatio) * 0.012) * (g.rotationSpeed > 0 ? 1 : -1),
        });
      }
    }

    // Fill the rest with ambient background stars
    const backgroundCount = PASSIVE_MAX_STARS - stars.length;
    for (let i = 0; i < backgroundCount; i++) {
      stars.push({
        id: starIdCounter++,
        x: (Math.random() - 0.5) * 1600,
        y: (Math.random() - 0.5) * 1100,
        z: 1.0 + Math.random() * 8.0,
        size: 0.4 + Math.random() * 1.3,
        color: '255, 255, 255',
        alpha: 0.2 + Math.random() * 0.6,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.15,
        angle: 0,
        distance: 0,
        angularSpeed: 0,
      });
    }

    stateRef.current.stars = stars;
  };

  // Sync parameters
  useEffect(() => {
    stateRef.current.mode = mode;
    stateRef.current.activeGalaxyId = activeGalaxyId;
    stateRef.current.modeStartTime = Date.now();
    stateRef.current.whiteholeCountdown = whiteholeCountdown;

    if (mode === 'blackhole') {
      // Re-seed all stars to build a high-density spiral layout pulled inwards
      const stars: Star[] = [];
      let starIdCounter = 0;
      const list = stateRef.current.galaxies;

      // Populate stars on all 110 galaxies to show a massive global vacuum collapse!
      list.forEach((g) => {
        // Less stars per galaxy to keep frames fast but show beautiful dense cluster distribution
        const starsInGalaxy = 18;
        const palette = STAR_PALETTES[g.colorTheme] || STAR_PALETTES.blue;

        for (let j = 0; j < starsInGalaxy; j++) {
          const distRatio = Math.pow(Math.random(), 1.2);
          const distance = distRatio * g.radius;
          const angle = Math.random() * Math.PI * 2;

          stars.push({
            id: starIdCounter++,
            // Distribute widely in cosmological outer space
            x: g.cx + distance * Math.cos(angle),
            y: g.cy + distance * Math.sin(angle) * 0.6,
            z: g.cz + (Math.random() - 0.5) * 0.5,
            size: 0.8 + Math.random() * 1.8,
            color: palette[Math.floor(Math.random() * palette.length)],
            alpha: 0.5 + Math.random() * 0.5,
            vx: 0,
            vy: 0,
            angle,
            distance,
            galaxyId: g.id,
            angularSpeed: 0.005,
          });
        }
      });

      // Add a dense stream of 600 central gravity feeding stars
      for (let i = 0; i < 600; i++) {
        const randAngle = Math.random() * Math.PI * 2;
        const randDist = 180 + Math.random() * 450;
        stars.push({
          id: starIdCounter++,
          x: randDist * Math.cos(randAngle),
          y: randDist * Math.sin(randAngle) * 0.8,
          z: 1.0 + Math.random() * 6.0,
          size: 0.6 + Math.random() * 1.4,
          color: '255, 255, 255',
          alpha: 0.4 + Math.random() * 0.6,
          vx: 0,
          vy: 0,
          angle: randAngle,
          distance: randDist,
          angularSpeed: 0.015,
        });
      }

      stateRef.current.stars = stars;
    } else if (mode === 'whitehole') {
      stateRef.current.whiteholeBurstTriggered = false;
      stateRef.current.blackholeRotation = 0;
      stateRef.current.spinSpeed = 0.05;
      stateRef.current.blastWaveRadius = 0;
      stateRef.current.blastWaveAlpha = 0;

      // Compress all stars to a highly dense central singularity point before detor
      stateRef.current.stars.forEach((star) => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 7 + Math.random() * 48; // Fast expansion speed index
        star.x = (Math.random() - 0.5) * 6;
        star.y = (Math.random() - 0.5) * 6;
        star.z = 1.0 + Math.random() * 6.0;
        star.vx = speed * Math.cos(angle);
        star.vy = speed * Math.sin(angle);
        star.alpha = 1.0;
      });
    } else if (mode === 'passive') {
      initSimulation();
    }
  }, [mode, activeGalaxyId, whiteholeCountdown]);

  // Handle Resize Observation
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      
      stateRef.current.width = width;
      stateRef.current.height = height;

      const canvas = canvasRef.current;
      if (canvas) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.scale(dpr, dpr);
        }
      }
    });

    observer.observe(containerRef.current);
    initSimulation();

    return () => {
      observer.disconnect();
    };
  }, []);

  // Main high performance 60fps canvas loop
  useEffect(() => {
    let animationId: number;

    const render = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) {
        animationId = requestAnimationFrame(render);
        return;
      }

      const { width, height } = stateRef.current;
      const m = stateRef.current.mode;
      const elapsed = (Date.now() - stateRef.current.modeStartTime) / 1000;
      
      // Dispatch time elapsed to parent layout dynamically
      onSecondsElapsed(elapsed);

      // Clean background dynamically based on simulation mode
      if (m === 'whitehole') {
        ctx.fillStyle = '#FFFFFF';
      } else {
        ctx.fillStyle = '#020205';
      }
      ctx.fillRect(0, 0, width, height);

      // Setup projection coordinates
      const cx = width / 2;
      const cy = height / 2;

      // Update galaxy core tracking
      stateRef.current.galaxies.forEach((g) => {
        if (m === 'passive') {
          g.rotation += g.rotationSpeed;
          g.cx += Math.sin(Date.now() * 0.0001 + g.id) * 0.04;
          g.cy += Math.cos(Date.now() * 0.00008 + g.id) * 0.03;
        } else if (m === 'blackhole') {
          // Galaxies draft slowly toward central singularity
          const dist = Math.sqrt(g.cx * g.cx + g.cy * g.cy);
          if (dist > 8) {
            const pullVal = (1.5 / Math.max(1, dist * 0.01)) * (1 + elapsed * 0.05);
            const angleVal = Math.atan2(g.cy, g.cx) + 0.005;
            g.cx = (dist - pullVal) * Math.cos(angleVal);
            g.cy = (dist - pullVal) * Math.sin(angleVal);
          }
        }
      });

      // Painter's algorithm depth sorting
      const sortedStars = [...stateRef.current.stars].sort((a, b) => b.z - a.z);

      sortedStars.forEach((star) => {
        let relativeX = star.x;
        let relativeY = star.y;

        if (m === 'passive') {
          if (star.galaxyId === undefined) {
            star.x += star.vx;
            if (star.x > 900) star.x = -900;
            if (star.x < -900) star.x = 900;
            star.y += star.vy;
            if (star.y > 700) star.y = -700;
            if (star.y < -700) star.y = 700;
          } else {
            const g = stateRef.current.galaxies[star.galaxyId];
            star.angle += star.angularSpeed;

            const rx = star.distance * Math.cos(star.angle);
            const ry = star.distance * Math.sin(star.angle) * 0.5;

            relativeX = g.cx + rx;
            relativeY = g.cy + ry;

            star.x = relativeX;
            star.y = relativeY;
          }
        } 
        else if (m === 'blackhole') {
          // MATHEMATICAL GALAXY DISTORTION / SPAGHETTIFICATION ENGINE
          const dist = Math.sqrt(star.x * star.x + star.y * star.y);
          
          if (dist > 5) {
            // Stars are sucked in spirally with higher speeds closer to the Schwarzschild radius
            const pullForce = (280 / Math.max(10, dist)) * (1 + elapsed * 0.03);
            const currentAngle = Math.atan2(star.y, star.x);
            // Twisting warp angular rotation
            const spinForce = (2.2 / Math.max(5, dist * 0.1)) * (1 + elapsed * 0.02);

            const newRadius = Math.max(0.5, dist - pullForce);
            const newAngle = currentAngle + spinForce;

            // Preserve old scale projection for visual length stretching
            const scaleOld = FOCAL_LENGTH / star.z;
            const pxOld = cx + star.x * scaleOld;
            const pyOld = cy + star.y * scaleOld;

            // Update physical coordinates
            star.x = newRadius * Math.cos(newAngle);
            star.y = newRadius * Math.sin(newAngle);

            const scaleNew = FOCAL_LENGTH / star.z;
            const pxNew = cx + star.x * scaleNew;
            const pyNew = cy + star.y * scaleNew;

            // Draw beautiful spaghettified distortion lines stretching into singularity
            if (pxNew >= 0 && pxNew <= width && pyNew >= 0 && pyNew <= height) {
              const alphaOut = Math.min(1, star.alpha * (dist / 140)); // fade closer to maw
              
              ctx.beginPath();
              ctx.strokeStyle = `rgba(${star.color}, ${alphaOut * 0.75})`;
              ctx.lineWidth = Math.max(0.5, Math.min(2.0, (star.size * scaleNew) * 0.015));
              ctx.lineCap = 'round';
              ctx.moveTo(pxOld, pyOld);
              ctx.lineTo(pxNew, pyNew);
              ctx.stroke();
            }
            return; // skip standard bubble point drawing
          } else {
            // Infinite feed loop: once swallowed, recycle star back to the galaxy edge borders
            const randAngle = Math.random() * Math.PI * 2;
            const randDist = 800 + Math.random() * 600;
            star.x = randDist * Math.cos(randAngle);
            star.y = randDist * Math.sin(randAngle);
            star.alpha = 0.5 + Math.random() * 0.5;
            return;
          }
        } 
        else if (m === 'whitehole') {
          // If Big Bang is triggered (countdown reaches 0)
          if (stateRef.current.whiteholeCountdown <= 0) {
            star.x += star.vx;
            star.y += star.vy;
            
            // Cosmological acceleration dragging damping outward
            star.vx *= 0.965;
            star.vy *= 0.965;

            // Swirl slowly during inflation drift
            const dist = Math.sqrt(star.x * star.x + star.y * star.y);
            if (dist > 5) {
              const rotAngle = Math.atan2(star.y, star.x) + 0.003;
              star.x = dist * Math.cos(rotAngle);
              star.y = dist * Math.sin(rotAngle);
            }
          }
        }

        // Draw normal starlights projection (passive/whitehole after explosion)
        const scale = FOCAL_LENGTH / star.z;
        const screenX = cx + relativeX * scale;
        const screenY = cy + relativeY * scale;

        if (screenX >= -20 && screenX <= width + 20 && screenY >= -20 && screenY <= height + 20) {
          const dZ = Math.abs(star.z - FOCUS_Z);
          const blur = dZ * 1.5;

          if (m === 'whitehole') {
            // "reduce the stardust's radius limit to 1/10 mm, miscrscopic pinpoints"
            const radius = 0.35; 
            
            // "make them grey fading to white"
            const dist = Math.sqrt(star.x * star.x + star.y * star.y);
            const fade = Math.min(1.0, dist / 850); 
            const greyChan = Math.floor(100 + fade * 155); // 100 deep grey -> 255 pure white
            
            ctx.fillStyle = `rgba(${greyChan}, ${greyChan}, ${greyChan}, ${star.alpha})`;
            ctx.beginPath();
            ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
            ctx.fill();
          } else if (blur > 0.8 && m === 'passive') {
            // Outer depth of field bokeh circles in ambient state (beautiful, soft, capped)
            const radius = Math.min(10.0, Math.max(0.6, star.size * scale * 0.08) * (1.0 + blur * 0.5));
            ctx.fillStyle = `rgba(${star.color}, ${star.alpha * 0.35})`;
            ctx.beginPath();
            ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Focused brilliant pinpoint starlights (ensures crisp, clean, microscopic particles)
            const radius = Math.min(3.0, Math.max(0.4, star.size * scale * 0.035));
            ctx.fillStyle = `rgba(${star.color}, ${star.alpha})`;
            ctx.beginPath();
            ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      // Highlight active selected galaxy in filter menu if any
      if (activeGalaxyId !== null && m === 'blackhole') {
        const targetG = stateRef.current.galaxies[activeGalaxyId];
        if (targetG) {
          const scale = FOCAL_LENGTH / targetG.cz;
          const screenX = cx + targetG.cx * scale;
          const screenY = cy + targetG.cy * scale;

          // Drawing reticle overlay around targeted galaxy being consumed
          ctx.strokeStyle = 'rgba(251, 146, 60, 0.45)';
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.arc(screenX, screenY, targetG.radius * 0.65, 0, Math.PI * 2);
          ctx.stroke();

          // Reticle markings
          ctx.fillStyle = 'rgba(251, 146, 60, 0.8)';
          ctx.font = '9px monospace';
          ctx.fillText(`TARGET: ${targetG.name}`, screenX + 15, screenY - 15);
          
          // Draw targeting lines
          ctx.strokeStyle = 'rgba(251, 146, 60, 0.7)';
          ctx.beginPath();
          ctx.moveTo(screenX - 10, screenY);
          ctx.lineTo(screenX + 10, screenY);
          ctx.moveTo(screenX, screenY - 10);
          ctx.lineTo(screenX, screenY + 10);
          ctx.stroke();
        }
      }

      // ==========================================
      // BLACKHOLE ACCRETION DISK INTEGRATION (INFINITE)
      // ==========================================
      if (m === 'blackhole') {
        const horizonRadius = 45 + Math.sin(Date.now() * 0.005) * 3;

        // Einstein Gravitational Lensing accretion ring
        const outerRing = horizonRadius * (2.8 + Math.sin(Date.now() * 0.01) * 0.08);
        const lnsGrad = ctx.createRadialGradient(cx, cy, horizonRadius, cx, cy, outerRing);
        lnsGrad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
        lnsGrad.addColorStop(0.12, 'rgba(251, 146, 60, 0.8)');
        lnsGrad.addColorStop(0.45, 'rgba(124, 58, 237, 0.35)'); // vibrant purple lensing light
        lnsGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

        ctx.save();
        ctx.shadowBlur = 45;
        ctx.shadowColor = 'rgba(251, 146, 60, 0.6)';
        ctx.beginPath();
        ctx.arc(cx, cy, outerRing, 0, Math.PI * 2);
        ctx.fillStyle = lnsGrad;
        ctx.fill();
        ctx.restore();

        // Schwarzschild Pitch Black core Singularity
        ctx.beginPath();
        ctx.arc(cx, cy, horizonRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#010103';
        ctx.fill();

        ctx.strokeStyle = 'rgba(251, 146, 60, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // ==========================================
      // WHITEHOLE: COUNTDOWN & ROTATING CORE / AXIS
      // ==========================================
      if (m === 'whitehole') {
        const countdownVal = stateRef.current.whiteholeCountdown;

        if (countdownVal > 0) {
          // 1. Black hole is rotating intensely on its axis at the center
          stateRef.current.spinSpeed = 0.05 + ((10 - countdownVal) * 0.055); // accelerate rotation speed as time contracts
          stateRef.current.blackholeRotation += stateRef.current.spinSpeed;

          // Reduced singularity core size by 60% (base 15px instead of 38px)
          const rRadius = 15 + Math.sin(Date.now() * 0.04) * 0.8;
          
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(stateRef.current.blackholeRotation);

          // Render rotating dense concentric circles in grayscale with 30% transparency
          ctx.strokeStyle = 'rgba(210, 210, 210, 0.3)';
          for (let r = rRadius * 1.5; r < rRadius * 5.0; r += 4.5) {
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            // Multi-frequency dashes to create dense celestial texture
            ctx.setLineDash([20 + (r % 7) * 3, 10 + (r % 5) * 2]);
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
          ctx.setLineDash([]); // Reset line dashes

          // Draw Schwarzschild black circular core (60% smaller)
          ctx.beginPath();
          ctx.arc(0, 0, rRadius, 0, Math.PI * 2);
          ctx.fillStyle = '#000000';
          ctx.fill();

          ctx.strokeStyle = '#333333';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.restore();

          // Removed all on-canvas countdown text to completely eliminate overlapping layout with HTML timer clock
        } else {
          // COUNTDOWN REACHED: COSMICAL BURST OUTWARD
          if (!stateRef.current.whiteholeBurstTriggered) {
            stateRef.current.whiteholeBurstTriggered = true;
            stateRef.current.blastWaveRadius = 20;
            stateRef.current.blastWaveAlpha = 1.0;
          }

          // Expand energy shockwaves
          stateRef.current.blastWaveRadius += 28;
          stateRef.current.blastWaveAlpha = Math.max(0, 1 - (elapsed - 10) / 2.5);

          if (stateRef.current.blastWaveAlpha > 0) {
            ctx.save();
            ctx.strokeStyle = `rgba(120, 120, 120, ${stateRef.current.blastWaveAlpha * 0.4})`;
            ctx.lineWidth = 6;
            ctx.shadowBlur = 15;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
            ctx.beginPath();
            ctx.arc(cx, cy, stateRef.current.blastWaveRadius, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = `rgba(50, 50, 50, ${stateRef.current.blastWaveAlpha * 0.7})`;
            ctx.lineWidth = 2.0;
            ctx.beginPath();
            ctx.arc(cx, cy, stateRef.current.blastWaveRadius * 0.95, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }

          // Gentle central star birth grey flash dissipation
          const flashFade = Math.max(0, 1 - (elapsed - 10) / 1.5);
          if (flashFade > 0) {
            ctx.fillStyle = `rgba(180, 180, 180, ${flashFade * 0.8})`;
            ctx.fillRect(0, 0, width, height);
          }
        }
      }

      // Continuous trigger update
      setFrameTrigger(prev => (prev + 1) % 100);
      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [mode, activeGalaxyId, onSecondsElapsed]);

  return (
    <div ref={containerRef} className={`w-full h-full absolute inset-0 transition-colors duration-1000 ${mode === 'whitehole' ? 'bg-white' : 'bg-[#020205]'} overflow-hidden select-none z-0`}>
      <canvas ref={canvasRef} id="cosmic-sim-canvas" className="block w-full h-full pointer-events-none" />
    </div>
  );
}

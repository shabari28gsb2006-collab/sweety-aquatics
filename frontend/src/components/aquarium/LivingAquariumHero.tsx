import React, { useEffect, useRef } from 'react';
import { ShieldCheck, HeartHandshake, PackageCheck, Headphones, ArrowRight } from 'lucide-react';

interface LivingAquariumHeroProps {
  onExploreGuppies: () => void;
  onShopFishFood: () => void;
}

interface AutonomousFish {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  colorType: 'blue' | 'red' | 'gold' | 'black';
  tailPhase: number;
  tailSpeed: number;
  depth: number;
  targetY: number;
  facing: number; // 1 or -1
}

interface Bubble {
  x: number;
  y: number;
  radius: number;
  vy: number;
  drift: number;
  alpha: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

export const LivingAquariumHero: React.FC<LivingAquariumHeroProps> = ({
  onExploreGuppies,
  onShopFishFood,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Media Queries for Motion and Touch capabilities
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = motionQuery.matches;

    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
    };
    motionQuery.addEventListener('change', handleMotionChange);

    const isTouchDevice = () => {
      return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(hover: none) and (pointer: coarse)').matches
      );
    };
    let isMobile = isTouchDevice();

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      width = rect.width;
      height = rect.height || 650;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      isMobile = isTouchDevice() || width < 768;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // ==========================================
    // PRIMARY HERO GUPPY (Realistic Physics)
    // ==========================================
    const primaryFish = {
      x: width * 0.65,
      y: height * 0.45,
      vx: 0,
      vy: 0,
      speed: 0,
      angle: 0,
      pitch: 0,
      scaleX: 1, // Smooth horizontal 3D turning (-1 to 1)
      targetScaleX: 1,
      tailPhase: 0,
      tailWaveFreq: 0.14,
      tailAmp: 0.35,

      // Desktop Pointer Tracking State
      hasPointerTarget: false,
      pointerX: width * 0.65,
      pointerY: height * 0.45,
      lastPointerTime: 0,

      // Autonomous Mobile & Idle Wandering State
      wanderAngle: Math.random() * Math.PI * 2,
      wanderT: Math.random() * 100,
      orbitOffsetAngle: Math.random() * Math.PI * 2,
      curvedPhase: Math.random() * Math.PI * 2,
    };

    // Color palettes for varieties
    const palettes = {
      heroRedDragon: {
        body1: '#EE3344',
        body2: '#8E101A',
        fin: '#FF6B6B',
        tail: '#FFA07A',
        tailEdge: 'rgba(255, 230, 200, 0.75)',
        shimmer: 'rgba(255, 255, 255, 0.6)',
      },
      blue: {
        body1: '#1495D1',
        body2: '#04283D',
        fin: '#50D4EE',
        tail: '#80E8FF',
        tailEdge: 'rgba(180, 240, 255, 0.7)',
        shimmer: 'rgba(130, 235, 255, 0.5)',
      },
      red: {
        body1: '#E63946',
        body2: '#701418',
        fin: '#F4A261',
        tail: '#E76F51',
        tailEdge: 'rgba(255, 190, 160, 0.65)',
        shimmer: 'rgba(255, 220, 200, 0.45)',
      },
      gold: {
        body1: '#F4A261',
        body2: '#B85D19',
        fin: '#FFE082',
        tail: '#FFF59D',
        tailEdge: 'rgba(255, 250, 210, 0.75)',
        shimmer: 'rgba(255, 255, 220, 0.6)',
      },
      black: {
        body1: '#263445',
        body2: '#0D1520',
        fin: '#64748B',
        tail: '#94A3B8',
        tailEdge: 'rgba(203, 213, 225, 0.6)',
        shimmer: 'rgba(148, 163, 184, 0.4)',
      },
    };

    // ==========================================
    // AUTONOMOUS SECONDARY GUPPIES
    // ==========================================
    const secondaryFishes: AutonomousFish[] = [
      {
        x: width * 0.18,
        y: height * 0.28,
        vx: 1.1,
        vy: 0.1,
        size: 0.58,
        colorType: 'blue',
        tailPhase: Math.random() * Math.PI,
        tailSpeed: 0.13,
        depth: 0.75,
        targetY: height * 0.28,
        facing: 1,
      },
      {
        x: width * 0.82,
        y: height * 0.32,
        vx: -0.95,
        vy: -0.1,
        size: 0.46,
        colorType: 'red',
        tailPhase: Math.random() * Math.PI,
        tailSpeed: 0.15,
        depth: 0.5,
        targetY: height * 0.32,
        facing: -1,
      },
      {
        x: width * 0.38,
        y: height * 0.72,
        vx: 1.25,
        vy: 0.12,
        size: 0.62,
        colorType: 'gold',
        tailPhase: Math.random() * Math.PI,
        tailSpeed: 0.14,
        depth: 0.85,
        targetY: height * 0.72,
        facing: 1,
      },
      {
        x: width * 0.12,
        y: height * 0.62,
        vx: -0.85,
        vy: -0.08,
        size: 0.5,
        colorType: 'black',
        tailPhase: Math.random() * Math.PI,
        tailSpeed: 0.12,
        depth: 0.6,
        targetY: height * 0.62,
        facing: -1,
      },
    ];

    // Bubbles
    const bubbles: Bubble[] = Array.from({ length: 30 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 1.2 + Math.random() * 3.2,
      vy: 0.5 + Math.random() * 1.1,
      drift: (Math.random() - 0.5) * 0.3,
      alpha: 0.15 + Math.random() * 0.35,
    }));

    // Ripples
    const ripples: Ripple[] = [];

    // ==========================================
    // POINTER & TOUCH LISTENERS
    // ==========================================
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      if (clientX >= 0 && clientX <= width && clientY >= 0 && clientY <= height) {
        primaryFish.pointerX = clientX;
        primaryFish.pointerY = clientY;
        primaryFish.hasPointerTarget = true;
        primaryFish.lastPointerTime = performance.now();

        const px = (clientX / Math.max(width, 1) - 0.5) * 18;
        const py = (clientY / Math.max(height, 1) - 0.5) * 12;
        containerRef.current?.style.setProperty('--hero-parallax-x', `${px}px`);
        containerRef.current?.style.setProperty('--hero-parallax-y', `${py}px`);
      }
    };

    const handleMouseLeave = () => {
      primaryFish.hasPointerTarget = false;
      containerRef.current?.style.setProperty('--hero-parallax-x', '0px');
      containerRef.current?.style.setProperty('--hero-parallax-y', '0px');
    };

    let lastTouchRipple = 0;
    const handleTouch = (e: TouchEvent, ripple = false) => {
      const rect = canvas.getBoundingClientRect();
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const tx = touch.clientX - rect.left;
        const ty = touch.clientY - rect.top;

        // On mobile, touching generates a gentle water ripple and piques the guppy's curiosity
        if (ripple && performance.now() - lastTouchRipple > 120) {
          ripples.push({ x: tx, y: ty, radius: 4, maxRadius: 60, alpha: 0.7 });
          lastTouchRipple = performance.now();
        }

        primaryFish.pointerX = tx;
        primaryFish.pointerY = ty;
        primaryFish.hasPointerTarget = true;
        primaryFish.lastPointerTime = performance.now();

      }
    };
    const handleTouchStart = (e: TouchEvent) => handleTouch(e, true);
    const handleTouchMove = (e: TouchEvent) => handleTouch(e, false);
    const handleTouchEnd = () => { primaryFish.lastPointerTime = performance.now(); };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove, { passive: true });
      container.addEventListener('mouseleave', handleMouseLeave);
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchmove', handleTouchMove, { passive: true });
      container.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    // ==========================================
    // FLUID DELTA-TAIL GUPPY RENDER PROCEDURE
    // ==========================================
    const drawGuppy = (
      x: number,
      y: number,
      pitchAngle: number,
      scaleX: number,
      scaleY: number,
      tailPhase: number,
      tailAmplitude: number,
      palette: typeof palettes.heroRedDragon,
      depthFactor: number = 1
    ) => {
      ctx.save();
      ctx.translate(x, y);

      // Smooth horizontal turn using scaleX (3D turn simulation without flips)
      ctx.scale(scaleX * scaleY, scaleY);
      ctx.rotate(scaleX >= 0 ? pitchAngle : -pitchAngle);

      // Tail multi-wave kinematics: peduncle sway + flaring trailing fin wave
      const peduncleSway = Math.sin(tailPhase) * tailAmplitude * 0.75;
      const finFlareSway = Math.sin(tailPhase - 0.75) * tailAmplitude * 1.25;

      // Caudal Fin (Big flowing Delta Tail)
      ctx.save();
      ctx.translate(-24, 0);
      ctx.rotate(peduncleSway);

      // Tail gradient
      const tailGrad = ctx.createLinearGradient(-58, -28, 0, 0);
      tailGrad.addColorStop(0, palette.tailEdge);
      tailGrad.addColorStop(0.25, palette.tail);
      tailGrad.addColorStop(0.7, palette.fin);
      tailGrad.addColorStop(1, palette.body2);

      ctx.fillStyle = tailGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);

      // Multi-curve delta fan tail with undulating wave contour
      const waveTipOffset = finFlareSway * 18;
      ctx.bezierCurveTo(-22, -26 + waveTipOffset * 0.3, -50, -42 + waveTipOffset * 0.8, -72, -30 + waveTipOffset);
      ctx.bezierCurveTo(-68, -10 + waveTipOffset * 0.5, -68, 10 - waveTipOffset * 0.5, -72, 30 - waveTipOffset);
      ctx.bezierCurveTo(-50, 42 - waveTipOffset * 0.8, -22, 26 - waveTipOffset * 0.3, 0, 0);
      ctx.closePath();
      ctx.fill();

      // Delicate Tail fin ray striations
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.38)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-64, -22 + waveTipOffset * 0.7);
      ctx.moveTo(0, 0);
      ctx.lineTo(-68, -8 + waveTipOffset * 0.3);
      ctx.moveTo(0, 0);
      ctx.lineTo(-68, 8 - waveTipOffset * 0.3);
      ctx.moveTo(0, 0);
      ctx.lineTo(-64, 22 - waveTipOffset * 0.7);
      ctx.stroke();

      // Natural-looking tail spotting / mosaic flecks.
      ctx.save();
      ctx.globalAlpha = 0.42 * depthFactor;
      ctx.fillStyle = palette.body2;
      [[-34,-15,2.2],[-48,-5,1.7],[-38,9,2],[-57,15,1.4],[-54,-20,1.5]].forEach(([sx, sy, sr]) => {
        ctx.beginPath();
        ctx.arc(sx as number, sy as number, sr as number, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      ctx.restore();

      // Dorsal Fin (Top flowing crest)
      ctx.save();
      ctx.translate(-8, -9);
      ctx.rotate(peduncleSway * 0.45);
      ctx.fillStyle = palette.fin;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-16, -26, -36, -20);
      ctx.quadraticCurveTo(-22, -6, -6, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Main Torso / Body (Hydrodynamic teardrop with iridescent shine)
      const bodyGrad = ctx.createLinearGradient(-26, 0, 26, 0);
      bodyGrad.addColorStop(0, palette.body2);
      bodyGrad.addColorStop(0.35, palette.body1);
      bodyGrad.addColorStop(0.85, '#FFFFFF');
      bodyGrad.addColorStop(1, '#E8F9FC');

      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.moveTo(26, 0);
      ctx.bezierCurveTo(24, -10, 5, -13, -12, -8);
      ctx.bezierCurveTo(-20, -5, -26, -2, -26, 0);
      ctx.bezierCurveTo(-26, 2, -20, 5, -12, 8);
      ctx.bezierCurveTo(5, 13, 24, 10, 26, 0);
      ctx.closePath();
      ctx.fill();

      // Fine scale texture: small reflective arcs make the silhouette feel less illustrated.
      ctx.save();
      ctx.globalAlpha = 0.24 * depthFactor;
      ctx.strokeStyle = 'rgba(255,255,255,0.62)';
      ctx.lineWidth = 0.65;
      for (let row = -1; row <= 1; row++) {
        for (let col = -2; col <= 2; col++) {
          const sx = col * 7 - (row % 2) * 3;
          const sy = row * 5;
          ctx.beginPath();
          ctx.arc(sx, sy, 3.4, 0.1, Math.PI - 0.1);
          ctx.stroke();
        }
      }
      ctx.restore();

      // Gill plate and lateral line details.
      ctx.save();
      ctx.strokeStyle = 'rgba(2,30,49,0.38)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.arc(11, 0, 7.2, -0.9, 0.9);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.34)';
      ctx.beginPath();
      ctx.moveTo(-15, 1.5);
      ctx.quadraticCurveTo(0, 3.5, 13, 1);
      ctx.stroke();
      ctx.restore();

      // Body dorsal highlight / metallic shimmer
      ctx.fillStyle = palette.shimmer;
      ctx.beginPath();
      ctx.ellipse(3, -3, 14, 3.5, -0.08, 0, Math.PI * 2);
      ctx.fill();

      // Pectoral Fin flutter
      ctx.save();
      ctx.translate(6, 4);
      ctx.rotate(Math.cos(tailPhase * 1.6) * 0.3);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 7.5, 3.2, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Eye
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(17, -3, 3.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#021E31';
      ctx.beginPath();
      ctx.arc(18, -3, 2.1, 0, Math.PI * 2);
      ctx.fill();

      // Eye glimmer
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(17.5, -3.8, 0.85, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // ==========================================
    // ANIMATION LOOP (Delta-time & Performance)
    // ==========================================
    let lastTime = performance.now();
    let tick = 0;

    const render = (currentTime: number) => {
      const dtMs = currentTime - lastTime;
      lastTime = currentTime;
      // Cap delta time to prevent giant physics jumps on tab backgrounding
      const dt = Math.min(dtMs / 1000, 0.05);

      const motionSpeedFactor = prefersReducedMotion ? 0.3 : 1.0;
      tick += dt * 60 * motionSpeedFactor;

      // 1. CLEAR & DRAW BACKGROUND WATER ENVIRONMENT
      ctx.clearRect(0, 0, width, height);

      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      // Transparent water wash keeps the real aquarium photograph visible underneath.
      bgGrad.addColorStop(0, 'rgba(2, 30, 49, 0.56)');
      bgGrad.addColorStop(0.35, 'rgba(3, 43, 66, 0.40)');
      bgGrad.addColorStop(0.7, 'rgba(6, 68, 99, 0.24)');
      bgGrad.addColorStop(1, 'rgba(8, 117, 181, 0.20)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Underwater subtle light rays / caustics
      if (!prefersReducedMotion) {
        ctx.save();
        ctx.globalAlpha = 0.075;
        for (let i = 0; i < 4; i++) {
          const xOffset = (width / 4) * i + Math.sin(tick * 0.008 + i * 1.5) * 50;
          const rayGrad = ctx.createLinearGradient(xOffset, 0, xOffset + 110, height);
          rayGrad.addColorStop(0, '#50D4EE');
          rayGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = rayGrad;
          ctx.beginPath();
          ctx.moveTo(xOffset - 35, 0);
          ctx.lineTo(xOffset + 85, 0);
          ctx.lineTo(xOffset + 220, height);
          ctx.lineTo(xOffset + 15, height);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      // Background scenery aquatic plants swaying softly
      ctx.save();
      ctx.fillStyle = 'rgba(2, 30, 49, 0.44)';
      const plantSpacing = 75;
      for (let j = 0; j < width + plantSpacing; j += plantSpacing) {
        const sway = Math.sin(tick * 0.02 + j * 0.1) * (prefersReducedMotion ? 2 : 7);
        ctx.beginPath();
        ctx.moveTo(j - 8, height);
        ctx.bezierCurveTo(j + 5 + sway, height - 45, j + 28 + sway, height - 105, j + 8 + sway, height - 170);
        ctx.bezierCurveTo(j - 4 + sway, height - 122, j - 18 + sway, height - 58, j - 8, height);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // 2. RIPPLES
      for (let r = ripples.length - 1; r >= 0; r--) {
        const rip = ripples[r];
        rip.radius += 2.0 * motionSpeedFactor;
        rip.alpha *= 0.94;
        ctx.save();
        ctx.strokeStyle = `rgba(80, 212, 238, ${rip.alpha})`;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        if (rip.alpha < 0.02) {
          ripples.splice(r, 1);
        }
      }

      // 3. FLOATING BUBBLES
      bubbles.forEach((b) => {
        b.y -= b.vy * motionSpeedFactor;
        b.x += Math.sin(tick * 0.02 + b.y * 0.05) * 0.35 * motionSpeedFactor;
        if (b.y < -12) {
          b.y = height + 12;
          b.x = Math.random() * width;
        }

        ctx.save();
        ctx.fillStyle = `rgba(232, 249, 252, ${b.alpha})`;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.beginPath();
        ctx.arc(b.x - b.radius * 0.35, b.y - b.radius * 0.35, b.radius * 0.28, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      const pointerAge = currentTime - primaryFish.lastPointerTime;
      const schoolFollowing = primaryFish.hasPointerTarget && pointerAge < (isMobile ? 2200 : 4000);

      // 4. SECONDARY GUPPIES form a gentle school around cursor or finger.
      secondaryFishes.forEach((fish) => {
        if (schoolFollowing) {
          const index = secondaryFishes.indexOf(fish);
          const formationAngle = tick * 0.012 + index * (Math.PI * 2 / secondaryFishes.length);
          const formationRadius = (isMobile ? 72 : 100) + index * 13;
          const targetX = primaryFish.pointerX + Math.cos(formationAngle) * formationRadius;
          const targetY = primaryFish.pointerY + Math.sin(formationAngle * 1.2) * formationRadius * 0.55;
          fish.vx += (targetX - fish.x) * (isMobile ? 0.0028 : 0.0022) * motionSpeedFactor;
          fish.vy += (targetY - fish.y) * (isMobile ? 0.0028 : 0.0022) * motionSpeedFactor;
          const schoolSpeed = Math.hypot(fish.vx, fish.vy);
          const cap = isMobile ? 2.4 : 2.8;
          if (schoolSpeed > cap) { fish.vx = fish.vx / schoolSpeed * cap; fish.vy = fish.vy / schoolSpeed * cap; }
        } else {
          fish.vy += (Math.sin(tick * 0.025 + fish.x * 0.008) * 0.45 - fish.vy) * 0.08;
          const cruise = fish.facing * (0.72 + fish.depth * 0.48);
          fish.vx += (cruise - fish.vx) * 0.025;
        }
        fish.x += fish.vx * motionSpeedFactor;
        fish.y += fish.vy * motionSpeedFactor;
        fish.tailPhase += fish.tailSpeed * motionSpeedFactor;

        // Autonomous turning when approaching side bounds
        const pad = 60;
        if (fish.x > width + pad && fish.vx > 0) {
          fish.x = -pad;
          fish.y = Math.random() * (height * 0.75) + 50;
        } else if (fish.x < -pad && fish.vx < 0) {
          fish.x = width + pad;
          fish.y = Math.random() * (height * 0.75) + 50;
        }

        // Smooth pitch orientation based on velocity
        const pitch = (fish.vy / (Math.abs(fish.vx) + 0.1)) * 0.35;
        const currentScaleX = fish.vx >= 0 ? 1 : -1;

        drawGuppy(
          fish.x,
          fish.y,
          pitch,
          currentScaleX,
          fish.size,
          fish.tailPhase,
          0.3,
          palettes[fish.colorType],
          fish.depth
        );
      });

      // 5. PRIMARY HERO GUPPY (DESKTOP INTERPOLATION & MOBILE AUTONOMOUS SWIMMING)
      // Determine destination target based on platform & user activity
      let desiredTargetX = primaryFish.x;
      let desiredTargetY = primaryFish.y;

      const timeSincePointer = currentTime - primaryFish.lastPointerTime;
      const isPointerActive = primaryFish.hasPointerTarget && timeSincePointer < 4000;

      if (isPointerActive) {
        // -------------------------------------------------------------
        // DESKTOP POINTER FOLLOW: Target Interpolation & Orbit Buffer
        // Do not attach directly to cursor; instead, maintain curiosity orbit!
        // -------------------------------------------------------------
        primaryFish.orbitOffsetAngle += 0.02 * motionSpeedFactor;

        // Distance from current position to cursor
        const toCursorX = primaryFish.pointerX - primaryFish.x;
        const toCursorY = primaryFish.pointerY - primaryFish.y;
        const distToCursor = Math.hypot(toCursorX, toCursorY);

        // Desired cushion distance so the fish swims near the pointer naturally (55px - 75px)
        const approachComfortDist = 65;

        if (distToCursor > approachComfortDist) {
          // Approach towards cursor with gentle offset
          const angleToCursor = Math.atan2(toCursorY, toCursorX);
          desiredTargetX = primaryFish.pointerX - Math.cos(angleToCursor) * (approachComfortDist * 0.6);
          desiredTargetY = primaryFish.pointerY - Math.sin(angleToCursor) * (approachComfortDist * 0.6);
        } else {
          // Inside comfortable zone: glide in a curious, gentle orbit around cursor
          const orbitRadius = 48;
          desiredTargetX = primaryFish.pointerX + Math.cos(primaryFish.orbitOffsetAngle) * orbitRadius;
          desiredTargetY = primaryFish.pointerY + Math.sin(primaryFish.orbitOffsetAngle * 0.8) * (orbitRadius * 0.7);
        }
      } else {
        // -------------------------------------------------------------
        // MOBILE & IDLE DESKTOP: Autonomous Graceful Curved Movement
        // Smooth parametric path traversing aquarium with natural arcs
        // -------------------------------------------------------------
        primaryFish.curvedPhase += 0.012 * motionSpeedFactor;
        const centerX = width * 0.58;
        const centerY = height * 0.46;
        const spreadX = Math.min(width * 0.36, 320);
        const spreadY = Math.min(height * 0.28, 160);

        // Harmonic Lissajous curve with organic secondary perturbation
        desiredTargetX =
          centerX +
          Math.sin(primaryFish.curvedPhase * 0.9) * spreadX +
          Math.cos(primaryFish.curvedPhase * 1.8) * (spreadX * 0.25);

        desiredTargetY =
          centerY +
          Math.sin(primaryFish.curvedPhase * 1.5) * spreadY +
          Math.cos(primaryFish.curvedPhase * 0.7) * (spreadY * 0.3);
      }

      // Physics: Velocity, Acceleration & Deceleration (Spring + Drag)
      const diffX = desiredTargetX - primaryFish.x;
      const diffY = desiredTargetY - primaryFish.y;
      const targetDist = Math.hypot(diffX, diffY);

      // Adaptive spring & friction based on distance (accelerates on long stretches, glides on arrival)
      const spring = targetDist > 120 ? 0.026 : 0.018;
      const drag = 0.905; // Hydrodynamic drag for deceleration

      primaryFish.vx += diffX * spring * motionSpeedFactor;
      primaryFish.vy += diffY * spring * motionSpeedFactor;

      primaryFish.vx *= drag;
      primaryFish.vy *= drag;

      // Speed cap
      const maxSpeed = prefersReducedMotion ? 2.0 : isMobile ? 3.8 : 5.8;
      const currentSpeed = Math.hypot(primaryFish.vx, primaryFish.vy);
      if (currentSpeed > maxSpeed) {
        primaryFish.vx = (primaryFish.vx / currentSpeed) * maxSpeed;
        primaryFish.vy = (primaryFish.vy / currentSpeed) * maxSpeed;
      }

      // Update position
      primaryFish.x += primaryFish.vx;
      primaryFish.y += primaryFish.vy;
      primaryFish.speed = currentSpeed;

      // Ensure guppy stays within safe viewport boundaries
      const padding = 70;
      if (primaryFish.x < padding) {
        primaryFish.x = padding;
        primaryFish.vx *= -0.5;
      } else if (primaryFish.x > width - padding) {
        primaryFish.x = width - padding;
        primaryFish.vx *= -0.5;
      }
      if (primaryFish.y < padding) {
        primaryFish.y = padding;
        primaryFish.vy *= -0.5;
      } else if (primaryFish.y > height - padding) {
        primaryFish.y = height - padding;
        primaryFish.vy *= -0.5;
      }

      // Smooth horizontal 3D turning scale (interpolating scaleX from -1 to 1)
      if (primaryFish.vx > 0.35) {
        primaryFish.targetScaleX = 1;
      } else if (primaryFish.vx < -0.35) {
        primaryFish.targetScaleX = -1;
      }
      // Slerp scaleX to simulate perspective 3D turning
      primaryFish.scaleX += (primaryFish.targetScaleX - primaryFish.scaleX) * 0.12;

      // Pitch angle (smooth tilt clamped between -32° and +32° so the guppy never flips)
      const rawPitch = Math.atan2(primaryFish.vy, Math.abs(primaryFish.vx) + 0.4);
      const clampedPitch = Math.max(-0.55, Math.min(0.55, rawPitch));
      primaryFish.pitch += (clampedPitch - primaryFish.pitch) * 0.12;

      // Tail oscillation frequency & amplitude scale with speed
      const baseTailFreq = prefersReducedMotion ? 0.05 : 0.12;
      const dynamicTailSpeed = baseTailFreq + (currentSpeed / maxSpeed) * 0.22;
      primaryFish.tailPhase += dynamicTailSpeed * motionSpeedFactor;

      const dynamicTailAmp = prefersReducedMotion ? 0.18 : 0.28 + (currentSpeed / maxSpeed) * 0.18;

      // Render the Primary Hero Guppy with rich delta tail
      drawGuppy(
        primaryFish.x,
        primaryFish.y,
        primaryFish.pitch,
        primaryFish.scaleX,
        isMobile ? 1.05 : 1.42, // Larger showcase fish on desktop, lighter on mobile
        primaryFish.tailPhase,
        dynamicTailAmp,
        palettes.heroRedDragon,
        1.0
      );

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      motionQuery.removeEventListener('change', handleMotionChange);
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div id="living-aquarium-hero" className="relative w-full overflow-hidden bg-[#021E31]">
      {/* Interactive Aquarium Stage */}
      <div
        ref={containerRef}
        id="living-aquarium-stage"
        className="hero-aquarium-stage relative min-h-[540px] sm:min-h-[600px] lg:min-h-[700px] w-full flex items-center justify-between cursor-default select-none"
      >
        {/* Photographic aquarium base gives the hero a real-fish / live-plant feel. */}
        <img
          src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1800&q=82"
          alt="Real aquarium fish with aquatic plants"
          className="hero-photo-layer absolute inset-0 w-full h-full object-cover opacity-55"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#021E31]/95 via-[#032B42]/72 to-[#032B42]/35" />
        <div className="absolute inset-0 hero-caustic-light pointer-events-none" />
        <div className="hero-water-surface absolute inset-x-0 top-0 h-32 pointer-events-none" />
        <div className="hero-depth-glow absolute inset-0 pointer-events-none" />

        <div className="hero-plant-cluster hero-plants-left" aria-hidden="true">
          <span /><span /><span /><span /><span /><span />
        </div>
        <div className="hero-plant-cluster hero-plants-right" aria-hidden="true">
          <span /><span /><span /><span /><span /><span />
        </div>

        <div className="hero-reef-home" aria-hidden="true">
          <span className="reef-rock reef-rock-one" />
          <span className="reef-rock reef-rock-two" />
          <span className="reef-rock reef-rock-three" />
          <span className="reef-rock reef-rock-four" />
          <span className="reef-cave-opening" />
          <span className="reef-plant reef-plant-one" />
          <span className="reef-plant reef-plant-two" />
          <span className="reef-plant reef-plant-three" />
          <span className="reef-pebble pebble-one" />
          <span className="reef-pebble pebble-two" />
          <span className="reef-pebble pebble-three" />
          <span className="reef-pebble pebble-four" />
          <span className="reef-pebble pebble-five" />
          <span className="reef-pebble pebble-six" />
          <span className="reef-coral coral-left" />
          <span className="reef-coral coral-right" />
          <span className="reef-glow" />
        </div>

        <div className="hero-dolphin-shadow" aria-hidden="true">
          <svg viewBox="0 0 260 120" role="presentation">
            <path d="M30 64 C54 34, 106 24, 152 34 C178 40, 206 54, 220 66 C232 76, 236 82, 228 87 C214 95, 183 94, 160 86 C137 78, 118 72, 96 72 C81 72, 67 76, 54 82 C46 86, 37 85, 35 78 C32 72, 28 68, 30 64 Z" fill="rgba(114,233,248,.38)" />
            <path d="M152 34 C148 18, 160 10, 176 13 C168 18, 163 27, 166 38 Z" fill="rgba(171,247,255,.34)" />
            <path d="M218 66 C233 55, 248 56, 255 65 C248 71, 241 77, 230 81 Z" fill="rgba(171,247,255,.28)" />
            <path d="M90 72 C95 84, 89 95, 78 98 C78 89, 81 81, 86 74 Z" fill="rgba(171,247,255,.24)" />
          </svg>
        </div>

        {/* Background Canvas Layer */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-auto opacity-90"
          aria-label="Interactive aquarium simulation"
        />

        {/* Ambient Top Glow Layer */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-[#021E31]/95 pointer-events-none" />

        {/* Foreground Content Hero Grid */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 sm:py-20 lg:py-24 pointer-events-none">
          <div className="max-w-2xl text-white">
            {/* Tagline pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#50D4EE]/15 border border-[#50D4EE]/30 backdrop-blur-md mb-4 sm:mb-6 animate-in fade-in slide-in-from-bottom-2">
              <span className="w-2 h-2 rounded-full bg-[#50D4EE] animate-pulse shrink-0"></span>
              <span className="text-[11px] sm:text-xs font-semibold tracking-wide text-[#E8F9FC] truncate">
                Healthy Fish • Happy Homes • Better Life
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-['Manrope',sans-serif] leading-[1.15] sm:leading-[1.12] mb-4 sm:mb-6 drop-shadow-md">
              Guppies Make <br />
              <span className="bg-gradient-to-r from-[#50D4EE] via-[#80E8FF] to-white bg-clip-text text-transparent">
                Life Brighter.
              </span>
            </h1>

            {/* Supporting paragraph */}
            <p className="text-sm sm:text-base lg:text-lg text-[#E8F9FC]/90 leading-relaxed mb-6 sm:mb-8 max-w-xl font-normal drop-shadow-xs">
              Selected guppy pairs, fish food, and starter combo packs in a green planted aquarium setting with rocky hiding spaces. Delivery is offered to enabled serviceable PIN codes within Tamil Nadu.
            </p>

            {/* Interactive CTAs */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 pointer-events-auto">
              <button
                id="btn-hero-explore-guppies"
                onClick={onExploreGuppies}
                className="premium-action-btn bg-[#50D4EE] hover:bg-[#38c9e5] text-[#021E31] font-bold text-xs sm:text-sm px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 flex items-center gap-2 transform active:scale-95 min-h-[44px]"
              >
                Explore Guppies
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="btn-hero-shop-food"
                onClick={onShopFishFood}
                className="premium-action-btn bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl border border-white/25 backdrop-blur-md transition-all duration-300 transform active:scale-95 min-h-[44px]"
              >
                Shop Fish Food
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Strip (Section 11, Item 3) */}
      <div className="relative z-20 border-t border-sky-900/60 bg-[#032B42]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 text-white">
            <div className="trust-explainer-card flex items-start gap-3 bg-white/[0.04] p-3.5 sm:p-4 rounded-2xl border border-white/10">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#50D4EE]/15 flex items-center justify-center border border-[#50D4EE]/30 text-[#50D4EE] shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-extrabold text-white">Available Fish Selection</p>
                <p className="text-[11px] sm:text-xs text-[#E8F9FC]/72 leading-relaxed mt-0.5">Fish shown from current seller-listed stock</p>
              </div>
            </div>

            <div className="trust-explainer-card flex items-start gap-3 bg-white/[0.04] p-3.5 sm:p-4 rounded-2xl border border-white/10">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#50D4EE]/15 flex items-center justify-center border border-[#50D4EE]/30 text-[#50D4EE] shrink-0">
                <PackageCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-extrabold text-white">Packing Before Dispatch</p>
                <p className="text-[11px] sm:text-xs text-[#E8F9FC]/72 leading-relaxed mt-0.5">Seller schedules packing before shipment</p>
              </div>
            </div>

            <div className="trust-explainer-card flex items-start gap-3 bg-white/[0.04] p-3.5 sm:p-4 rounded-2xl border border-white/10">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#50D4EE]/15 flex items-center justify-center border border-[#50D4EE]/30 text-[#50D4EE] shrink-0">
                <Headphones className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-extrabold text-white">Direct Customer Support</p>
                <p className="text-[11px] sm:text-xs text-[#E8F9FC]/72 leading-relaxed mt-0.5">Ask order &amp; care questions on WhatsApp</p>
              </div>
            </div>

            <div className="trust-explainer-card flex items-start gap-3 bg-white/[0.04] p-3.5 sm:p-4 rounded-2xl border border-white/10">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#50D4EE]/15 flex items-center justify-center border border-[#50D4EE]/30 text-[#50D4EE] shrink-0">
                <HeartHandshake className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-extrabold text-white">Tamil Nadu Delivery</p>
                <p className="text-[11px] sm:text-xs text-[#E8F9FC]/72 leading-relaxed mt-0.5">Orders accepted only for enabled TN PIN codes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

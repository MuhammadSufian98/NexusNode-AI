/* eslint-disable react/no-unknown-property */
"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useEffect, useState } from "react";
import * as THREE from "three";

const AntigravityInner = ({
  count = 250,
  magnetRadius = 6,
  ringRadius = 5.5,
  waveSpeed = 0.5,
  waveAmplitude = 0.8,
  particleSize = 1.8,
  lerpSpeed = 0.08,
  color = "#E11D48",
  autoAnimate = true,
  particleVariance = 1,
  rotationSpeed = 0,
  depthFactor = 1.5,
  pulseSpeed = 8,
}) => {
  const meshRef = useRef(null);
  const { viewport } = useThree();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Use a stable ref for mouse to bridge the window listener and useFrame
  const mouseCoords = useRef({ x: 0, y: 0 });
  const lastMouseMoveTime = useRef(Date.now());
  const virtualMouse = useRef({ x: 0, y: 0 });
  const isDocumentVisible = useRef(true);

  // Visibility and mouse listeners with passive events
  useEffect(() => {
    const handleMouseMove = (event) => {
      mouseCoords.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseCoords.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      lastMouseMoveTime.current = Date.now();
    };

    const handleVisibilityChange = () => {
      isDocumentVisible.current = document.visibilityState === "visible";
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Pre-allocate typed particle array for zero-garbage-collection performance
  const particles = useMemo(() => {
    const temp = [];
    const width = viewport.width || 80;
    const height = viewport.height || 80;

    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const speed = 0.008 + Math.random() / 300;
      const x = (Math.random() - 0.5) * width;
      const y = (Math.random() - 0.5) * height;
      const z = (Math.random() - 0.5) * 12;
      const randomRadiusOffset = (Math.random() - 0.5) * 1.5;

      temp.push({
        t,
        speed,
        mx: x,
        my: y,
        mz: z,
        cx: x,
        cy: y,
        cz: z,
        randomRadiusOffset,
      });
    }
    return temp;
  }, [count, viewport.width, viewport.height]);

  useFrame((state) => {
    // Skip all computations if tab is in background
    if (!isDocumentVisible.current) return;

    const mesh = meshRef.current;
    if (!mesh) return;
    const { viewport: v } = state;

    const m = mouseCoords.current;
    let destX = (m.x * v.width) * 0.5;
    let destY = (m.y * v.height) * 0.5;

    // Auto-animate fallback when idle
    const now = Date.now();
    if (autoAnimate && now - lastMouseMoveTime.current > 2000) {
      const time = state.clock.getElapsedTime();
      destX = Math.sin(time * 0.25) * (v.width * 0.2);
      destY = Math.cos(time * 0.18) * (v.height * 0.2);
    }

    virtualMouse.current.x += (destX - virtualMouse.current.x) * 0.08;
    virtualMouse.current.y += (destY - virtualMouse.current.y) * 0.08;

    const targetX = virtualMouse.current.x;
    const targetY = virtualMouse.current.y;
    const globalRotation = state.clock.getElapsedTime() * rotationSpeed;

    const pLen = particles.length;
    for (let i = 0; i < pLen; i++) {
      const particle = particles[i];
      particle.t += particle.speed;
      const t = particle.t;

      const dx = particle.mx - targetX;
      const dy = particle.my - targetY;
      const distSq = dx * dx + dy * dy;
      const magnetRadiusSq = magnetRadius * magnetRadius;

      let targetXPos = particle.mx;
      let targetYPos = particle.my;
      let targetZPos = particle.mz * depthFactor;

      if (distSq < magnetRadiusSq) {
        const angle = Math.atan2(dy, dx) + globalRotation;
        const wave = Math.sin(t * waveSpeed + angle) * (0.4 * waveAmplitude);
        const currentRingRadius = ringRadius + wave + particle.randomRadiusOffset;
        targetXPos = targetX + currentRingRadius * Math.cos(angle);
        targetYPos = targetY + currentRingRadius * Math.sin(angle);
      }

      particle.cx += (targetXPos - particle.cx) * lerpSpeed;
      particle.cy += (targetYPos - particle.cy) * lerpSpeed;
      particle.cz += (targetZPos - particle.cz) * lerpSpeed;

      dummy.position.set(particle.cx, particle.cy, particle.cz);
      dummy.lookAt(targetX, targetY, particle.cz);
      dummy.rotateX(Math.PI * 0.5);

      const cdx = particle.cx - targetX;
      const cdy = particle.cy - targetY;
      const currentDistToMouse = Math.sqrt(cdx * cdx + cdy * cdy);
      const distFromRing = Math.abs(currentDistToMouse - ringRadius);
      const scaleFactor = Math.max(0, Math.min(1, 1 - distFromRing / 7));

      const finalScale =
        scaleFactor *
        (0.85 + Math.sin(t * pulseSpeed) * 0.15 * particleVariance) *
        particleSize;

      dummy.scale.set(finalScale, finalScale, finalScale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <capsuleGeometry args={[0.07, 0.28, 3, 6]} />
      <meshBasicMaterial color={color} transparent opacity={0.45} depthWrite={false} />
    </instancedMesh>
  );
};

const Antigravity = (props) => {
  const [inView, setInView] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.01 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden transform-gpu"
      style={{ transform: "translateZ(0)" }}
    >
      {inView && (
        <Canvas
          camera={{ position: [0, 0, 40], fov: 35 }}
          dpr={[1, 1.5]}
          frameloop="always"
          gl={{
            alpha: true,
            antialias: false,
            powerPreference: "high-performance",
            precision: "mediump",
          }}
          style={{ pointerEvents: "none" }}
        >
          <AntigravityInner {...props} />
        </Canvas>
      )}
    </div>
  );
};

export default Antigravity;

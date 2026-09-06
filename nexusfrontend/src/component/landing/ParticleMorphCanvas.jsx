"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const PARTICLE_COUNT = 7000;

export default function ParticleMorphCanvas({ scrollProgress = 0 }) {
  const mountRef = useRef(null);
  const scrollRef = useRef(scrollProgress);
  scrollRef.current = scrollProgress;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    );
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Build 3 Shapes: Book Shape, Dispersed Cloud, and Hex Core
    const shapeA = new Float32Array(PARTICLE_COUNT * 3); // Open Book
    const shapeB = new Float32Array(PARTICLE_COUNT * 3); // Nexus Sphere / Aperture
    const currentPositions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);

    const roseColor = new THREE.Color("#E11D48");
    const orangeColor = new THREE.Color("#F97316");
    const cyanColor = new THREE.Color("#0EA5E9");

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      // Shape A: Dual Page Curvature (Open Textbook)
      const u = (Math.random() - 0.5) * 4;
      const v = (Math.random() - 0.5) * 3;
      const pageSide = u > 0 ? 1 : -1;
      const curve = Math.sin((Math.abs(u) / 2) * Math.PI * 0.5) * 0.4;

      shapeA[i3] = u;
      shapeA[i3 + 1] = v;
      shapeA[i3 + 2] = curve + (Math.random() - 0.5) * 0.15;

      // Shape B: Concentric Hexagonal Ring & Core
      const theta = Math.random() * Math.PI * 2;
      const radius = 1.2 + Math.random() * 1.5;
      const phi = (Math.random() - 0.5) * Math.PI;

      shapeB[i3] = radius * Math.cos(theta) * Math.cos(phi);
      shapeB[i3 + 1] = radius * Math.sin(phi);
      shapeB[i3 + 2] = radius * Math.sin(theta) * Math.cos(phi);

      // Start at Shape A
      currentPositions[i3] = shapeA[i3];
      currentPositions[i3 + 1] = shapeA[i3 + 1];
      currentPositions[i3 + 2] = shapeA[i3 + 2];

      // Palette: Transition from Rose/Orange to Cyan
      const mixed = roseColor
        .clone()
        .lerp(u > 0 ? cyanColor : orangeColor, Math.random());
      colors[i3] = mixed.r;
      colors[i3 + 1] = mixed.g;
      colors[i3 + 2] = mixed.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(currentPositions, 3),
    );
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Circle texture for soft glow points
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.4, "rgba(255,255,255,0.7)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);
    const pTexture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      map: pTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 3. Mouse Interaction Track
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e) => {
      mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // 4. Render & Morph Loop
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      const time = clock.getElapsedTime();
      const scroll = scrollRef.current; // 0.0 (Book) to 1.0 (Hex Core)

      // Smooth mouse damping
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      particles.rotation.y = time * 0.08 + mouse.x * 0.2;
      particles.rotation.x = mouse.y * 0.15;

      // Morphing calculations
      const posAttr = geometry.attributes.position;
      const posArr = posAttr.array;

      // When scroll is in the middle (0.4 - 0.6), add high noise dispersion
      const dispersion = Math.sin(scroll * Math.PI) * 2.5;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;

        // Base interpolation between Shape A and Shape B
        const targetX = THREE.MathUtils.lerp(shapeA[i3], shapeB[i3], scroll);
        const targetY = THREE.MathUtils.lerp(
          shapeA[i3 + 1],
          shapeB[i3 + 1],
          scroll,
        );
        const targetZ = THREE.MathUtils.lerp(
          shapeA[i3 + 2],
          shapeB[i3 + 2],
          scroll,
        );

        // Procedural particle noise/explosion during scroll transition
        const noiseX = Math.sin(time * 2 + i) * dispersion * 0.8;
        const noiseY = Math.cos(time * 1.5 + i * 2) * dispersion * 0.8;
        const noiseZ = Math.sin(time * 2.5 + i * 0.5) * dispersion * 0.8;

        // Smooth physics pull toward target
        posArr[i3] += (targetX + noiseX - posArr[i3]) * 0.08;
        posArr[i3 + 1] += (targetY + noiseY - posArr[i3 + 1]) * 0.08;
        posArr[i3 + 2] += (targetZ + noiseZ - posArr[i3 + 2]) * 0.08;
      }

      posAttr.needsUpdate = true;
      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
      geometry.dispose();
      material.dispose();
      pTexture.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full pointer-events-none" />;
}

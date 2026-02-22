/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";

const AntigravityInner = ({
  count = 500,
  magnetRadius = 8,
  ringRadius = 7,
  waveSpeed = 0.6,
  waveAmplitude = 1,
  particleSize = 2,
  lerpSpeed = 0.09,
  color = "#5227FF",
  autoAnimate = true,
  particleVariance = 1,
  rotationSpeed = 0,
  depthFactor = 2,
  pulseSpeed = 13,
  particleShape = "capsule",
  fieldStrength = 2,
}) => {
  const meshRef = useRef(null);
  const { viewport } = useThree();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Use a stable ref for mouse to bridge the window listener and useFrame
  const mouseCoords = useRef({ x: 0, y: 0 });
  const lastMouseMoveTime = useRef(Date.now());
  const virtualMouse = useRef({ x: 0, y: 0 });

  // MANUAL MOUSE SYNC: Listen to the entire window
  useEffect(() => {
    const handleMouseMove = (event) => {
      // Convert standard mouse coords to R3F normalized coords (-1 to +1)
      mouseCoords.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseCoords.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      lastMouseMoveTime.current = Date.now();
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const particles = useMemo(() => {
    const temp = [];
    const width = viewport.width || 100;
    const height = viewport.height || 100;

    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const x = (Math.random() - 0.5) * width;
      const y = (Math.random() - 0.5) * height;
      const z = (Math.random() - 0.5) * 15;
      const randomRadiusOffset = (Math.random() - 0.5) * 2;

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
    const mesh = meshRef.current;
    if (!mesh) return;
    const { viewport: v } = state;

    // Use our manually synced mouseCoords instead of state.pointer
    const m = mouseCoords.current;

    let destX = (m.x * v.width) / 2;
    let destY = (m.y * v.height) / 2;

    // Auto-animate fallback
    if (autoAnimate && Date.now() - lastMouseMoveTime.current > 2000) {
      const time = state.clock.getElapsedTime();
      destX = Math.sin(time * 0.3) * (v.width / 4);
      destY = Math.cos(time * 0.2) * (v.height / 4);
    }

    virtualMouse.current.x += (destX - virtualMouse.current.x) * 0.1;
    virtualMouse.current.y += (destY - virtualMouse.current.y) * 0.1;

    const targetX = virtualMouse.current.x;
    const targetY = virtualMouse.current.y;
    const globalRotation = state.clock.getElapsedTime() * rotationSpeed;

    particles.forEach((particle, i) => {
      let { t, speed, mx, my, mz, randomRadiusOffset } = particle;
      t = particle.t += speed / 2;

      const dx = mx - targetX;
      const dy = my - targetY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let targetPos = { x: mx, y: my, z: mz * depthFactor };

      if (dist < magnetRadius) {
        const angle = Math.atan2(dy, dx) + globalRotation;
        const wave = Math.sin(t * waveSpeed + angle) * (0.5 * waveAmplitude);
        const currentRingRadius = ringRadius + wave + randomRadiusOffset;
        targetPos.x = targetX + currentRingRadius * Math.cos(angle);
        targetPos.y = targetY + currentRingRadius * Math.sin(angle);
      }

      particle.cx += (targetPos.x - particle.cx) * lerpSpeed;
      particle.cy += (targetPos.y - particle.cy) * lerpSpeed;
      particle.cz += (targetPos.z - particle.cz) * lerpSpeed;

      dummy.position.set(particle.cx, particle.cy, particle.cz);
      dummy.lookAt(targetX, targetY, particle.cz);
      dummy.rotateX(Math.PI / 2);

      const currentDistToMouse = Math.sqrt(
        Math.pow(particle.cx - targetX, 2) + Math.pow(particle.cy - targetY, 2),
      );
      const distFromRing = Math.abs(currentDistToMouse - ringRadius);
      let scaleFactor = Math.max(0, Math.min(1, 1 - distFromRing / 8));

      const finalScale =
        scaleFactor *
        (0.8 + Math.sin(t * pulseSpeed) * 0.2 * particleVariance) *
        particleSize;

      dummy.scale.set(finalScale, finalScale, finalScale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <capsuleGeometry args={[0.08, 0.3, 4, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} />
    </instancedMesh>
  );
};

const Antigravity = (props) => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 40], fov: 35 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
        // Important: Ensure no internal events interfere
        style={{ pointerEvents: "none" }}
      >
        <AntigravityInner {...props} />
      </Canvas>
    </div>
  );
};

export default Antigravity;

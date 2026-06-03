'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Icosahedron } from '@react-three/drei';
import { useRef, useState, useEffect } from 'react';
import type { Mesh } from 'three';

function Blob() {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    // Clamp delta so the blob doesn't "jump" when the loop resumes after a pause.
    const d = Math.min(delta, 0.05);
    ref.current.rotation.x += d * 0.25;
    ref.current.rotation.y += d * 0.4;
  });
  return (
    <Float speed={2} rotationIntensity={0.7} floatIntensity={1.4} position={[1.05, 0, 0]}>
      <Icosahedron ref={ref} args={[1.25, 6]}>
        <MeshDistortMaterial
          color="#6366f1"
          emissive="#7c3aed"
          emissiveIntensity={0.4}
          roughness={0.12}
          metalness={0.65}
          distort={0.38}
          speed={2.4}
        />
      </Icosahedron>
    </Float>
  );
}

/**
 * Floating, rotating, distorted 3D blob for the home hero (Three.js / R3F).
 * Render loop pauses when the hero scrolls off-screen or the tab is hidden, so
 * it stops using the GPU/battery while you scroll the feed.
 */
export default function Hero3D() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [intersecting, setIntersecting] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setIntersecting(entry.isIntersecting),
      { rootMargin: '120px' },
    );
    io.observe(el);

    const onVis = () => setTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVis);
    setTabVisible(!document.hidden);

    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  // Only run the render loop when the hero is actually on-screen and the tab is visible.
  const active = intersecting && tabVisible;

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%' }}>
      <Canvas
        frameloop={active ? 'always' : 'never'}
        camera={{ position: [0, 0, 4], fov: 45 }}
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[3, 3, 4]} intensity={1.3} />
        <pointLight position={[-4, -2, -3]} intensity={1.2} color="#ec4899" />
        <Blob />
      </Canvas>
    </div>
  );
}

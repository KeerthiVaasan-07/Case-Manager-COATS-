import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const mouse = { x: 0, y: 0 };
if (typeof window !== 'undefined') window.addEventListener('pointermove', e => { mouse.x = e.clientX / innerWidth - 0.5; mouse.y = e.clientY / innerHeight - 0.5; }, { passive: true });

function NetworkNodes({ count = 50 }) {
  const meshRef = useRef();
  const linesRef = useRef();

  const { positions, connections } = useMemo(() => {
    const pos = Array.from({ length: count }, () => [
      (Math.random() - 0.5) * 22,
      (Math.random() - 0.5) * 13,
      (Math.random() - 0.5) * 8,
    ]);
    const conns = [];
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = pos[i][0] - pos[j][0];
        const dy = pos[i][1] - pos[j][1];
        const dz = pos[i][2] - pos[j][2];
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (dist < 4.2 && conns.length < 90) conns.push([i, j]);
      }
    }
    return { positions: pos, connections: conns };
  }, [count]);

  const lineGeom = useMemo(() => {
    const verts = [];
    for (const [a, b] of connections) verts.push(...positions[a], ...positions[b]);
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    return geom;
  }, [positions, connections]);

  const instGeom = useMemo(() => new THREE.SphereGeometry(0.075, 8, 8), []);
  const instMat = useMemo(() => new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.8 }), []);

  useEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    positions.forEach((p, i) => {
      dummy.position.set(p[0], p[1], p[2]);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions]);

  useFrame(({ clock, camera }) => {
    camera.position.x += (mouse.x * 1.6 - camera.position.x) * 0.04;
    camera.position.y += (-mouse.y * 1.0 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
    const t = clock.getElapsedTime() * 0.05;
    if (meshRef.current) {
      meshRef.current.rotation.y = t;
      meshRef.current.rotation.x = t * 0.3;
    }
    if (linesRef.current) {
      linesRef.current.rotation.y = t;
      linesRef.current.rotation.x = t * 0.3;
    }
  });

  return (
    <>
      <instancedMesh ref={meshRef} args={[instGeom, instMat, count]} />
      <lineSegments ref={linesRef} geometry={lineGeom}>
        <lineBasicMaterial color={0x6366f1} transparent opacity={0.22} />
      </lineSegments>
    </>
  );
}

export default function CyberBackground() {
  const [ok, setOk] = useState(true);
  const small = typeof window !== 'undefined' && window.innerWidth < 820;
  const still = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    try {
      const c = document.createElement('canvas');
      const ctx = c.getContext('webgl') || c.getContext('experimental-webgl');
      if (!ctx) setOk(false);
    } catch { setOk(false); }
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      {ok ? (
        <Canvas
          camera={{ position: [0, 0, 13], fov: 60 }}
          gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
          dpr={[1, small ? 1 : 1.25]}
          frameloop={still ? 'demand' : 'always'}
        >
          <NetworkNodes count={small ? 22 : 45} />
        </Canvas>
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 20% 50%, rgba(34,211,238,0.12) 0%, transparent 60%)',
        }} />
      )}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 40%, rgba(5,8,15,0.15) 0%, rgba(5,8,15,0.85) 80%)',
      }} />
    </div>
  );
}

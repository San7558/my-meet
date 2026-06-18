// src/components/landing/ThreeGlobe.jsx
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, Torus, MeshDistortMaterial } from "@react-three/drei";

const Globe = () => {
  const globeRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (globeRef.current) {
      globeRef.current.rotation.y = t * 0.18;
      globeRef.current.rotation.x = Math.sin(t * 0.3) * 0.08;
      globeRef.current.position.y = Math.sin(t * 0.5) * 0.12;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = t * 0.4;
      ring1Ref.current.rotation.z = t * 0.15;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = -t * 0.25;
      ring2Ref.current.rotation.y = t * 0.3;
    }
  });

  return (
    <group>
      {/* Main globe */}
      <Sphere ref={globeRef} args={[1.2, 64, 64]}>
        <MeshDistortMaterial
          color="#6366f1"
          emissive="#4f46e5"
          emissiveIntensity={0.4}
          roughness={0.2}
          metalness={0.6}
          distort={0.25}
          speed={2}
        />
      </Sphere>

      {/* Inner glow sphere */}
      <Sphere args={[1.25, 32, 32]}>
        <meshBasicMaterial color="#818cf8" transparent opacity={0.06} />
      </Sphere>

      {/* Orbit ring 1 */}
      <Torus ref={ring1Ref} args={[1.9, 0.015, 16, 100]}>
        <meshBasicMaterial color="#818cf8" transparent opacity={0.5} />
      </Torus>

      {/* Orbit ring 2 */}
      <Torus ref={ring2Ref} args={[2.3, 0.01, 16, 100]} rotation={[Math.PI / 3, 0, 0]}>
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.35} />
      </Torus>

      {/* Floating mic dot */}
      <Sphere args={[0.12, 16, 16]} position={[1.9, 0.6, 0]}>
        <meshStandardMaterial color="#f0abfc" emissive="#c084fc" emissiveIntensity={1} />
      </Sphere>

      {/* Ambient + point lights */}
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 4, 4]} intensity={1.5} color="#818cf8" />
      <pointLight position={[-4, -2, -4]} intensity={0.8} color="#c084fc" />
    </group>
  );
};

export default Globe;

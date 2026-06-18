// src/components/landing/CanvasWrapper.jsx
import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import Globe from "./ThreeGlobe";

const CanvasWrapper = () => {
  return (
    <div className="relative w-full h-full min-h-[420px]">
      {/* Radial glow behind canvas */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl" />
      </div>

      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        <Suspense fallback={null}>
          <Globe />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default CanvasWrapper;

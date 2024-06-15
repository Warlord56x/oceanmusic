"use client";

import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import {
  Canvas,
  ThreeElements,
  ThreeEvent,
  useFrame,
} from "@react-three/fiber";
import {
  OrbitControls,
  Point,
  Points,
  PointsBuffer,
  Sparkles,
  Stars,
} from "@react-three/drei";

function CustomSparkles() {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  const particles = useMemo(() => {
    const count = 100;
    const particles = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const speeds = new Float32Array(count);
    const opacities = new Float32Array(count);
    const noises = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      particles.set([Math.random(), Math.random(), Math.random()], i * 3);
      sizes[i] = Math.random() * 1.5;
      speeds[i] = Math.random() * 0.5 + 0.5;
      opacities[i] = Math.random() * 0.5 + 0.5;
      noises.set([Math.random(), Math.random(), Math.random()], i * 3);
      colors.set([Math.random(), Math.random(), Math.random()], i * 3);
    }

    return { particles, sizes, speeds, opacities, noises, colors };
  }, []);
  return (
    <group>
      <Points
        positions={particles.particles}
        colors={particles.colors}
        sizes={particles.sizes}
      >
        <pointsMaterial vertexColors />
      </Points>
    </group>
  );
}

export default function Sparkle() {
  return (
    <div style={{ height: "100vh" }}>
      <Canvas>
        <OrbitControls enablePan={false} />
        <CustomSparkles />
      </Canvas>
    </div>
  );
}

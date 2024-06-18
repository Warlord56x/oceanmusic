"use client";

import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import instanceVertex from "./shaders/instanceVertex.glsl";
import instanceFragment from "./shaders/instanceFragment.glsl";
import {
  Canvas,
  ThreeElements,
  ThreeEvent,
  useFrame,
} from "@react-three/fiber";
import { OrbitControls, Sparkles, Stars, useTexture } from "@react-three/drei";

function Box(props: ThreeElements["mesh"]) {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame((_state, delta) => (meshRef.current.rotation.x += delta));
  return (
    <mesh {...props} ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial />
      <Sparkles />
    </mesh>
  );
}

function InstanceMeshes({ size = 10 }) {
  const texture = useTexture("hokusai_reszlet_2.png");
  const instanceMesh = useRef<THREE.InstancedMesh>(null!);
  const instanceGeom = useMemo(() => new THREE.BoxGeometry(4, 4, 4), []);
  const instanceMat = useRef<THREE.ShaderMaterial>(null!);

  const [width, height] = useMemo(() => {
    const img = texture.image;
    return [img.width, img.height];
  }, [texture]);

  useFrame(
    (state) =>
      (instanceMat.current.uniforms.uTime.value = state.clock.getElapsedTime()),
  );

  const particles = useMemo(() => {
    const count = size * size;
    const indices = new Uint16Array(count);
    const offsets = new Float32Array(count * 3);
    const angles = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      offsets[i * 3] = i % width;
      offsets[i * 3 + 1] = Math.floor(i / width);

      indices[i] = i;

      angles[i] = Math.random() * Math.PI;
    }

    return { indices, offsets, angles };
  }, [size, width]);

  return (
    <>
      <group>
        <instancedMesh ref={instanceMesh} count={size * size}>
          <instancedBufferGeometry
            index={instanceGeom.index}
            attributes-position={instanceGeom.attributes.position}
            attributes-uv={instanceGeom.attributes.uv}
          >
            <instancedBufferAttribute
              attach="attributes-pindex"
              args={[new Float32Array(particles.indices), 1]}
            />
            <instancedBufferAttribute
              attach="attributes-offset"
              args={[new Float32Array(particles.offsets), 3]}
            />
            <instancedBufferAttribute
              attach="attributes-angle"
              args={[new Float32Array(particles.angles), 1]}
            />
          </instancedBufferGeometry>
          <shaderMaterial
            ref={instanceMat}
            uniforms={{
              uTime: { value: 0.0 },
              uRandom: { value: 1.0 },
              uDepth: { value: 2.0 },
              uSize: { value: 1.0 },
              uTextureSize: { value: [width, height] },
              uTexture: { value: texture },
              uTouch: { value: null },
            }}
            vertexShader={instanceVertex}
            fragmentShader={instanceFragment}
          />
        </instancedMesh>
      </group>
    </>
  );
}

export default function Three() {
  return (
    <div style={{ height: "100vh" }}>
      <Canvas>
        <OrbitControls enablePan={false} />
        <InstanceMeshes />
        <Stars />
      </Canvas>
    </div>
  );
}

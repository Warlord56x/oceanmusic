"use client";
import dynamic from "next/dynamic";
import { CircularProgress } from "@mui/material";
import { useEffect, useMemo, useRef } from "react";
import { Center, Plane, useTexture } from "@react-three/drei";
import * as THREE from "three";
import vertexShader from "./mainShaders/vertex.glsl";
import fragmentShader from "./mainShaders/fragment.glsl";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import TouchTexture from "@/_utils/touchTexture";

const View = dynamic(
  () => import("@/components/canvas/View").then((mod) => mod.View),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
        }}
      >
        <CircularProgress
          size="8rem"
          style={{ transition: "none" }}
          variant="indeterminate"
        ></CircularProgress>
      </div>
    ),
  },
);

function ImageParticles() {
  const pointsRef = useRef<THREE.Points>(null!);
  const shaderRef = useRef<THREE.ShaderMaterial>(null!);
  const planeRef = useRef<THREE.Mesh>(null!);
  const texture = useTexture("hokusai_reszlet_2.png");

  const sizeWidth = 512;
  const sizeHeight = 512;

  const touchTexture = useRef<TouchTexture>(new TouchTexture(sizeWidth));

  const uniforms = useMemo(
    () => ({
      uTouchTexture: {
        value: touchTexture.current.texture,
      },
      uTime: {
        value: 0.0,
      },
      uMousePos: {
        value: new THREE.Vector3(0, 0, 0),
      },
    }),
    [],
  );

  // particle positions
  const { positions, colors, uvs, angles } = useMemo(() => {
    const image = texture.image;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = sizeWidth;
    canvas.height = sizeHeight;
    context!.scale(1, -1); // flip y
    context!.drawImage(image, 0, 0, sizeWidth, sizeHeight * -1);

    const imageData = context!.getImageData(0, 0, sizeWidth, sizeHeight).data;
    const numParticles = sizeWidth * sizeHeight;
    const colors = new Float32Array(numParticles * 3);
    const positions = new Float32Array(numParticles * 3);
    const uvs = new Float32Array(numParticles * 2);
    const angles = new Float32Array(numParticles);

    for (let index = 0; index < imageData.length; index += 4) {
      const i = index / 4;
      const x = i % sizeWidth;
      const y = Math.floor(i / sizeWidth);

      const r = imageData[index];
      const g = imageData[index + 1];
      const b = imageData[index + 2];
      const brightness = r * 0.2126 + g * 0.7152 + b * 0.0722;
      let z = (brightness / 255) * 10; // Adjust the scaling factor for depth

      if (brightness / 255 < 0.9) continue;

      colors[i * 3] = r / 255;
      colors[i * 3 + 1] = g / 255;
      colors[i * 3 + 2] = b / 255;

      positions[i * 3] = x - sizeWidth / 2;
      positions[i * 3 + 1] = y - sizeHeight / 2;
      positions[i * 3 + 2] = z;

      uvs[i * 2] = x / sizeWidth;
      uvs[i * 2 + 1] = y / sizeHeight;

      angles[i] = Math.random() * Math.PI; // Generate random angle
    }

    console.log(`Total points processed: ${numParticles}`);
    console.log(`Positions length: ${positions.length}`);
    console.log(`Colors length: ${colors.length}`);
    console.log(`UVs length: ${uvs.length}`);
    console.log(`Angles length: ${angles.length}`);

    return {
      positions,
      colors,
      uvs,
      angles,
    };
  }, [texture]);

  const onPointerMove = (event: ThreeEvent<MouseEvent>) => {
    touchTexture.current.addTouch({ x: event.point.x, y: event.point.y });
    shaderRef.current.uniforms["uMousePos"].value.copy(event.point);
  };

  useFrame((state) => {
    const { clock } = state;

    shaderRef.current.uniforms["uTime"].value = clock.elapsedTime;
    touchTexture.current.update(clock.elapsedTime);
    touchTexture.current.texture.needsUpdate = true;
  });

  return (
    <group>
      <Plane
        ref={planeRef}
        args={[512, 512]}
        position={[0, 0, -0]}
        visible={false}
        onPointerMove={onPointerMove}
      />
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />

          <bufferAttribute
            attach="attributes-color"
            count={colors.length / 3}
            array={colors}
            itemSize={3}
          />

          <bufferAttribute
            attach="attributes-uv"
            count={uvs.length / 2}
            array={uvs}
            itemSize={2}
          />

          <bufferAttribute
            attach="attributes-angle"
            count={angles.length}
            array={angles}
            itemSize={1}
          />
        </bufferGeometry>
        <shaderMaterial
          ref={shaderRef}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          vertexColors
          depthWrite={false}
        />
      </points>
    </group>
  );
}

export default function Home() {
  return (
    <div style={{ height: "100%" }}>
      <View orbit fixed style={{ height: "100%" }}>
        <Center>
          <ImageParticles />
        </Center>
      </View>
    </div>
  );
}

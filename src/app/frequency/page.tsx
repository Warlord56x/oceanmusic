"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import { useFrame } from "@react-three/fiber";
import { Stats } from "@react-three/drei";
import { getFrequencyData } from "@/_utils/visualizerUtils";
import musicService from "@/_services/musicService";
import dynamic from "next/dynamic";
import { CircularProgress } from "@mui/material";
import FrequencyTexture from "@/_utils/frequencyTexture";
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

function Test() {
  const points = useRef<THREE.Points>(null!);
  const pointsGeometry = useRef<THREE.PlaneGeometry>(null!);
  const pointsMatRef = useRef<THREE.ShaderMaterial>(null!);
  const freqTexture = useRef<FrequencyTexture>(new FrequencyTexture());

  const uniforms = useMemo(
    () => ({
      uTime: {
        value: 0.0,
      },
      uTest: {
        value: freqTexture.current.texture,
      },
    }),
    [],
  );

  useFrame((state) => {
    const { clock } = state;

    const freqData = getFrequencyData(musicService.analyser);
    freqTexture.current.update(clock.elapsedTime, freqData);

    Object.assign(pointsMatRef.current.uniforms, {
      uTime: { value: clock.elapsedTime },
    });
    console.log(pointsMatRef.current.uniforms["uTime"].value);
  });

  return (
    <group>
      <points ref={points}>
        <planeGeometry
          args={[5, 5, 40, 40]}
          ref={pointsGeometry}
        ></planeGeometry>
        <shaderMaterial
          ref={pointsMatRef}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fragmentShader={fragmentShader}
          vertexShader={vertexShader}
          uniforms={uniforms}
        />
      </points>
    </group>
  );
}

export default function TestPage() {
  return (
    <div style={{ height: "100%" }}>
      <View orbit style={{ height: "100%" }}>
        <Test />
        <Stats />
      </View>
    </div>
  );
}

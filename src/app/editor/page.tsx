"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { CircularProgress } from "@mui/material";
import dynamic from "next/dynamic";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import { Plane, Stats } from "@react-three/drei";
import EditorTexture from "@/_utils/editorTexture";
import { useFrame } from "@react-three/fiber";
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

type ViewProps = {
  width: number;
  height: number;
  texture: THREE.Texture | undefined;
};

function ThreeDView({ texture, width, height }: ViewProps) {
  const shaderRef = useRef<THREE.ShaderMaterial>(null!);
  const pointsRef = useRef<THREE.Points>(null!);

  const uniforms = useMemo(
    () => ({
      uTextTexture: {
        value: texture,
      },
      uTextTextureSize: {
        value: new THREE.Vector2(512, 512),
      },
      uTime: { value: 0 },
    }),
    [texture],
  );

  useFrame((state) => {
    const { clock } = state;
    shaderRef.current.uniforms["uTime"].value = clock.getElapsedTime();
  });

  return (
    <group>
      <points ref={pointsRef}>
        <planeGeometry args={[8, 8, width - 1, height - 1]} />
        <shaderMaterial
          ref={shaderRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
        />
      </points>
      <Plane visible={false} args={[5, 5]} />
    </group>
  );
}

export default function Editor() {
  const [width, height] = useMemo(() => [512, 512], []);
  const editor = useRef<EditorTexture | undefined>(
    (function () {
      if (typeof window === "undefined") return;
      return new EditorTexture(width, height, { fontColor: "White" });
    })(),
  );
  const textInput = useRef<HTMLDivElement>(null!);
  const [isMobile, setIsMobile] = useState(false);

  const handleDivClick = () => {
    textInput.current.focus();
  };

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (editor.current) {
        editor.current.updateCaret();
      }
    }, 500);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    setIsMobile(/iPhone|iPad|iPod|Android|Windows Phone/.test(userAgent));
  }, []);

  return (
    <div style={{ height: "100%" }}>
      <div
        style={{
          height: "100%",
          width: "100%",
          outline: "none",
          position: "absolute",
          top: 0,
          right: 0,
          opacity: 0,
        }}
        ref={textInput}
        tabIndex={0}
        autoFocus
        contentEditable="plaintext-only"
        onKeyDown={(event) => {
          if (editor.current && event.key !== "Unidentified") {
            editor.current.printKey(event.key);
          }
        }}
        onInput={(event) => {
          if (!isMobile) return;
          const ev = event.nativeEvent as InputEvent;
          if (ev.data == null) return;
          editor.current?.printKey(ev.data[ev.data.length - 1]);
        }}
        onClick={handleDivClick}
      ></div>
      <div style={{ height: "100%" }}>
        <View orbit style={{ height: "100%" }}>
          <ThreeDView
            width={width}
            height={height}
            texture={editor.current?.texture}
          />
          <Stats />
        </View>
      </div>
    </div>
  );
}

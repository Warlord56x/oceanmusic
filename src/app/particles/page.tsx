"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import { useFrame } from "@react-three/fiber";
import { Stats, useGLTF } from "@react-three/drei";
import {
  freqConfig,
  getAllFrequencyData,
  getFrequencies,
} from "@/_utils/visualizerUtils";
import musicService from "@/_services/musicService";
import GUI from "lil-gui";
import dynamic from "next/dynamic";
import { CircularProgress } from "@mui/material";
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

const model = "dice.glb";

function Particles() {
  const uniformDefaults = useMemo(
    () => ({
      colorFrom: "#cf1818",
      colorTo: "#072e8c",
      colorBlend: 1.0,
      particleSize: 8.0,
      geometryScale: 1.0,
      modelScale: 1.0,
    }),
    [],
  );
  const { scene } = useGLTF("/" + model);
  const points = useRef<THREE.Points>(null!);
  const pointsGeometry = useRef<THREE.BufferGeometry>(null!);
  const pointsMatRef = useRef<THREE.ShaderMaterial>(null!);
  const [modelScale, setModelScale] = useState<number>(1.0);
  const gui = useRef(
    (function () {
      const lilGUI = new GUI({ title: "Shader uniforms" });
      const guiSave = localStorage.getItem("gui");

      const colors = lilGUI.addFolder("Colors");
      const properties = lilGUI.addFolder("Properties");

      colors
        .addColor(uniformDefaults, "colorFrom")
        .name("Original")
        .onChange((value: string) => {
          pointsMatRef.current.uniforms.uColorFrom.value = new THREE.Color(
            value,
          );
        });
      colors
        .addColor(uniformDefaults, "colorTo")
        .name("Blend")
        .onChange((value: string) => {
          pointsMatRef.current.uniforms.uColorTo.value = new THREE.Color(value);
        });
      colors
        .add(uniformDefaults, "colorBlend", 0, 1, 0.01)
        .name("Blend factor")
        .onChange((value: number) => {
          pointsMatRef.current.uniforms.uColorBlend.value = value;
        });

      properties
        .add(uniformDefaults, "particleSize", 0, 20, 1)
        .name("Particle Size")
        .onChange((value: number) => {
          pointsMatRef.current.uniforms.uSize.value = value;
        });

      properties
        .add(uniformDefaults, "modelScale", 0.01, 10, 0.0001)
        .name("Model Scale")
        .onChange((value: number) => {
          setModelScale(value);
        });

      if (guiSave) {
        lilGUI.load(JSON.parse(guiSave));
      }
      console.log(guiSave);
      return lilGUI;
    })(),
  );

  const nodes = useMemo(
    () =>
      scene.children
        .filter((child) => child.type === "Mesh")
        .map((child) => child as THREE.Mesh),
    [scene.children],
  );

  const particlesPosition = useMemo(() => {
    let positions: Float32Array = new Float32Array(0); // Initialize as an empty Float32Array

    nodes.forEach((node) => {
      if (
        node.geometry &&
        node.geometry.attributes &&
        node.geometry.attributes.position
      ) {
        node.geometry.center();
        const posArray = node.geometry.attributes.position.array;
        const newPosArray = new Float32Array(
          positions.length + posArray.length,
        );

        newPosArray.set(positions);
        newPosArray.set(posArray, positions.length);
        positions = newPosArray;
      }
    });

    return positions;
  }, [nodes]);

  const uniforms = useMemo(
    () => ({
      uTime: {
        value: 0.0,
      },
      uColorFrom: {
        value: new THREE.Color(uniformDefaults.colorFrom),
      },
      uColorTo: {
        value: new THREE.Color(uniformDefaults.colorTo),
      },

      uSize: {
        value: uniformDefaults.particleSize,
      },

      uColorBlend: {
        value: uniformDefaults.colorBlend,
      },

      // Song values
      uBassFr: {
        value: 0.0,
      },
      uMidFr: {
        value: 0.0,
      },
      uTreFr: {
        value: 0.0,
      },
    }),
    [
      uniformDefaults.colorBlend,
      uniformDefaults.colorFrom,
      uniformDefaults.colorTo,
      uniformDefaults.particleSize,
    ],
  );

  useFrame((state) => {
    const { clock } = state;

    const allFreqData = getAllFrequencyData({
      aBass: musicService.bassAnalyser,
      aMid: musicService.midAnalyser,
      aTreble: musicService.trebleAnalyser,
    });

    const [bassFr, midFr, treFr] = getFrequencies(allFreqData, freqConfig);

    Object.assign(pointsMatRef.current.uniforms, {
      uBassFr: { value: bassFr },
      uMidFr: { value: midFr },
      uTreFr: { value: treFr },
      uTime: { value: clock.elapsedTime },
    });
  });

  useEffect(() => {
    let scale = 1.0;

    const properties = gui.current.children[1] as GUI;

    properties
      .add(uniformDefaults, "geometryScale", 1, 100, 1)
      .name("Geometry Scale")
      .onChange((value: number) => {
        const scalePrev = 1 / scale;

        points.current.geometry.scale(scalePrev, scalePrev, scalePrev);

        scale = value;
        points.current.geometry.scale(value, value, value);
      });

    const guiSave = localStorage.getItem("gui");
    if (guiSave) {
      gui.current.load(JSON.parse(guiSave));
    }

    return () => {
      localStorage.setItem("gui", JSON.stringify(gui.current.save()));
      gui.current.destroy();
    };
  }, []);

  return (
    <group>
      <points ref={points} scale={modelScale}>
        <bufferGeometry ref={pointsGeometry}>
          <bufferAttribute
            attach="attributes-position"
            count={particlesPosition.length / 3}
            array={particlesPosition}
            itemSize={3}
          />
        </bufferGeometry>
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

export default function ParticlesPage() {
  return (
    <div style={{ height: "100%" }}>
      <View orbit style={{ height: "100%" }}>
        <Particles />
        <Stats />
      </View>
    </div>
  );
}

useGLTF.preload("/" + model);

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Music } from "@/lib/data/music";
import { getMusic } from "@/lib/firebase/firestore";
import dynamic from "next/dynamic";
import { CircularProgress, Container, Typography } from "@mui/material";
import { Plane, useTexture } from "@react-three/drei";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import * as THREE from "three";
import TouchTexture from "@/_utils/touchTexture";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { fetchAndCacheImage, getCachedImage } from "@/lib/firebase/storage";

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

type CoverProps = { url: string };

function Cover({ url }: CoverProps) {
  const texture = useTexture(url);
  const pointsRef = useRef<THREE.Points>(null!);
  const shaderRef = useRef<THREE.ShaderMaterial>(null!);
  const planeRef = useRef<THREE.Mesh>(null!);

  const sizeWidth = 512;
  const sizeHeight = 512;

  const touchTexture = useRef<TouchTexture>(new TouchTexture(sizeWidth));

  const uniforms = useMemo(
    () => ({
      uTouchTexture: {
        value: touchTexture.current.texture,
      },
      uTexture: {
        value: texture,
      },
      uTime: {
        value: 0.0,
      },
    }),
    [texture],
  );

  // particle positions
  const { angles } = useMemo(() => {
    const numParticles = sizeWidth * sizeHeight;
    const angles = new Float32Array(numParticles);

    for (let index = 0; index < numParticles; index++) {
      angles[index] = Math.random() * Math.PI; // Generate random angle
    }

    return {
      angles,
    };
  }, []);

  const onPointerMove = (event: ThreeEvent<MouseEvent>) => {
    touchTexture.current.addTouch({ x: event.point.x, y: event.point.y });
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
        args={[sizeWidth, sizeHeight]}
        position={[0, 0, 0]}
        visible={false}
        onPointerMove={onPointerMove}
      />
      <points ref={pointsRef}>
        <planeGeometry
          args={[sizeWidth, sizeHeight, sizeWidth - 1, sizeHeight - 1]}
        >
          <bufferAttribute
            attach="attributes-angle"
            count={angles.length}
            array={angles}
            itemSize={1}
          />
        </planeGeometry>
        <shaderMaterial
          ref={shaderRef}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

export default function Page({ params }: { params: { id: string } }) {
  const [music, setMusic] = useState<Music>(null!);

  useEffect(() => {
    getMusic(params.id).then((m) => {
      if (m.cover && m.musicId) {
        getCachedImage(m.musicId)
          .then((data) => {
            if (data) {
              m.cover = URL.createObjectURL(data as Blob);
              setMusic(m);
              return;
            }
            throw new Error();
          })
          .catch(() => {
            if (m.cover && m.musicId) {
              fetchAndCacheImage(m.cover, m.musicId).then(() => {
                if (m.cover && m.musicId) {
                  getCachedImage(m.musicId).then((data) => {
                    if (data) {
                      m.cover = URL.createObjectURL(data as Blob);
                      setMusic(m);
                    }
                  });
                }
              });
            }
          });
      }
    });
  }, [params.id]);

  if (music === null || music.cover === null) {
    return (
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
    );
  }

  return (
    <div style={{ height: "100%" }}>
      <div style={{ height: "20rem", width: "20rem" }}>
        <View far style={{ height: "100%" }}>
          <Cover url={music?.cover || "/next.svg"} />
        </View>
      </div>
      <Container>
        <Typography>{music?.name}</Typography>
        <Typography>{music?.description}</Typography>
        <Typography>{music?.author}</Typography>
        <Typography>{music?.uploadDate.toLocaleDateString()}</Typography>
      </Container>
    </div>
  );
}

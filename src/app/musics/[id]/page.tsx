"use client";

import {
  CSSProperties,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Music } from "@/lib/data/music";
import { getMusic } from "@/lib/firebase/firestore";
import dynamic from "next/dynamic";
import {
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  CircularProgress,
  Typography,
  Button,
} from "@mui/material";
import {
  ArrowBackOutlined,
  PlayArrowOutlined,
  PlaylistAddOutlined,
} from "@mui/icons-material";
import { useTexture } from "@react-three/drei";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import * as THREE from "three";
import TouchTexture from "@/_utils/touchTexture";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import GradientTexture from "@/_utils/gradientTexture";
import { Transition } from "react-transition-group";
import { useRouter } from "next/navigation";
import musicService from "@/_services/musicService";

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

type CoverProps = { url: string; rotate: boolean };

function Cover({ url, rotate }: CoverProps) {
  const texture = useTexture(url);
  const pointsRef = useRef<THREE.Points>(null!);
  const shaderRef = useRef<THREE.ShaderMaterial>(null!);
  const planeRef = useRef<THREE.Mesh>(null!);

  const sizeWidth = 512;
  const sizeHeight = 512;

  const gradientTexture = useRef<GradientTexture>(
    new GradientTexture(sizeWidth, sizeHeight),
  );
  const touchTexture = useRef<TouchTexture>(new TouchTexture(sizeWidth));

  const uniforms = useMemo(
    () => ({
      uTouchTexture: {
        value: touchTexture.current.texture,
      },
      uTexture: {
        value: texture,
      },
      uGradient: {
        value: gradientTexture.current.texture,
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
      <mesh ref={planeRef} visible={false} onPointerMove={onPointerMove}>
        <planeGeometry args={[sizeWidth, sizeHeight]} />
        <meshStandardMaterial side={THREE.DoubleSide} />
      </mesh>
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

function Move({
  in: inProp,
  children,
  duration = 300,
}: {
  in: boolean;
  children: ReactNode;
  duration?: number;
}) {
  const defaultStyle: CSSProperties = {
    transition: `transform ${duration}ms ease-in-out`,
    transform: "translateX(0)",
  };

  const transitionStyles: { [key: string]: CSSProperties } = {
    entering: { transform: "translateX(-8px)" },
    entered: { transform: "translateX(-8px)" },
    exiting: { transform: "translateX(0)" },
    exited: { transform: "translateX(0)" },
  };

  const nodeRef = useRef(null);
  return (
    <Transition nodeRef={nodeRef} in={inProp} timeout={duration}>
      {(state) => (
        <div
          ref={nodeRef}
          style={{
            ...defaultStyle,
            ...transitionStyles[state],
          }}
        >
          {children}
        </div>
      )}
    </Transition>
  );
}

export default function Page({ params }: { params: { id: string } }) {
  const [music, setMusic] = useState<Music>(null!);
  const [backButton, setBackButton] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getMusic(params.id).then((m) => {
      setMusic(m);
    });

    const sub = musicService.onPlayStateChange((state) => setIsPlaying(state));
    return () => sub.unsubscribe();
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
    <div style={{ height: "100%", padding: "2rem 2rem 2rem 2rem" }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          position: "fixed",
        }}
      >
        <View far style={{ height: "100%" }}>
          <Cover url={music?.cover || "/next.svg"} rotate={isPlaying} />
        </View>
      </div>

      <div style={{ display: "flex", height: "100%", flexDirection: "column" }}>
        <div style={{ display: "flex" }}>
          <Card variant="outlined">
            <CardActionArea
              onPointerEnter={() => setBackButton(true)}
              onPointerLeave={() => setBackButton(false)}
              onClick={() => router.back()}
            >
              <CardContent sx={{ display: "flex" }}>
                <Move in={backButton}>
                  <ArrowBackOutlined />
                </Move>
                <Typography display="inline">Back</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-end",
            height: "100%",
            width: "100%",
            margin: 0,
            padding: 0,
          }}
        >
          <Card variant="outlined" sx={{ maxWidth: 400 }}>
            <CardHeader title={music?.name} subheader={music?.author} />

            <CardContent>
              <div style={{ display: "flex" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    wordBreak: "break-all",
                  }}
                >
                  <Typography paragraph>{music?.description}</Typography>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      height: "100%",
                      alignItems: "flex-end",
                    }}
                  >
                    <Typography variant="caption">
                      Uploaded on: {music?.uploadDate.toLocaleDateString()}
                    </Typography>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "0 1rem",
                    gap: "0.5rem",
                  }}
                >
                  <Button
                    variant="outlined"
                    endIcon={<PlayArrowOutlined />}
                    onClick={() => {
                      musicService.music = music;
                      musicService.play();
                    }}
                  >
                    Play
                  </Button>
                  <Button variant="outlined" endIcon={<PlaylistAddOutlined />}>
                    Track
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

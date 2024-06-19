"use client";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  IconButton,
  Slider,
  Container,
  Typography,
  useMediaQuery,
  Stack,
  useTheme,
  SpeedDialAction,
  SpeedDialIcon,
  SpeedDial,
  Avatar,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  PlayArrowOutlined,
  PauseOutlined,
  VolumeUpOutlined,
  VolumeMuteOutlined,
  LoopOutlined,
  LibraryMusicOutlined,
  HomeOutlined,
  CloudUploadOutlined,
  ThreeDRotationOutlined,
  LoginOutlined,
  LogoutOutlined,
  PersonAddOutlined,
} from "@mui/icons-material";

import musicService from "@/_services/musicService";
import Grid from "@mui/system/Unstable_Grid";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "@/lib/firebase/auth";
import LoginModal from "@/components/login";
import { User } from "firebase/auth";
import RegisterModal from "@/components/register";
import UploadModal from "@/components/fileUpload";

const VisuallyHiddenInput = styled("input")({
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export default function BottomBar() {
  const [isPlaying, setIsPlaying] = useState<boolean>();
  const [volume, setVolume] = useState<number>(1.0);
  const [time, setTime] = useState<number>(0.0);
  const [duration, setDuration] = useState<number>(100.0);
  const [loop, setLoop] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null!);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("sm"));

  const upload = (event: any) => {
    musicService.src = URL.createObjectURL(event.target.files[0]);
  };

  const play = () => {
    setIsPlaying(true);
    musicService.play();
    setDuration(musicService.audio.duration);
  };

  const pause = () => {
    setIsPlaying(false);
    musicService.pause();
  };

  const toggle = () => {
    setIsPlaying(!isPlaying);

    if (!isPlaying) {
      play();
    } else {
      pause();
    }
  };

  const volumeChange = (_event: Event, newValue: number | number[]) => {
    setVolume(newValue as number);
    musicService.volume = newValue as number;
  };

  const mute = () => {
    setVolume(0.0);
    musicService.volume = 0.0;
  };

  useEffect(() => {
    const timeUpdate = () => {
      setTime(musicService.audio.currentTime);
    };

    musicService.audio.addEventListener("timeupdate", timeUpdate);
    musicService.onPlayStateChange((state) => {
      setIsPlaying(state);
    });

    return () => {
      musicService.audio.removeEventListener("timeupdate", timeUpdate);
    };
  }, []);

  // Update the audio playback position when the slider changes
  const updateSlider = (e: any) => {
    if (isPlaying) {
      pause();
    }
    const newTime = e.target.value;
    musicService.audio.currentTime = newTime;
    setTime(newTime);
  };

  const formatTime = (duration: number) => {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);

    const hoursStr = String(hours).padStart(2, "0");
    const minutesStr = String(minutes).padStart(2, "0");
    const secondsStr = String(seconds).padStart(2, "0");

    if (hours === 0) {
      return `${minutesStr}:${secondsStr}`;
    }
    if (minutes === 0) {
      return `${secondsStr}`;
    }
    return `${hoursStr}:${minutesStr}:${secondsStr}`;
  };

  const actions = useMemo(
    () => [
      {
        icon: <ThreeDRotationOutlined />,
        name: "Particles",
        action: () => router.push("/particles"),
      },
      {
        icon: <LibraryMusicOutlined />,
        name: "Musics",
        action: () => router.push("/musics"),
      },
      {
        icon: user === null ? <PersonAddOutlined /> : <CloudUploadOutlined />,
        name: user === null ? "Register" : "Upload",
        action: () => {
          user === null
            ? setRegisterModalOpen(!registerModalOpen)
            : setUploadModalOpen(!uploadModalOpen);
        },
      },
      {
        icon: user === null ? <LoginOutlined /> : <LogoutOutlined />,
        name: user === null ? "Login" : "Logout",
        action: () => {
          user === null ? setLoginModalOpen(!loginModalOpen) : signOut();
        },
      },
      { icon: <HomeOutlined />, name: "Home", action: () => router.push("/") },
    ],
    [loginModalOpen, registerModalOpen, router, uploadModalOpen, user],
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AppBar position="fixed" color="primary" sx={{ top: "auto", bottom: 0 }}>
      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
      <RegisterModal
        open={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
      />
      <UploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />
      <Toolbar>
        <Container>
          <SpeedDial
            ariaLabel="SpeedDial basic example"
            sx={{ position: "absolute", bottom: 20, right: 20 }}
            icon={<SpeedDialIcon />}
          >
            {actions.map((action) => (
              <SpeedDialAction
                key={action.name}
                icon={action.icon}
                tooltipTitle={action.name}
                tooltipOpen
                onClick={action.action}
              />
            ))}
            <VisuallyHiddenInput
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={upload}
            />
          </SpeedDial>

          <Grid container spacing={2}>
            <Grid xs={1}>
              <Avatar alt="No Image" src={musicService.music?.cover} />
            </Grid>

            <Grid xs={8}>
              <Stack direction="row" spacing={1} alignItems="center">
                <IconButton color="primary" onClick={toggle}>
                  {isPlaying ? <PauseOutlined /> : <PlayArrowOutlined />}
                </IconButton>

                <Slider
                  value={time}
                  onChange={updateSlider}
                  max={duration}
                  onChangeCommitted={() => {
                    play();
                  }}
                />

                <IconButton
                  onClick={() => {
                    setLoop(!loop);
                    musicService.audio.loop = !musicService.audio.loop;
                  }}
                >
                  <LoopOutlined color={loop ? "primary" : "inherit"} />
                </IconButton>

                <Typography>{formatTime(time || 0)}</Typography>
              </Stack>
            </Grid>

            <Grid xs={2} hidden={!matches}>
              <Stack direction="row" spacing={1} alignItems="center">
                <IconButton color="primary" onClick={mute}>
                  {volume !== 0 ? <VolumeUpOutlined /> : <VolumeMuteOutlined />}
                </IconButton>

                <Slider
                  value={volume}
                  max={1.0}
                  onChange={volumeChange}
                  step={0.01}
                />
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Toolbar>
    </AppBar>
  );
}

"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  IconButton,
  Slider,
  Container,
  Typography,
  useMediaQuery,
  Stack,
  useTheme,
  SpeedDialAction,
  SpeedDial,
  AppBar,
  Toolbar,
  Fade,
  Card,
  CardActionArea,
  Drawer,
} from "@mui/material";
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
  CloseOutlined,
  MoreHorizOutlined,
  EditOutlined,
} from "@mui/icons-material";

import musicService from "@/_services/musicService";
import Grid from "@mui/system/Unstable_Grid";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { onAuthStateChanged, signOut } from "@/lib/firebase/auth";
import LoginModal from "@/components/login";
import { User } from "firebase/auth";
import RegisterModal from "@/components/register";
import UploadModal from "@/components/fileUpload";
import { formatTime, shortener } from "@/_utils/formatUtils";
import { Music } from "@/lib/data/music";

function MusicBar() {
  const [isPlaying, setIsPlaying] = useState<boolean>();
  const [volume, setVolume] = useState<number>(1.0);
  const [time, setTime] = useState<number>(0.0);
  const [duration, setDuration] = useState<number>(100);
  const [loop, setLoop] = useState<boolean>(false);

  const play = () => {
    setIsPlaying(true);
    musicService.play();
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

  const updateSlider = (_: Event, value: number | number[]) => {
    if (isPlaying) {
      pause();
    }
    musicService.currentTime = value as number;
    setTime(value as number);
  };

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("sm"));

  return (
    <>
      <Grid xs={10} sm={7}>
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton color="primary" onClick={toggle}>
            {isPlaying ? <PauseOutlined /> : <PlayArrowOutlined />}
          </IconButton>

          <Slider
            value={time}
            onChange={updateSlider}
            max={duration}
            valueLabelDisplay="auto"
            valueLabelFormat={formatTime}
            onChangeCommitted={() => {
              play();
            }}
          />

          <IconButton
            onClick={() => {
              setLoop(!loop);
              musicService.loop = !musicService.loop;
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
    </>
  );
}

export default function BottomBar() {
  const [isPlaying, setIsPlaying] = useState<boolean>();
  const [volume, setVolume] = useState<number>(1.0);
  const [time, setTime] = useState<number>(0.0);
  const [duration, setDuration] = useState<number>(100);
  const [loop, setLoop] = useState<boolean>(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const [dialOpen, setDialOpen] = useState(false);
  const [music, setMusic] = useState<Music>({
    uid: "me",
    audio: "",
    author: "Nobody",
    tags: [],
    uploadDate: new Date(),
    name: "None",
    description: "Hosszu desc meg minden",
    cover: "/vercel.svg",
  });

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("sm"));

  const play = () => {
    setIsPlaying(true);
    musicService.play();
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
      setTime(musicService.currentTime);
    };

    musicService.timeUpdate(timeUpdate);
    const sub = musicService.onPlayStateChange((state) => {
      setIsPlaying(state);
      if (state) {
        setTime(musicService.currentTime);
        setDuration(musicService.duration);
      }
    });
    const musicSub = musicService.onMusicChange((music) => {
      setMusic(music);
      setDuration(100.0);
      setTime(0.0);
    });

    return () => {
      sub.unsubscribe();
      musicSub.unsubscribe();
      musicService.removerTimeUpdate(timeUpdate);
    };
  }, [duration, time]);

  // Update the audio playback position when the slider changes
  const updateSlider = (_: Event, value: number | number[]) => {
    if (isPlaying) {
      pause();
    }
    musicService.currentTime = value as number;
    setTime(value as number);
  };

  const actions = useMemo(
    () => [
      {
        icon: <EditOutlined />,
        name: "Text Editor",
        action: () => router.push("/editor"),
      },
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
    <>
      <AppBar
        color="primary"
        position="fixed"
        sx={{ m: 0, p: 0, bottom: 0, top: "auto" }}
      >
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
        <Toolbar style={{ margin: 0, padding: "0 1rem" }}>
          <Container style={{ margin: 0, padding: 0 }}>
            <SpeedDial
              ariaLabel="SpeedDial basic example"
              sx={{ position: "absolute", bottom: 20, right: 20 }}
              onOpen={() => setDialOpen(true)}
              onClose={() => setDialOpen(false)}
              icon={
                <>
                  <Fade in={!dialOpen} style={{ position: "absolute" }}>
                    <MoreHorizOutlined />
                  </Fade>
                  <Fade in={dialOpen}>
                    <CloseOutlined />
                  </Fade>
                </>
              }
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
            </SpeedDial>

            <Grid
              sx={{ m: 0, p: 0 }}
              container
              spacing={2}
              direction={matches ? "row" : "column"}
            >
              <Grid sx={{ m: 0, p: 0 }} xs="auto">
                <Card elevation={4} sx={{ boxShadow: "none" }}>
                  <CardActionArea sx={{ p: 0.5 }}>
                    <Stack sx={{ m: 0, p: 0 }} direction="row" spacing={2}>
                      <Image
                        src={music.cover || "vercel.svg"}
                        width={50}
                        height={50}
                        alt={music.name}
                      />
                      <Stack direction="column" spacing={0}>
                        <Typography>{shortener(music.name, 10)}</Typography>
                        <Typography variant="caption">
                          {shortener(music.description, 8)}
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardActionArea>
                </Card>
              </Grid>

              <Grid xs={10} sm={7}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconButton color="primary" onClick={toggle}>
                    {isPlaying ? <PauseOutlined /> : <PlayArrowOutlined />}
                  </IconButton>

                  <Slider
                    value={time}
                    onChange={updateSlider}
                    max={duration}
                    valueLabelDisplay="auto"
                    valueLabelFormat={formatTime}
                    onChangeCommitted={() => {
                      play();
                    }}
                  />

                  <IconButton
                    onClick={() => {
                      setLoop(!loop);
                      musicService.loop = !musicService.loop;
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
                    {volume !== 0 ? (
                      <VolumeUpOutlined />
                    ) : (
                      <VolumeMuteOutlined />
                    )}
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
      {!matches ? <Toolbar /> : ""}
      <Toolbar />
    </>
  );
}

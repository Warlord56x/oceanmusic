"use client";

import Link from "next/link";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import React, { useEffect, useState } from "react";
import {
  Button,
  IconButton,
  Slider,
  Container,
  Stack,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";
import {
  PlayArrowOutlined,
  PauseOutlined,
  VolumeUpOutlined,
  VolumeMuteOutlined,
  Home,
  LoopOutlined,
} from "@mui/icons-material";

import musicService from "@/app/_services/musicService";
import Grid from "@mui/system/Unstable_Grid";

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
  const [drawerState, setDrawerState] = useState<boolean>(false);
  const [loop, setLoop] = useState<boolean>(false);

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

  const toggleDrawer =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }

      setDrawerState(open);
    };

  return (
    <AppBar position="fixed" color="primary" sx={{ top: "auto", bottom: 0 }}>
      <Toolbar>
        <Container>
          <Grid container spacing={2}>
            <Grid xs="auto">
              <Button onClick={toggleDrawer(true)}>Drawer</Button>
              <Drawer
                anchor={"bottom"}
                open={drawerState}
                onClose={toggleDrawer(false)}
              >
                <List>
                  <ListItem>
                    <ListItemButton>
                      <ListItemIcon>
                        <CloudUploadIcon />
                      </ListItemIcon>
                      <ListItemText primary={"Upload file"} />
                      <VisuallyHiddenInput
                        type="file"
                        accept={"audio/*"}
                        onChange={upload}
                      />
                    </ListItemButton>
                  </ListItem>

                  <ListItem>
                    <ListItemButton>
                      <ListItemIcon>
                        <Home />
                      </ListItemIcon>
                      <Link href={"/"}>Back</Link>
                    </ListItemButton>
                  </ListItem>
                </List>
              </Drawer>
            </Grid>

            <Grid xs={5}>
              <Stack direction="row" spacing={2} alignItems="center">
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

            <Grid xs={2}>
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

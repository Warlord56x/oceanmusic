"use client";
import List from "@mui/material/List";
import React, { lazy, Suspense, useEffect, useState } from "react";
import { Container, ListItem, Skeleton, Typography } from "@mui/material";
import musicService from "@/_services/musicService";
import { getMusicsSnapshot } from "@/lib/firebase/firestore";
import { Music } from "@/lib/data/music";

const MusicItem = lazy(() => import("./music"));

export default function Musics() {
  const [musics, setMusics] = useState<Music[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const unsubscribe = getMusicsSnapshot((data) => {
      setMusics(data);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleListItemClick = (index: number, noPlay: boolean = false) => {
    setSelectedIndex(index);

    if (musicService.music !== musics[index]) {
      musicService.music = musics[index];
    }

    if (noPlay) return;
    musicService.play();
  };

  return (
    <Container>
      <Typography pt={2} variant="h3">
        List of musics
      </Typography>

      <List>
        {musics.map((music, index) => (
          <Suspense
            key={music.name + index}
            fallback={
              <ListItem>
                <Skeleton variant="circular" width={32} height={32} />
                <Skeleton
                  variant="text"
                  sx={{ fontSize: "2rem", width: "100%" }}
                />
              </ListItem>
            }
          >
            <MusicItem
              music={music}
              index={index}
              itemClick={handleListItemClick}
              selectedIndex={selectedIndex}
            />
          </Suspense>
        ))}
      </List>
    </Container>
  );
}

"use client";
import List from "@mui/material/List";
import React, { lazy, Suspense, useEffect, useState } from "react";
import {
  Container,
  ListItem,
  Pagination,
  Skeleton,
  Typography,
} from "@mui/material";
import musicService from "@/_services/musicService";
import { getMusicsSnapshot } from "@/lib/firebase/firestore";
import { Music } from "@/lib/data/music";

const MusicItem = lazy(() => import("./music"));

export default function Musics() {
  const [page, setPage] = useState(1);
  const [musics, setMusics] = useState<Music[]>([]);
  const [onPage, setOnPage] = useState<Music[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const unsubscribe = getMusicsSnapshot((data) => {
      setMusics(data);
      setOnPage(data.slice(0, 10));
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
        <Pagination
          count={musics.length % 10}
          page={page}
          onChange={(_, value) => {
            setPage(value);
            setOnPage(musics.slice((value - 1) * 10, value * 10));
          }}
        />
        {onPage.map((music, index) => (
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

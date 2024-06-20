import ListItemButton from "@mui/material/ListItemButton";
import {
  MoreVertOutlined,
  PauseOutlined,
  PlayArrowOutlined,
} from "@mui/icons-material";
import ListItemText from "@mui/material/ListItemText";
import { Music } from "@/lib/data/music";
import {
  Avatar,
  IconButton,
  ListItemAvatar,
  Menu,
  MenuItem,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { shortener } from "@/_utils/formatUtils";
import musicService from "@/_services/musicService";

type musicProps = {
  music: Music;
  index: number;
  selectedIndex: number;
  itemClick: (index: number) => void;
};

export default function MusicItem({
  music,
  itemClick,
  index,
  selectedIndex,
}: musicProps) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const sub = musicService.onPlayStateChange((state) => {
      if (music === musicService.music || !state) {
        setIsPlaying(state);
      }
    });
    return () => sub.unsubscribe();
  }, [music]);

  return (
    <ListItemButton
      key={music.name + index}
      selected={selectedIndex === index}
      onClick={() => itemClick(index)}
    >
      <ListItemAvatar>
        <Avatar alt={music.name} src={music.cover} />
      </ListItemAvatar>

      <ListItemText
        primary={music.name}
        secondary={shortener(music.description)}
      />

      <IconButton
        color="primary"
        onClick={(e) => {
          e.stopPropagation();
          itemClick(index);
          musicService.isPlaying ? musicService.pause() : musicService.play();
        }}
      >
        {isPlaying ? <PauseOutlined /> : <PlayArrowOutlined />}
      </IconButton>
      <IconButton color="primary" onClick={handleClick}>
        <MoreVertOutlined />
      </IconButton>

      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem
          onClick={() => {
            router.push(`/musics/${music.musicId}`);
          }}
        >
          Info
        </MenuItem>
        <MenuItem onClick={handleClose}>Add to track (coming soon...)</MenuItem>
      </Menu>
    </ListItemButton>
  );
}

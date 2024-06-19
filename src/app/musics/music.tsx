import ListItemButton from "@mui/material/ListItemButton";
import { MoreVertOutlined, PlayArrowOutlined } from "@mui/icons-material";
import ListItemText from "@mui/material/ListItemText";
import { Music } from "@/lib/data/music";
import {
  Avatar,
  IconButton,
  ListItemAvatar,
  Menu,
  MenuItem,
} from "@mui/material";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { shortener } from "@/_utils/formatUtils";

type musicProps = {
  music: Music;
  index: number;
  selectedIndex: number;
  itemClick: (index: number, ...args: any) => void;
};

export default function MusicItem({
  music,
  itemClick,
  index,
  selectedIndex,
}: musicProps) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <ListItemButton
      key={music.name + index}
      selected={selectedIndex === index}
      onClick={() => itemClick(index, true)}
    >
      <ListItemAvatar>
        <Avatar alt={music.name} src={music.cover} />
      </ListItemAvatar>

      <ListItemText
        primary={music.name}
        secondary={shortener(music.description)}
      />

      <IconButton color="primary" onClick={() => itemClick(index)}>
        <PlayArrowOutlined />
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

import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import { QueueMusicOutlined } from "@mui/icons-material";
import ListItemText from "@mui/material/ListItemText";
import { Music } from "@/lib/data/music";

type musicProps = {
  music: Music;
  index: number;
  selectedIndex: number;
  itemClick: (index: number) => void;
};

export default function musicItem({
  music,
  itemClick,
  index,
  selectedIndex,
}: musicProps) {
  return (
    <ListItemButton
      key={music.name + index}
      selected={selectedIndex === index}
      onClick={() => itemClick(index)}
    >
      <ListItemIcon>
        <QueueMusicOutlined />
      </ListItemIcon>

      <ListItemText primary={music.name} />
    </ListItemButton>
  );
}

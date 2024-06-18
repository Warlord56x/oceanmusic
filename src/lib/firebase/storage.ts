import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  UploadTaskSnapshot,
} from "firebase/storage";

import { storage } from "./clientApp";

import { Music } from "@/lib/data/music";
import { getUserId } from "@/lib/firebase/auth";
import { addMusic } from "@/lib/firebase/firestore";

function generateFirestoreId(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = 20;
  let id = "";
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < length; i++) {
    id += chars.charAt(randomValues[i] % chars.length);
  }

  return id;
}

export async function updateMusic(musicId: string, music: Music) {
  // TODO: update!
}

export function uploadMusic(
  name: string,
  file: File,
  taskListener: (snapshot: UploadTaskSnapshot) => void = () => {},
  completeCallback: () => void = () => {},
) {
  const id = generateFirestoreId();
  const filePath = `public/${getUserId() || "null"}/music/${id}/${file.name}`;
  const newMusicRef = ref(storage, filePath);
  const uploadTask = uploadBytesResumable(newMusicRef, file);

  uploadTask.on(
    "state_changed",
    taskListener,
    () => {},
    () => {
      getDownloadURL(newMusicRef).then((url) => {
        const music: Music = {
          audio: url,
          name: name,
          tags: [],
          uid: getUserId() || "null",
          uploadDate: new Date(),
        };
        addMusic(music, id).then(() => {
          completeCallback();
        });
      });
    },
  );

  return;
}

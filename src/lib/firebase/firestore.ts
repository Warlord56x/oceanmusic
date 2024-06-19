import {
  collection,
  doc,
  DocumentSnapshot,
  getDoc,
  onSnapshot,
  query,
  setDoc,
} from "firebase/firestore";

import { db } from "./clientApp";
import { Music } from "@/lib/data/music";

export function getMusicsSnapshot(cb: (value: Music[]) => void) {
  const q = query(collection(db, "music"));

  return onSnapshot(q, (querySnapshot) => {
    const results = querySnapshot.docs.map((doc) => {
      return convertToMusic(doc);
    });

    cb(results);
  });
}

function convertToMusic(doc: DocumentSnapshot | undefined) {
  let music = doc?.data();
  if (music) {
    music["musicId"] = doc?.id;
    music["uploadDate"] = music["uploadDate"].toDate();
  }
  return music as Music;
}

export async function getMusic(id: string) {
  return await getDoc(doc(db, `music/${id}`)).then((doc) => {
    return convertToMusic(doc);
  });
}

export async function addMusic(music: Music, id: string) {
  await setDoc(doc(db, "music", id), music);
}

export async function updateMusicReference(music: Music) {
  //TODO: make this work
}

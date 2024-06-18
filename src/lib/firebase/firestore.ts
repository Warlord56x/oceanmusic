import { collection, doc, onSnapshot, query, setDoc } from "firebase/firestore";

import { db } from "./clientApp";
import { Music } from "@/lib/data/music";

export function getMusicsSnapshot(cb: (value: Music[]) => void) {
  const q = query(collection(db, "music"));

  return onSnapshot(q, (querySnapshot) => {
    const results = querySnapshot.docs.map((doc) => {
      return doc.data() as Music;
    });

    cb(results);
  });
}

export async function addMusic(music: Music, id: string) {
  await setDoc(doc(db, "music", id), music);
}

export async function updateMusicReference(music: Music) {
  //TODO: make this work
}

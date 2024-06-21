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
import { getImage } from "@/lib/firebase/storage";
import { User } from "firebase/auth";

export function getMusicsSnapshot(cb: (value: Music[]) => void) {
  const q = query(collection(db, "music"));

  return onSnapshot(q, async (querySnapshot) => {
    const data = querySnapshot.docs.map((doc) => {
      return convertToMusic(doc);
    });

    const results = await Promise.all(data);

    cb(results);
  });
}

export async function addUser(user: User) {
  await setDoc(doc(db, "users", user.uid), {
    displayName: user.displayName,
    email: user.email,
  });
}

export async function getUser(id: string) {
  return await getDoc(doc(db, `users/${id}`)).then(async (doc) => {
    return doc.data() as User;
  });
}

async function convertToMusic(doc: DocumentSnapshot | undefined) {
  let music = doc?.data();
  if (music) {
    music["musicId"] = doc?.id;
    music["uploadDate"] = music["uploadDate"].toDate();
    const image = await getImage(music as Music);
    const user = await getUser((music as Music).uid);
    music["cover"] = image.cover;
    music["author"] = user?.displayName || "No name";
  }
  return music as Music;
}

export async function getMusic(id: string) {
  return await getDoc(doc(db, `music/${id}`)).then(async (doc) => {
    return await convertToMusic(doc);
  });
}

export async function addMusic(music: Music, id: string) {
  await setDoc(doc(db, "music", id), music);
}

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  UploadTaskSnapshot,
  StorageReference,
  UploadTask,
} from "firebase/storage";

import { storage } from "./clientApp";

import { Music } from "@/lib/data/music";
import { getUserId } from "@/lib/firebase/auth";
import { addMusic } from "@/lib/firebase/firestore";
import { forkJoin, from, Observable, switchMap } from "rxjs";

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
  cover: File,
  taskListener: (snapshot: UploadTaskSnapshot) => void = () => {},
  completeCallback: () => void = () => {},
) {
  const id = generateFirestoreId();
  const filePath = `public/${getUserId() || "null"}/music/${id}/${file.name}`;
  const fileCoverPath = `public/${getUserId() || "null"}/image/${id}/${cover.name}`;
  const newMusicRef = ref(storage, filePath);
  const newCoverRef = ref(storage, fileCoverPath);

  const uploadTaskToObservable = (
    uploadTask: UploadTask,
    ref: StorageReference,
  ) => {
    return new Observable((observer) => {
      uploadTask.on(
        "state_changed",
        taskListener,
        (error) => observer.error(error),
        () => {
          getDownloadURL(ref)
            .then((url) => {
              observer.next(url);
              observer.complete();
            })
            .catch((error) => observer.error(error));
        },
      );
    });
  };

  const musicUpload$ = uploadTaskToObservable(
    uploadBytesResumable(newMusicRef, file),
    newMusicRef,
  );
  const coverUpload$ = uploadTaskToObservable(
    uploadBytesResumable(newCoverRef, cover),
    newCoverRef,
  );

  forkJoin([musicUpload$, coverUpload$])
    .pipe(
      switchMap(([musicUrl, coverUrl]) => {
        const music: Music = {
          audio: musicUrl as string,
          cover: coverUrl as string,
          name: name,
          tags: [],
          uid: getUserId(),
          uploadDate: new Date(),
        };
        return from(addMusic(music, id));
      }),
    )
    .subscribe({
      next: () => completeCallback(),
      error: (error) => console.error("Error during upload:", error),
    });

  return;
}

import { Timestamp } from "@firebase/firestore";

export function shortener(str: string | undefined, maxChars: number = 18) {
  if (!str) return "";
  return str.slice(0, maxChars) + (str.length > maxChars ? "..." : "");
}

export function formatTime(duration: number) {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = Math.floor(duration % 60);

  const hoursStr = String(hours).padStart(2, "0");
  const minutesStr = String(minutes).padStart(2, "0");
  const secondsStr = String(seconds).padStart(2, "0");

  if (hours === 0) {
    return `${minutesStr}:${secondsStr}`;
  }
  if (minutes === 0) {
    return `${secondsStr}`;
  }
  return `${hoursStr}:${minutesStr}:${secondsStr}`;
}

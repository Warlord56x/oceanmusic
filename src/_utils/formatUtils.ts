import { Timestamp } from "@firebase/firestore";

export function shortener(str: string | undefined, maxChars: number = 18) {
  if (!str) return "";
  return str.slice(0, maxChars) + (str.length > maxChars ? "..." : "");
}

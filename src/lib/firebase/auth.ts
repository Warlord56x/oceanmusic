import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged as _onAuthStateChanged,
} from "firebase/auth";

import { auth } from "./clientApp";

let user: User | null;

export function getUserId() {
  return user!.uid;
}

export function onAuthStateChanged(cb: (user: User | null) => void) {
  return _onAuthStateChanged(auth, (_user) => {
    user = _user;
    cb(user);
  });
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();

  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    throw error;
  }
}

export async function signUp(
  displayName: string,
  email: string,
  password: string,
) {
  try {
    await createUserWithEmailAndPassword(auth, email, password).then((user) => {
      updateProfile(user.user, { displayName: displayName });
    });
  } catch (error) {
    throw error;
  }
}

export async function signInWithEmail(email: string, password: string) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw error;
  }
}

export async function signOut() {
  try {
    return auth.signOut();
  } catch (error) {
    console.error("Error signing out", error);
  }
}

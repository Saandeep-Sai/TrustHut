import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../firebase';
import { registerUser } from './api';

export const signup = async (name, email, password) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  // Register user in Firestore via Django
  await registerUser({ name, email });
  return cred.user;
};

export const login = async (email, password) => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
};

export const logout = async () => {
  await signOut(auth);
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

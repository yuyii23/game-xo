import { ref, Ref } from "vue";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";

const user: Ref<User | null> = ref(null);
const error: Ref<string | null> = ref(null);

export function useAuth() {
  const register = async (email: string, password: string): Promise<void> => {
    error.value = null;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      user.value = userCredential.user;
    } catch (err: any) {
      error.value = err.message;
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    error.value = null;
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      user.value = userCredential.user;
    } catch (err: any) {
      error.value = err.message;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      user.value = null;
    } catch (err: any) {
      error.value = err.message;
    }
  };

  return { user, error, register, login, logout };
}

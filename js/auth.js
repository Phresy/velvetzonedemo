import { 
  auth, 
  googleProvider,
  db
} from './firebase-config.js';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendEmailVerification,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
  doc, 
  setDoc, 
  getDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Auth State Observer
export function initAuthStateListener() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          localStorage.setItem("userRole", userData.role);
          localStorage.setItem("displayName", userData.displayName || user.displayName || "User");
        }
        resolve(user);
      } else {
        // User is signed out
        localStorage.removeItem("userRole");
        localStorage.removeItem("displayName");
        resolve(null);
      }
    });
    return unsubscribe;
  });
}

// Email/Password Sign Up
export async function signUpWithEmail(email, password, displayName, role) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    await sendEmailVerification(userCredential.user);

    // Create user document in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      uid: userCredential.user.uid,
      displayName,
      email,
      role,
      createdAt: new Date(),
      emailVerified: false
    });

    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("Sign up error:", error);
    return { success: false, error: error.message };
  }
}

// Email/Password Login
export async function loginWithEmail(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: error.message };
  }
}

// Google Sign-In
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      // Create new user document if doesn't exist
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        role: "client", // Default role
        createdAt: new Date(),
        emailVerified: user.emailVerified
      });
    }

    return { success: true, user };
  } catch (error) {
    console.error("Google sign-in error:", error);
    return { success: false, error: error.message };
  }
}

// Logout
export async function logoutUser() {
  try {
    await signOut(auth);
    localStorage.clear();
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, error: error.message };
  }
}

// Password Reset
export async function sendPasswordResetEmail(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error("Password reset error:", error);
    return { success: false, error: error.message };
  }
}
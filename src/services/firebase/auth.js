import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from './config';
import usersService from './users';

const googleProvider = new GoogleAuthProvider();

export const authService = {
  // Email/Password Auth
  async signUp(email, password, displayName) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    
    // Register user in Firestore
    await usersService.registerUser(userCredential.user);
    
    return userCredential.user;
  },

  async signIn(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Update last login and ensure user is in Firestore
    await usersService.registerUser(userCredential.user);
    await usersService.updateLastLogin(userCredential.user.uid);
    
    return userCredential.user;
  },

  // Google Auth
  async signInWithGoogle() {
    const userCredential = await signInWithPopup(auth, googleProvider);
    
    // Register user in Firestore if not exists
    await usersService.registerUser(userCredential.user);
    await usersService.updateLastLogin(userCredential.user.uid);
    
    return userCredential.user;
  },

  async signOut() {
    await signOut(auth);
  },

  // Auth state observer
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  },

  getCurrentUser() {
    return auth.currentUser;
  },

  // Update user profile
  async updateProfile(profileData) {
    const user = auth.currentUser;
    if (!user) throw new Error('No user is currently signed in');
    
    await updateProfile(user, profileData);
    return user;
  }
};
import { db } from './config';
import { 
  collection, 
  doc,
  setDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';

const USERS_COLLECTION = 'users';

export const usersService = {
  // Register user in Firestore when they sign up
  async registerUser(user) {
    try {
      const userRef = doc(db, USERS_COLLECTION, user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email.toLowerCase(),
        displayName: user.displayName || '',
        photoURL: user.photoURL || null,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      }, { merge: true });
      
      console.log('User registered in Firestore:', user.email);
      return true;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  },

  // Update user last login
  async updateLastLogin(uid) {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      await setDoc(userRef, {
        lastLoginAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  },

  // Find user by email
  async getUserByEmail(email) {
    try {
      const usersRef = collection(db, USERS_COLLECTION);
      const q = query(
        usersRef,
        where('email', '==', email.toLowerCase())
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const userDoc = querySnapshot.docs[0];
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  },

  // Check if user exists
  async userExists(email) {
    try {
      const user = await this.getUserByEmail(email);
      return user !== null;
    } catch (error) {
      console.error('Error checking if user exists:', error);
      return false;
    }
  }
};

export default usersService;
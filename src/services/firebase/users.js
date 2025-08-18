import { db } from './config';
import { 
  collection, 
  doc,
  setDoc,
  getDoc,
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
      console.log('Searching for user with email:', email.toLowerCase());
      
      const usersRef = collection(db, USERS_COLLECTION);
      const q = query(
        usersRef,
        where('email', '==', email.toLowerCase())
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.warn('User not found in Firestore users collection:', email.toLowerCase());
        
        // Attempt to get all users for debugging (limit to 10)
        const allUsersQuery = query(usersRef);
        const allUsersSnapshot = await getDocs(allUsersQuery);
        const allEmails = allUsersSnapshot.docs.slice(0, 10).map(doc => doc.data().email);
        console.log('Available emails in users collection (first 10):', allEmails);
        
        return null;
      }
      
      const userDoc = querySnapshot.docs[0];
      const userData = {
        id: userDoc.id,
        ...userDoc.data()
      };
      
      console.log('User found in Firestore:', { id: userData.id, email: userData.email });
      return userData;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  },

  // Get user by UID
  async getUserByUid(uid) {
    try {
      console.log('Searching for user with UID:', uid);
      
      const userRef = doc(db, USERS_COLLECTION, uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.warn('User not found in Firestore users collection:', uid);
        return null;
      }
      
      const userData = {
        id: userDoc.id,
        ...userDoc.data()
      };
      
      console.log('User found in Firestore:', { id: userData.id, email: userData.email });
      return userData;
    } catch (error) {
      console.error('Error getting user by UID:', error);
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
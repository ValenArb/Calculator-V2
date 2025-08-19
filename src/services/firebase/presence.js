import { db } from './config';
import { 
  collection, 
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';

const PRESENCE_COLLECTION = 'user_presence';

class PresenceService {
  constructor() {
    this.activeUsers = new Map();
    this.unsubscribers = new Map();
    this.heartbeatInterval = null;
    this.currentProjectId = null;
    this.currentUser = null;
  }

  // Start tracking user presence in a project
  async startPresence(projectId, user) {
    try {
      this.currentProjectId = projectId;
      this.currentUser = user;

      const presenceRef = doc(db, PRESENCE_COLLECTION, `${projectId}_${user.uid}`);
      
      // Set initial presence
      await setDoc(presenceRef, {
        userId: user.uid,
        projectId: projectId,
        displayName: user.displayName || user.email,
        email: user.email,
        photoURL: user.photoURL || null,
        status: 'online',
        lastSeen: serverTimestamp(),
        joinedAt: serverTimestamp()
      });

      // Start heartbeat to maintain presence
      this.startHeartbeat(presenceRef);

      // Listen for when user goes offline
      this.setupOfflineDetection(presenceRef);

      console.log('✅ Presence started for project:', projectId);
    } catch (error) {
      console.error('❌ Error starting presence:', error);
    }
  }

  // Stop tracking presence
  async stopPresence() {
    try {
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }

      if (this.currentProjectId && this.currentUser) {
        const presenceRef = doc(db, PRESENCE_COLLECTION, `${this.currentProjectId}_${this.currentUser.uid}`);
        await deleteDoc(presenceRef);
      }

      this.currentProjectId = null;
      this.currentUser = null;

      console.log('✅ Presence stopped');
    } catch (error) {
      console.error('❌ Error stopping presence:', error);
    }
  }

  // Start heartbeat to maintain online status
  startHeartbeat(presenceRef) {
    // Update presence every 30 seconds
    this.heartbeatInterval = setInterval(async () => {
      try {
        await setDoc(presenceRef, {
          lastSeen: serverTimestamp(),
          status: 'online'
        }, { merge: true });
      } catch (error) {
        console.error('❌ Error updating heartbeat:', error);
      }
    }, 30000);
  }

  // Setup offline detection
  setupOfflineDetection(presenceRef) {
    // Listen for page visibility changes
    document.addEventListener('visibilitychange', async () => {
      if (document.hidden) {
        // User switched tabs or minimized window
        await setDoc(presenceRef, {
          status: 'away',
          lastSeen: serverTimestamp()
        }, { merge: true });
      } else {
        // User is back
        await setDoc(presenceRef, {
          status: 'online',
          lastSeen: serverTimestamp()
        }, { merge: true });
      }
    });

    // Clean up on page unload
    window.addEventListener('beforeunload', async () => {
      await this.stopPresence();
    });
  }

  // Listen to active users in a project
  onActiveUsersChange(projectId, callback) {
    // Simplified query without orderBy to avoid composite index requirement
    const presenceQuery = query(
      collection(db, PRESENCE_COLLECTION),
      where('projectId', '==', projectId)
    );

    const unsubscriber = onSnapshot(presenceQuery, (snapshot) => {
      const activeUsers = [];
      const now = Date.now();

      snapshot.forEach((doc) => {
        const data = doc.data();
        const lastSeen = data.lastSeen?.toDate?.() || new Date(0);
        const timeSinceLastSeen = now - lastSeen.getTime();

        // Consider user active if seen within last 2 minutes
        if (timeSinceLastSeen < 2 * 60 * 1000) {
          activeUsers.push({
            id: doc.id,
            ...data,
            lastSeenTimestamp: lastSeen
          });
        }
      });

      // Sort by joinedAt in JavaScript instead of Firestore
      activeUsers.sort((a, b) => {
        const dateA = a.joinedAt?.toDate?.() || new Date(0);
        const dateB = b.joinedAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime(); // desc order
      });

      callback(activeUsers);
    });

    // Store unsubscriber for cleanup
    this.unsubscribers.set(projectId, unsubscriber);
    return unsubscriber;
  }

  // Stop listening to active users
  stopListening(projectId) {
    const unsubscriber = this.unsubscribers.get(projectId);
    if (unsubscriber) {
      unsubscriber();
      this.unsubscribers.delete(projectId);
    }
  }

  // Get user status color
  getStatusColor(status) {
    switch (status) {
      case 'online':
        return '#10b981'; // green-500
      case 'away':
        return '#f59e0b'; // amber-500
      default:
        return '#6b7280'; // gray-500
    }
  }

  // Cleanup all listeners
  cleanup() {
    this.stopPresence();
    this.unsubscribers.forEach(unsubscriber => unsubscriber());
    this.unsubscribers.clear();
  }
}

// Create and export singleton instance
const presenceService = new PresenceService();

export default presenceService;

export { presenceService };
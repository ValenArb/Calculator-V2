import { db } from './config';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  where,
  onSnapshot
} from 'firebase/firestore';
import { notificationsService } from './notifications';

class AdminsService {
  constructor() {
    this.adminsCollection = 'admins';
    this.invitationsCollection = 'adminInvitations';
  }

  // Get all administrators
  async getAllAdmins() {
    try {
      const adminsRef = collection(db, this.adminsCollection);
      const adminsQuery = query(adminsRef, orderBy('addedAt', 'desc'));
      const snapshot = await getDocs(adminsQuery);
      
      const admins = [];
      snapshot.forEach(doc => {
        admins.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return admins;
    } catch (error) {
      console.error('Error fetching administrators:', error);
      throw error;
    }
  }

  // Add a new administrator
  async addAdmin(email, addedBy) {
    try {
      const adminsRef = collection(db, this.adminsCollection);
      const adminId = email.toLowerCase().replace(/[^a-z0-9]/g, '_');
      
      const adminDoc = {
        email: email.toLowerCase(),
        originalEmail: email,
        addedBy: addedBy,
        addedAt: serverTimestamp(),
        isActive: true,
        permissions: {
          canAddErrorCodes: true,
          canInviteAdmins: true,
          canManageAdmins: true
        }
      };
      
      await setDoc(doc(adminsRef, adminId), adminDoc);
      
      // Send notification
      try {
        await notificationsService.notifyAdminInvited(email, addedBy);
      } catch (notificationError) {
        console.warn('Failed to send notification:', notificationError);
      }
      
      return adminId;
    } catch (error) {
      console.error('Error adding administrator:', error);
      throw error;
    }
  }

  // Remove an administrator
  async removeAdmin(adminId, removedBy) {
    try {
      // Get admin info before deletion
      const adminRef = doc(db, this.adminsCollection, adminId);
      const adminDoc = await getDocs(query(collection(db, this.adminsCollection), where('__name__', '==', adminId)));
      let removedEmail = 'Unknown';
      
      if (!adminDoc.empty) {
        removedEmail = adminDoc.docs[0].data().email;
      }
      
      await deleteDoc(adminRef);
      
      // Send notification
      try {
        await notificationsService.notifyAdminRemoved(removedEmail, removedBy);
      } catch (notificationError) {
        console.warn('Failed to send notification:', notificationError);
      }
    } catch (error) {
      console.error('Error removing administrator:', error);
      throw error;
    }
  }

  // Check if email is admin (Firebase version)
  async isAdminInFirebase(email) {
    try {
      const adminsRef = collection(db, this.adminsCollection);
      const q = query(
        adminsRef, 
        where('email', '==', email.toLowerCase()),
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  // Send invitation to become admin
  async sendAdminInvitation(email, invitedBy, message = '') {
    try {
      const invitationsRef = collection(db, this.invitationsCollection);
      const invitationId = email.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();
      
      const invitationDoc = {
        email: email.toLowerCase(),
        originalEmail: email,
        invitedBy: invitedBy,
        invitedAt: serverTimestamp(),
        message: message,
        status: 'pending', // pending, accepted, rejected, expired
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      };
      
      await setDoc(doc(invitationsRef, invitationId), invitationDoc);
      
      // In a real app, you would send an email here
      // For now, we'll just add them directly as admin
      await this.addAdmin(email, invitedBy);
      
      return invitationId;
    } catch (error) {
      console.error('Error sending admin invitation:', error);
      throw error;
    }
  }

  // Get pending invitations
  async getPendingInvitations() {
    try {
      const invitationsRef = collection(db, this.invitationsCollection);
      const q = query(
        invitationsRef, 
        where('status', '==', 'pending'),
        orderBy('invitedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const invitations = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        // Check if invitation is not expired
        if (data.expiresAt && data.expiresAt.toDate() > new Date()) {
          invitations.push({
            id: doc.id,
            ...data
          });
        }
      });
      
      return invitations;
    } catch (error) {
      console.error('Error fetching invitations:', error);
      throw error;
    }
  }

  // Listen to admin changes (real-time)
  onAdminsChange(callback) {
    const adminsRef = collection(db, this.adminsCollection);
    const q = query(adminsRef, orderBy('addedAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const admins = [];
      snapshot.forEach(doc => {
        admins.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(admins);
    }, (error) => {
      console.error('Error listening to admins:', error);
      callback([]);
    });
  }

  // Initialize default admin accounts
  async initializeDefaultAdmins() {
    try {
      const defaultAdmins = [
        'valenarbert@gmail.com',
        'admin@calculadoraelectrica.com'
      ];

      for (const email of defaultAdmins) {
        const isAlreadyAdmin = await this.isAdminInFirebase(email);
        if (!isAlreadyAdmin) {
          await this.addAdmin(email, 'system');
          console.log(`Added default admin: ${email}`);
        }
      }
    } catch (error) {
      console.error('Error initializing default admins:', error);
      throw error;
    }
  }

  // Update admin permissions
  async updateAdminPermissions(adminId, permissions) {
    try {
      const adminRef = doc(db, this.adminsCollection, adminId);
      await setDoc(adminRef, { 
        permissions,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating admin permissions:', error);
      throw error;
    }
  }

  // Deactivate admin (instead of deleting)
  async deactivateAdmin(adminId) {
    try {
      const adminRef = doc(db, this.adminsCollection, adminId);
      await setDoc(adminRef, { 
        isActive: false,
        deactivatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error deactivating admin:', error);
      throw error;
    }
  }

  // Reactivate admin
  async reactivateAdmin(adminId) {
    try {
      const adminRef = doc(db, this.adminsCollection, adminId);
      await setDoc(adminRef, { 
        isActive: true,
        reactivatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error reactivating admin:', error);
      throw error;
    }
  }
}

export const adminsService = new AdminsService();
export default adminsService;
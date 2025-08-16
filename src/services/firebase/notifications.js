import { db } from './config';
import { 
  collection, 
  doc, 
  addDoc,
  getDocs, 
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';

class NotificationsService {
  constructor() {
    this.notificationsCollection = 'notifications';
  }

  // Notification types
  static TYPES = {
    ADMIN_INVITED: 'admin_invited',
    ADMIN_REMOVED: 'admin_removed', 
    ERROR_CODE_ADDED: 'error_code_added',
    MANUFACTURER_ADDED: 'manufacturer_added',
    LINE_ADDED: 'line_added',
    SUBLINE_ADDED: 'subline_added',
    SYSTEM_UPDATE: 'system_update',
    PROJECT_INVITATION: 'project_invitation',
    INVITATION_RESPONSE: 'invitation_response'
  };

  // Notification priorities
  static PRIORITIES = {
    LOW: 'low',
    MEDIUM: 'medium', 
    HIGH: 'high',
    URGENT: 'urgent'
  };

  // Create a new notification
  async createNotification({
    type,
    title,
    message,
    recipientEmail = null, // null means all admins
    recipientUid = null, // for project invitations
    priority = NotificationsService.PRIORITIES.MEDIUM,
    actionBy,
    metadata = {},
    status = null // for invitations: pending, accepted, rejected
  }) {
    try {
      const notificationsRef = collection(db, this.notificationsCollection);
      
      const notificationDoc = {
        type,
        title,
        message,
        recipientEmail: recipientEmail ? recipientEmail.toLowerCase() : null,
        recipientUid,
        priority,
        actionBy,
        metadata,
        status,
        isRead: false,
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      };

      const docRef = await addDoc(notificationsRef, notificationDoc);
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Get notifications for a specific user
  async getUserNotifications(userEmail, unreadOnly = false, limitCount = 50) {
    try {
      const notificationsRef = collection(db, this.notificationsCollection);
      
      let q = query(
        notificationsRef,
        where('recipientEmail', 'in', [userEmail.toLowerCase(), null]),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      if (unreadOnly) {
        q = query(
          notificationsRef,
          where('recipientEmail', 'in', [userEmail.toLowerCase(), null]),
          where('isRead', '==', false),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );
      }

      const snapshot = await getDocs(q);
      const notifications = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        // Check if notification is not expired
        if (!data.expiresAt || data.expiresAt.toDate() > new Date()) {
          notifications.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate()
          });
        }
      });

      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const notificationRef = doc(db, this.notificationsCollection, notificationId);
      await updateDoc(notificationRef, {
        isRead: true,
        readAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all user notifications as read
  async markAllAsRead(userEmail) {
    try {
      const notificationsRef = collection(db, this.notificationsCollection);
      const q = query(
        notificationsRef,
        where('recipientEmail', 'in', [userEmail.toLowerCase(), null]),
        where('isRead', '==', false)
      );

      const snapshot = await getDocs(q);
      const updatePromises = [];

      snapshot.forEach(doc => {
        const notificationRef = doc.ref;
        updatePromises.push(
          updateDoc(notificationRef, {
            isRead: true,
            readAt: serverTimestamp()
          })
        );
      });

      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      const notificationRef = doc(db, this.notificationsCollection, notificationId);
      await deleteDoc(notificationRef);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Listen to real-time notifications for a user
  onNotificationsChange(userEmail, callback) {
    const notificationsRef = collection(db, this.notificationsCollection);
    const q = query(
      notificationsRef,
      where('recipientEmail', 'in', [userEmail.toLowerCase(), null]),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        // Check if notification is not expired
        if (!data.expiresAt || data.expiresAt.toDate() > new Date()) {
          notifications.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate()
          });
        }
      });
      callback(notifications);
    }, (error) => {
      console.error('Error listening to notifications:', error);
      callback([]);
    });
  }

  // Get unread count for a user
  async getUnreadCount(userEmail) {
    try {
      const notificationsRef = collection(db, this.notificationsCollection);
      const q = query(
        notificationsRef,
        where('recipientEmail', 'in', [userEmail.toLowerCase(), null]),
        where('isRead', '==', false)
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Specific notification creators
  async notifyAdminInvited(invitedEmail, invitedBy) {
    return await this.createNotification({
      type: NotificationsService.TYPES.ADMIN_INVITED,
      title: 'Nuevo Administrador Agregado',
      message: `${invitedEmail} ha sido invitado como administrador por ${invitedBy}`,
      priority: NotificationsService.PRIORITIES.HIGH,
      actionBy: invitedBy,
      metadata: {
        invitedEmail,
        action: 'admin_invite'
      }
    });
  }

  async notifyAdminRemoved(removedEmail, removedBy) {
    return await this.createNotification({
      type: NotificationsService.TYPES.ADMIN_REMOVED,
      title: 'Administrador Removido',
      message: `${removedEmail} ha sido removido como administrador por ${removedBy}`,
      priority: NotificationsService.PRIORITIES.HIGH,
      actionBy: removedBy,
      metadata: {
        removedEmail,
        action: 'admin_remove'
      }
    });
  }

  async notifyErrorCodeAdded(errorCode, manufacturer, line, addedBy) {
    return await this.createNotification({
      type: NotificationsService.TYPES.ERROR_CODE_ADDED,
      title: 'Nuevo Código de Error Agregado',
      message: `Se agregó el código ${errorCode} para ${manufacturer} - ${line} por ${addedBy}`,
      priority: NotificationsService.PRIORITIES.MEDIUM,
      actionBy: addedBy,
      metadata: {
        errorCode,
        manufacturer,
        line,
        action: 'error_code_add'
      }
    });
  }

  async notifyManufacturerAdded(manufacturerName, addedBy) {
    return await this.createNotification({
      type: NotificationsService.TYPES.MANUFACTURER_ADDED,
      title: 'Nuevo Fabricante Agregado',
      message: `Se agregó el fabricante ${manufacturerName} por ${addedBy}`,
      priority: NotificationsService.PRIORITIES.MEDIUM,
      actionBy: addedBy,
      metadata: {
        manufacturerName,
        action: 'manufacturer_add'
      }
    });
  }

  async notifyLineAdded(lineName, manufacturerName, addedBy) {
    return await this.createNotification({
      type: NotificationsService.TYPES.LINE_ADDED,
      title: 'Nueva Línea de Producto Agregada',
      message: `Se agregó la línea ${lineName} para ${manufacturerName} por ${addedBy}`,
      priority: NotificationsService.PRIORITIES.MEDIUM,
      actionBy: addedBy,
      metadata: {
        lineName,
        manufacturerName,
        action: 'line_add'
      }
    });
  }

  async notifySubLineAdded(subLineName, lineName, manufacturerName, addedBy) {
    return await this.createNotification({
      type: NotificationsService.TYPES.SUBLINE_ADDED,
      title: 'Nueva Sub-línea Agregada',
      message: `Se agregó la sub-línea ${subLineName} para ${manufacturerName} - ${lineName} por ${addedBy}`,
      priority: NotificationsService.PRIORITIES.MEDIUM,
      actionBy: addedBy,
      metadata: {
        subLineName,
        lineName,
        manufacturerName,
        action: 'subline_add'
      }
    });
  }

  async notifySystemUpdate(title, message, priority = NotificationsService.PRIORITIES.MEDIUM) {
    return await this.createNotification({
      type: NotificationsService.TYPES.SYSTEM_UPDATE,
      title,
      message,
      priority,
      actionBy: 'system',
      metadata: {
        action: 'system_update'
      }
    });
  }

  // Project invitation notifications
  async createProjectInvitation({
    recipientEmail,
    senderUid,
    senderName,
    senderEmail,
    projectId,
    projectName,
    message
  }) {
    return await this.createNotification({
      type: NotificationsService.TYPES.PROJECT_INVITATION,
      title: `Invitación al proyecto: ${projectName}`,
      message: message || `${senderName} te ha invitado a colaborar en el proyecto "${projectName}"`,
      recipientEmail: recipientEmail.toLowerCase(),
      priority: NotificationsService.PRIORITIES.HIGH,
      actionBy: senderUid,
      status: 'pending',
      metadata: {
        senderUid,
        senderName,
        senderEmail,
        projectId,
        projectName,
        action: 'project_invite'
      }
    });
  }

  async respondToProjectInvitation(notificationId, response, respondingUid) {
    try {
      const notificationRef = doc(db, this.notificationsCollection, notificationId);
      await updateDoc(notificationRef, {
        status: response, // 'accepted' or 'rejected'
        isRead: true,
        respondedAt: serverTimestamp(),
        respondingUid
      });
      return true;
    } catch (error) {
      console.error('Error responding to invitation:', error);
      throw error;
    }
  }

  async createInvitationResponse({
    recipientUid,
    senderName,
    projectId,
    projectName,
    response
  }) {
    const responseMessage = response === 'accepted' 
      ? `${senderName} ha aceptado tu invitación al proyecto "${projectName}"`
      : `${senderName} ha rechazado tu invitación al proyecto "${projectName}"`;

    return await this.createNotification({
      type: NotificationsService.TYPES.INVITATION_RESPONSE,
      title: `Respuesta a invitación: ${projectName}`,
      message: responseMessage,
      recipientUid,
      priority: NotificationsService.PRIORITIES.MEDIUM,
      actionBy: 'system',
      metadata: {
        projectId,
        projectName,
        response,
        action: 'invitation_response'
      }
    });
  }

  // Clean up expired notifications
  async cleanupExpiredNotifications() {
    try {
      const notificationsRef = collection(db, this.notificationsCollection);
      const q = query(
        notificationsRef,
        where('expiresAt', '<', new Date())
      );

      const snapshot = await getDocs(q);
      const deletePromises = [];

      snapshot.forEach(doc => {
        deletePromises.push(deleteDoc(doc.ref));
      });

      await Promise.all(deletePromises);
      console.log(`Cleaned up ${deletePromises.length} expired notifications`);
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
      throw error;
    }
  }
}

export const notificationsService = new NotificationsService();
export { NotificationsService };
export default notificationsService;
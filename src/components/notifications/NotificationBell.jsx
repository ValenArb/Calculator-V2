import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Bell, X, Check, CheckCheck, Trash2, Clock, AlertTriangle, Info, UserPlus, Plus } from 'lucide-react';
import { notificationsService } from '../../services/firebase/notifications';
import { isCurrentUserAdmin } from '../../utils/adminUtils';

const NotificationBell = () => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = isCurrentUserAdmin(user);
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Get priority icon and color
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return { icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-100' };
      case 'high':
        return { icon: AlertTriangle, color: 'text-orange-600', bgColor: 'bg-orange-100' };
      case 'medium':
        return { icon: Info, color: 'text-blue-600', bgColor: 'bg-blue-100' };
      case 'low':
      default:
        return { icon: Info, color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
  };

  // Get notification type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case 'admin_invited':
      case 'admin_removed':
        return UserPlus;
      case 'error_code_added':
      case 'manufacturer_added':
      case 'line_added':
      case 'subline_added':
        return Plus;
      case 'system_update':
      default:
        return Bell;
    }
  };

  // Format time ago
  const formatTimeAgo = (date) => {
    if (!date) return '';
    
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 30) return `${days}d`;
    return new Date(date).toLocaleDateString();
  };

  // Load notifications
  useEffect(() => {
    if (!user?.email || !isAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Set up real-time listener
    const unsubscribe = notificationsService.onNotificationsChange(
      user.email,
      (newNotifications) => {
        setNotifications(newNotifications);
        const unread = newNotifications.filter(n => !n.isRead).length;
        setUnreadCount(unread);
        setLoading(false);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.email, isAdmin]);

  // Handle mark as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationsService.markAsRead(notificationId);
      // The real-time listener will update the state automatically
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead(user.email);
      // The real-time listener will update the state automatically
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Handle delete notification
  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationsService.deleteNotification(notificationId);
      // The real-time listener will update the state automatically
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Don't render for non-admin users
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors ${
          unreadCount > 0 ? 'animate-pulse' : ''
        }`}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Panel */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Notificaciones
                </h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      title="Marcar todas como leídas"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {unreadCount} notificación{unreadCount !== 1 ? 'es' : ''} sin leer
                </p>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Cargando notificaciones...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">No hay notificaciones</p>
                  <p className="text-sm text-gray-500">
                    Te notificaremos cuando haya nueva actividad
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => {
                    const priorityConfig = getPriorityIcon(notification.priority);
                    const TypeIcon = getTypeIcon(notification.type);
                    const PriorityIcon = priorityConfig.icon;

                    return (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          {/* Icon */}
                          <div className={`w-10 h-10 ${priorityConfig.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                            <TypeIcon className={`w-5 h-5 ${priorityConfig.color}`} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </p>
                              <div className="flex items-center space-x-1 ml-2">
                                {notification.priority === 'urgent' && (
                                  <PriorityIcon className="w-3 h-3 text-red-500" />
                                )}
                                <span className="text-xs text-gray-500 flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {formatTimeAgo(notification.createdAt)}
                                </span>
                              </div>
                            </div>
                            
                            <p className={`text-sm mt-1 ${!notification.isRead ? 'text-gray-800' : 'text-gray-600'}`}>
                              {notification.message}
                            </p>

                            {/* Action by */}
                            {notification.actionBy && notification.actionBy !== 'system' && (
                              <p className="text-xs text-gray-500 mt-1">
                                Por: {notification.actionBy}
                              </p>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center space-x-2">
                                {!notification.isRead && (
                                  <button
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center space-x-1"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Marcar leída</span>
                                  </button>
                                )}
                              </div>
                              
                              <button
                                onClick={() => handleDeleteNotification(notification.id)}
                                className="text-gray-400 hover:text-red-600 transition-colors"
                                title="Eliminar notificación"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <p className="text-xs text-center text-gray-500">
                  Las notificaciones se eliminan automáticamente después de 30 días
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
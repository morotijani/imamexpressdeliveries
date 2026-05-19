import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  orderId: string;
  status: string;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, token, user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const lastStatusesRef = useRef<{ [orderId: string]: string }>({});
  const isInitialLoad = useRef(true);

  // Load notifications from localStorage on startup
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`notifications_${user.id}`);
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
      
      const storedStatuses = localStorage.getItem(`order_statuses_${user.id}`);
      if (storedStatuses) {
        lastStatusesRef.current = JSON.parse(storedStatuses);
      }
    } else {
      setNotifications([]);
      lastStatusesRef.current = {};
    }
    isInitialLoad.current = true;
  }, [user]);

  // Persist notifications helper
  const saveNotifications = (items: NotificationItem[]) => {
    if (user) {
      setNotifications(items);
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(items));
    }
  };

  // Poll orders to detect status transitions
  useEffect(() => {
    if (!isAuthenticated || !token || !user || user.role !== 'CUSTOMER') return;

    const checkOrderStatusUpdates = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/orders/my-orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const orders = res.data.orders || [];

        const newStatuses: { [orderId: string]: string } = {};
        const addedNotifications: NotificationItem[] = [];

        orders.forEach((order: any) => {
          const orderId = order.id;
          const currentStatus = order.status;
          newStatuses[orderId] = currentStatus;

          const lastStatus = lastStatusesRef.current[orderId];

          // Trigger notifications on status transitions
          if (lastStatus && lastStatus !== currentStatus) {
            let title = 'Order Update';
            let message = `Your order #${orderId.substring(0, 8)} status changed to ${currentStatus}.`;

            if (currentStatus === 'ASSIGNED') {
              const riderName = order.rider?.name || 'a rider';
              title = '🏍️ Rider Assigned';
              message = `Great news! Rider ${riderName} has been assigned to your order #${orderId.substring(0, 8)}.`;
              toast.success(`Rider assigned to order #${orderId.substring(0, 8)}!`, { icon: '🏍️' });
            } else if (currentStatus === 'PICKED_UP') {
              title = '📦 Package Picked Up';
              message = `Your package for order #${orderId.substring(0, 8)} has been picked up and is on the way.`;
              toast.success(`Order #${orderId.substring(0, 8)} picked up!`, { icon: '📦' });
            } else if (currentStatus === 'DELIVERED') {
              title = '✅ Order Delivered';
              message = `Your package for order #${orderId.substring(0, 8)} has been successfully delivered!`;
              toast.success(`Order #${orderId.substring(0, 8)} delivered!`, { icon: '✅' });
            } else if (currentStatus === 'CANCELLED') {
              title = '❌ Order Cancelled';
              message = `Your order #${orderId.substring(0, 8)} has been cancelled.`;
              toast.error(`Order #${orderId.substring(0, 8)} has been cancelled.`);
            }

            addedNotifications.push({
              id: `${orderId}_${Date.now()}`,
              title,
              message,
              read: false,
              createdAt: new Date().toISOString(),
              orderId,
              status: currentStatus
            });
          }
        });

        // Update the ref & local storage
        lastStatusesRef.current = newStatuses;
        localStorage.setItem(`order_statuses_${user.id}`, JSON.stringify(newStatuses));

        // Save new notifications if any status changed
        if (addedNotifications.length > 0) {
          const updated = [...addedNotifications, ...notifications].slice(0, 50); // Keep last 50
          saveNotifications(updated);
        }

        isInitialLoad.current = false;
      } catch (err) {
        console.error('Failed to poll order status updates:', err);
      }
    };

    // First fetch immediately
    checkOrderStatusUpdates();

    // Set polling interval
    const interval = setInterval(checkOrderStatusUpdates, 8000);
    return () => clearInterval(interval);
  }, [isAuthenticated, token, user, notifications]);

  // Actions
  const markAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    saveNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
    toast.success('All notifications marked as read');
  };

  const clearNotifications = () => {
    saveNotifications([]);
    toast.success('Notification history cleared');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      clearNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

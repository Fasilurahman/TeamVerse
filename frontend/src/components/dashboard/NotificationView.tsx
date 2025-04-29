import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { RootState } from "../../redux/store";
import io from "socket.io-client";
import api from '../../api/axiosInstance'

// Connection to socket once
const socket = io(import.meta.env.VITE_BACKEND_URL);

interface DecodedToken {
  id: string;
}

// Define Notification Type
interface Notification {
  id?: string;
  _id?: string;
  userId?: string;
  title?: string;
  message: string;
  priority?: "high" | "medium" | "low";
  type: "project" | "task" | "general";
  time?: string;
  read: boolean;
  createdAt?: Date;
}

export default function NotificationView({ onClose }: { onClose: () => void }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const token = useSelector((state: RootState) => state.auth.token);
  const userId = token ? getUserIdFromToken(token) : null;

  function getUserIdFromToken(token: string): string | null {
    try {
      const decoded: DecodedToken = jwtDecode(token);
      return decoded.id;
    } catch (error) {
      console.error("Invalid token:", error);
      return null;
    }
  }

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    socket.emit("register", userId);
    
    // Listen for new notifications
    socket.on("notification", (notification: Notification) => {
      console.log("New notification received:", notification);
      if (!notification.read) {
        setNotifications(prev => [notification, ...prev]);
      }
    });

    return () => {
      socket.off("notification");
    };
  }, [userId]);

  // Fetch notifications from the backend using axios
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/notifications/${userId}`);
      setNotifications(response.data.filter((notification: Notification) => !notification.read));
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read using axios
  const markAsRead = async (id: string) => {
    try {
      const response = await api.patch(
        `/notifications/${id}/read`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.status === 200) {
        setNotifications(prev =>
          prev.map(notification =>
            (notification._id === id || notification.id === id) ? { ...notification, read: true } : notification
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read using axios
  const markAllAsRead = async () => {
    if (!userId) return;
    
    try {
      const response = await api.patch(
        `/notifications/${userId}/read-all`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.status === 200) {
        setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Function to format date
  const formatDate = (dateString?: Date | string) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Get priority based on notification type
  const getPriority = (type: string): "high" | "medium" | "low" => {
    switch (type) {
      case "project": return "high";
      case "task": return "medium";
      default: return "low";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="notification-panel w-96 max-h-[80vh] overflow-hidden rounded-2xl bg-gray-900/90 shadow-lg backdrop-blur-xl border border-gray-700"
    >
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h3 className="text-white font-semibold">Notifications</h3>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Mark all as read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-700/50 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="overflow-y-auto max-h-[60vh] custom-scrollbar">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading notifications...</div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-gray-700">
            {notifications.map((notification) => (
              <motion.div
                key={notification._id || notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 relative ${notification.read ? "bg-transparent" : "bg-indigo-500/5"} hover:bg-gray-800/50 transition duration-200`}
              >
                {!notification.read && (
                  <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-indigo-500"></span>
                )}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-white">
                      {notification.title || (notification.type === "project" ? "Project Update" : 
                                           notification.type === "task" ? "Task Update" : "Notification")}
                    </h4>
                    <p className="text-sm text-gray-300 mt-1">{notification.message}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          getPriority(notification.type) === "high"
                            ? "bg-red-500/20 text-red-400"
                            : getPriority(notification.type) === "medium"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {notification.type.toUpperCase()}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">
                          {formatDate(notification.createdAt)}
                        </span>
                        {!notification.read && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => markAsRead(notification._id || notification.id || "")}
                            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Mark as read
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400">No notifications.</div>
        )}
      </div>
    </motion.div>
  );
}
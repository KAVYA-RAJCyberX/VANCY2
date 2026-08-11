import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import api from "../../../lib/axios";
import { useNavigate } from "react-router";
import { useAuthStore } from "../../../store/useAuthStore";

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const markAsRead = async (id: string, actionUrl?: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      setOpen(false);
      if (actionUrl) {
        navigate(actionUrl);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setOpen(!open)}
        className="text-foreground hover:text-accent hidden md:flex items-center justify-center min-w-[44px] min-h-[44px] relative"
      >
        <Bell className="w-5 h-5" strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full right-0 mt-2 w-80 bg-background border border-border shadow-xl z-50 rounded-lg overflow-hidden flex flex-col max-h-[400px]"
          >
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/50">
              <h3 className="text-sm font-medium tracking-widest uppercase">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-xs text-accent hover:underline">
                  Mark all read
                </button>
              )}
            </div>
            
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No notifications yet.
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-border">
                  {notifications.map((notif) => (
                    <div 
                      key={notif._id} 
                      onClick={() => markAsRead(notif._id, notif.actionUrl)}
                      className={`p-4 transition-colors cursor-pointer hover:bg-muted ${notif.isRead ? 'opacity-60' : 'bg-accent/5'}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-semibold uppercase tracking-wider">{notif.title}</span>
                        {!notif.isRead && <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1"></span>}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {notif.message}
                      </p>
                      <div className="text-[10px] text-muted-foreground/60 mt-2">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

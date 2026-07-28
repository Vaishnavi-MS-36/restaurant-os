import { useEffect, useState, useRef } from 'react';
import { Bell } from 'lucide-react';
import client from '../api/client';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const load = () => { client.get('/notifications/').then(res => setNotifications(res.data)); };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markRead = async (id) => {
    await client.put(`/notifications/${id}/read`);
    load();
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative text-cream/70 hover:text-cream transition-colors">
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-terracotta-500 text-charcoal-950 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-charcoal-900 border border-charcoal-700 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="px-4 py-3 border-b border-charcoal-700">
            <span className="text-cream font-medium text-sm">Notifications</span>
          </div>
          {notifications.length === 0 && (
            <div className="px-4 py-6 text-center text-cream/40 text-sm">No notifications</div>
          )}
          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => !n.is_read && markRead(n.id)}
              className={`px-4 py-3 border-b border-charcoal-800 last:border-0 cursor-pointer transition-colors ${n.is_read ? 'opacity-50' : 'hover:bg-charcoal-800'}`}
            >
              <p className="text-cream text-sm">{n.message}</p>
              <p className="text-cream/40 text-xs mt-1">{new Date(n.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Trash2, 
  CheckSquare, 
  Square,
  Clock,
  ShieldAlert,
  User as UserIcon,
  MessageSquare
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import GlobalLogo from "../common/GlobalLogo";
import "./NotificationCenter.css";

export default function NotificationCenter({ userId, role }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchNotifications();
    
    // 🔥 Listen for real-time notifications (Assuming socket is globally available or via custom event)
    const handleNewNotification = (event) => {
      const newNotif = event.detail;
      setNotifications(prev => [newNotif, ...prev]);
    };

    window.addEventListener("new_notification", handleNewNotification);
    return () => window.removeEventListener("new_notification", handleNewNotification);
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`http://localhost:3000/notifications/${userId}`);
      const data = await res.json();
      if (data.ok) setNotifications(data.notifications);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map(n => n.notification_id));
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Delete ${selectedIds.length} selected notifications?`)) return;

    try {
      const res = await fetch("http://localhost:3000/notifications/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => !selectedIds.includes(n.notification_id)));
        setSelectedIds([]);
      }
    } catch (err) {
      console.error("Bulk delete failed:", err);
    }
  };

  const handleBulkRead = async () => {
    if (!selectedIds.length) return;
    try {
      const res = await fetch("http://localhost:3000/notifications/bulk-read", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => 
          selectedIds.includes(n.notification_id) ? { ...n, is_read: true } : n
        ));
        setSelectedIds([]);
      }
    } catch (err) {
      console.error("Bulk read failed:", err);
    }
  };

  const getIcon = (category) => {
    switch (category) {
      case 'success': return <CheckCircle size={20} />;
      case 'warning': return <AlertCircle size={20} />;
      case 'error': return <ShieldAlert size={20} />;
      default: return <Info size={20} />;
    }
  };

  if (loading) return <div className="loading">Loading notifications...</div>;

  return (
    <div className="notif-container">
      <header className="notif-header">
        <div className="notif-header-left">
          <GlobalLogo className="notif-logo" />
          <h2 className="notif-title">
            <Bell size={24} color="#E11B22" />
            Inbox
            <span style={{ fontSize: '0.9rem', fontWeight: 400, opacity: 0.6, marginLeft: '10px' }}>
              ({notifications.filter(n => !n.is_read).length} Unread)
            </span>
          </h2>
        </div>

        <div className="notif-actions">
          <button className="bulk-btn btn-read" onClick={toggleSelectAll}>
            {selectedIds.length === notifications.length ? <CheckSquare size={18} /> : <Square size={18} />}
            {selectedIds.length === notifications.length ? 'Deselect All' : 'Select All'}
          </button>
          
          {selectedIds.length > 0 && (
            <>
              <button className="bulk-btn btn-read" onClick={handleBulkRead}>
                <CheckCircle size={18} /> Mark Read
              </button>
              <button className="bulk-btn btn-delete" onClick={handleBulkDelete}>
                <Trash2 size={18} /> Delete
              </button>
            </>
          )}
        </div>
      </header>

      <div className="notif-list">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>Your inbox is clear! No notifications found.</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div 
              key={notif.notification_id} 
              className={`notif-item ${!notif.is_read ? 'unread' : ''} cat-${notif.category || 'info'}`}
            >
              <input 
                type="checkbox" 
                className="notif-checkbox" 
                checked={selectedIds.includes(notif.notification_id)}
                onChange={() => toggleSelect(notif.notification_id)}
              />
              
              <div className={`notif-icon-wrap icon-${notif.category || 'info'}`}>
                {getIcon(notif.category)}
              </div>

              <div className="notif-inner">
                <div className="notif-row">
                  <div className="notif-subject-row">
                    <span className="notif-subject">{notif.subject || 'System Notification'}</span>
                    {notif.priority === 'urgent' && (
                      <span className="priority-tag tag-urgent">
                        High Priority
                      </span>
                    )}
                  </div>
                  <span className="notif-time">
                    <Clock size={12} style={{ marginRight: 4 }} />
                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                  </span>
                </div>
                
                {notif.sender_name && (
                  <div className="notif-sender-info">
                    <UserIcon size={12} />
                    <span>From: <strong>{notif.sender_name}</strong> ({notif.sender_role})</span>
                  </div>
                )}

                <p className="notif-msg">{notif.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

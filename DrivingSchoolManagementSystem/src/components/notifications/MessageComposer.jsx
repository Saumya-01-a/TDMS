import { useState, useEffect } from "react";
import { Send, User, Users, Search, AlertTriangle, ShieldCheck, Info, Loader2 } from "lucide-react";
import "./MessageComposer.css";

export default function MessageComposer({ adminId, onMessageSent }) {
  const [recipientRole, setRecipientRole] = useState("Individual");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("info");
  const [priority, setPriority] = useState("normal");
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (searchQuery.length > 2) {
      const delayDebounceFn = setTimeout(() => {
        searchUsers();
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchUsers = async () => {
    try {
      // 🌐 Standardized to 127.0.0.1
      const res = await fetch(`http://127.0.0.1:3000/notifications/search?query=${searchQuery}`);
      const data = await res.json();
      if (data.ok) setSearchResults(data.users);
    } catch (err) {
      console.error("Search failure:", err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (recipientRole === "Individual" && !selectedUser) return alert("System Notice: Please select a valid recipient.");
    if (!subject || !message) return alert("System Notice: Subject and Message body are required.");

    setLoading(true);
    setStatus("Dispatching message...");

    try {
      // 🌐 Standardized to 127.0.0.1
      const res = await fetch("http://127.0.0.1:3000/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: selectedUser?.user_id,
          recipientRole,
          subject,
          message,
          category,
          priority,
          senderId: adminId
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setStatus("✅ Message dispatched successfully!");
        setSubject("");
        setMessage("");
        setSelectedUser(null);
        setSearchQuery("");
        if (onMessageSent) onMessageSent();
        
        // Auto-clear status after 3 seconds
        setTimeout(() => setStatus(""), 3000);
      } else {
        setStatus("❌ Dispatch Failed: " + data.message);
      }
    } catch (err) {
      setStatus("❌ Network Error: Unable to reach administrative server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="composer-card" id="id_message_composer">
      <div className="composer-header">
        <Send size={20} color="#E11B22" />
        Message Dispatcher
      </div>

      <form className="composer-form" onSubmit={handleSend}>
        <div className="composer-row">
          <div className="composer-field half">
            <label>Recipient Target</label>
            <select id="select_recipient_type" value={recipientRole} onChange={(e) => { setRecipientRole(e.target.value); setSelectedUser(null); }}>
              <option value="Individual">Individual Staff/Student</option>
              <option value="All Students">Broadcast to All Students</option>
              <option value="All Instructors">Broadcast to All Instructors</option>
            </select>
          </div>

          <div className="composer-field half">
            <label>Communication Alert Level</label>
            <div className="cat-chips">
              <button 
                id="btn_cat_info"
                type="button" 
                className={`cat-chip info ${category === 'info' ? 'active' : ''}`}
                onClick={() => setCategory('info')}
              ><Info size={14} /> Info</button>
              <button 
                id="btn_cat_success"
                type="button" 
                className={`cat-chip success ${category === 'success' ? 'active' : ''}`}
                onClick={() => setCategory('success')}
              ><ShieldCheck size={14} /> Confirmation</button>
              <button 
                id="btn_cat_warning"
                type="button" 
                className={`cat-chip warning ${category === 'warning' ? 'active' : ''}`}
                onClick={() => setCategory('warning')}
              ><AlertTriangle size={14} /> Urgent</button>
            </div>
          </div>
        </div>

        {recipientRole === "Individual" && (
          <div className="composer-field relative">
            <label>Reciever Lookup (Name/ID)</label>
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input 
                id="input_user_search"
                type="text" 
                placeholder="Lookup administrative IDs..." 
                value={selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name} (${selectedUser.user_id})` : searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={!!selectedUser}
              />
              {selectedUser && (
                <button type="button" className="clear-user" onClick={() => setSelectedUser(null)}>×</button>
              )}
            </div>

            {searchResults.length > 0 && !selectedUser && (
              <ul className="search-dropdown">
                {searchResults.map(user => (
                  <li key={user.user_id} onClick={() => setSelectedUser(user)}>
                    <div className="user-info">
                      <span className="user-name">{user.first_name} {user.last_name}</span>
                      <span className="user-id">{user.user_id} • {user.role}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="composer-field">
          <label>Subject Header</label>
          <input 
            id="input_msg_subject"
            type="text" 
            placeholder="System Update / Action Required..." 
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required 
          />
        </div>

        <div className="composer-field">
          <label>Official Correspondence</label>
          <textarea 
            id="input_msg_body"
            rows="5" 
            placeholder="Type your administrative message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          ></textarea>
        </div>

        <div className="composer-footer">
          <div className="priority-check">
            <input 
              id="check_high_priority"
              type="checkbox" 
              checked={priority === 'urgent'} 
              onChange={(e) => setPriority(e.target.checked ? 'urgent' : 'normal')}
            />
            <span>Pulse Alert (High Priority)</span>
          </div>

          <button className="send-btn" id="btn_send_notification" type="submit" disabled={loading}>
            {loading ? <Loader2 className="spin" size={18} /> : <Send size={18} />} 
            <span>{loading ? 'Dispatching...' : 'Dispatch Message'}</span>
          </button>
        </div>

        {status && <div className={`composer-status ${status.includes('✅') ? 'success' : 'error'}`}>{status}</div>}
      </form>
    </div>
  );
}

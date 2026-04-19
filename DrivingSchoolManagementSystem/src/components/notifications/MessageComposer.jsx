import { useState, useEffect } from "react";
import { Send, User, Users, Search, AlertTriangle, ShieldCheck, Info } from "lucide-react";
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
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchUsers = async () => {
    try {
      const res = await fetch(`http://localhost:3000/notifications/search?query=${searchQuery}`);
      const data = await res.json();
      if (data.ok) setSearchResults(data.users);
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (recipientRole === "Individual" && !selectedUser) return alert("Select a recipient");
    if (!subject || !message) return alert("Fill in subject and message");

    setLoading(true);
    setStatus("Sending...");

    try {
      const res = await fetch("http://localhost:3000/notifications/send", {
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
        setStatus("✅ Message sent successfully!");
        setSubject("");
        setMessage("");
        setSelectedUser(null);
        setSearchQuery("");
        if (onMessageSent) onMessageSent();
      } else {
        setStatus("❌ Failed: " + data.message);
      }
    } catch (err) {
      setStatus("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="composer-card">
      <div className="composer-header">
        <Send size={20} color="#E11B22" />
        New Message
      </div>

      <form className="composer-form" onSubmit={handleSend}>
        <div className="composer-row">
          <div className="composer-field half">
            <label>Recipient Type</label>
            <select value={recipientRole} onChange={(e) => { setRecipientRole(e.target.value); setSelectedUser(null); }}>
              <option value="Individual">Specific User</option>
              <option value="All Students">All Students</option>
              <option value="All Instructors">All Instructors</option>
            </select>
          </div>

          <div className="composer-field half">
            <label>Category</label>
            <div className="cat-chips">
              <button 
                type="button" 
                className={`cat-chip info ${category === 'info' ? 'active' : ''}`}
                onClick={() => setCategory('info')}
              ><Info size={14} /> Info</button>
              <button 
                type="button" 
                className={`cat-chip success ${category === 'success' ? 'active' : ''}`}
                onClick={() => setCategory('success')}
              ><ShieldCheck size={14} /> Success</button>
              <button 
                type="button" 
                className={`cat-chip warning ${category === 'warning' ? 'active' : ''}`}
                onClick={() => setCategory('warning')}
              ><AlertTriangle size={14} /> Urgent</button>
            </div>
          </div>
        </div>

        {recipientRole === "Individual" && (
          <div className="composer-field relative">
            <label>Search User (Name or ID)</label>
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Type 3+ characters..." 
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
          <label>Subject</label>
          <input 
            type="text" 
            placeholder="Action required / New system update..." 
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required 
          />
        </div>

        <div className="composer-field">
          <label>Message Body</label>
          <textarea 
            rows="5" 
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          ></textarea>
        </div>

        <div className="composer-footer">
          <div className="priority-check">
            <input 
              type="checkbox" 
              checked={priority === 'urgent'} 
              onChange={(e) => setPriority(e.target.checked ? 'urgent' : 'normal')}
            />
            <span>Mark as High Priority (Pulse Alert)</span>
          </div>

          <button className="send-btn" type="submit" disabled={loading}>
            <Send size={18} /> {loading ? 'Sending...' : 'Send Message'}
          </button>
        </div>

        {status && <div className={`composer-status ${status.includes('✅') ? 'success' : 'error'}`}>{status}</div>}
      </form>
    </div>
  );
}

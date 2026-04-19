import { useState } from "react";
import { MessageCircle, Send, X, AlertCircle } from "lucide-react";
import "./ContactAdmin.css";

export default function ContactAdmin({ senderId, senderRole, isOpen, onClose }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleSend = async (e) => {
    e.preventDefault();
    if (!subject || !message) return alert("Please fill in both subject and message.");

    setLoading(true);
    setStatus("Sending...");

    try {
      const res = await fetch("http://localhost:3000/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: 'U1769516002730', // Unified Admin ID (usually found from DB or role Admin)
          senderId,
          subject,
          message,
          category: 'info',
          priority: 'normal'
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setStatus("✅ Message sent to Admin!");
        setTimeout(() => {
          onClose();
          setSubject("");
          setMessage("");
          setStatus("");
        }, 1500);
      } else {
        setStatus("❌ Failed: " + data.message);
      }
    } catch (err) {
      setStatus("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="contact-modal-overlay" onClick={onClose}>
      <div className="contact-modal" onClick={e => e.stopPropagation()}>
        <header className="contact-modal-header">
          <div className="header-left">
            <MessageCircle size={20} color="#E11B22" />
            <span>Contact Admin</span>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </header>

        <form className="contact-form" onSubmit={handleSend}>
          <div className="form-group">
            <label>Subject</label>
            <input 
              type="text" 
              placeholder="e.g., Payment Inquiry / Question about Lesson" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Message</label>
            <textarea 
              rows="5" 
              placeholder="Describe your issue or question clearly..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="modal-footer">
            <div className="info-note">
              <AlertCircle size={14} />
              <span>Admin response will appear in your Inbox.</span>
            </div>
            <button className="send-action-btn" type="submit" disabled={loading}>
              <Send size={18} /> {loading ? 'Sending...' : 'Send Message'}
            </button>
          </div>
          
          {status && <div className={`status-msg ${status.includes('✅') ? 'success' : 'error'}`}>{status}</div>}
        </form>
      </div>
    </div>
  );
}

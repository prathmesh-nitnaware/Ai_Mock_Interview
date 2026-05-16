import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, Loader2 } from "lucide-react";
import { api } from "../services/api";
import "./Chatbot.css";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi there! I am your PrepAI Support Assistant. Ask me anything about how to use Mock Interviews, Resume Scanning, or the Coding Dojo!", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { text: userText, isBot: false }]);
    setInput("");
    setLoading(true);

    try {
      const response = await api.client.post("/api/chatbot/ask", { message: userText });
      setMessages((prev) => [...prev, { text: response.data.reply, isBot: true }]);
    } catch (err) {
      setMessages((prev) => [...prev, { text: "I'm having trouble connecting to the server. Please try again later.", isBot: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-wrapper">
      {/* Chat Bubble Toggle */}
      <button className={`chat-fab ${isOpen ? "hide" : ""}`} onClick={toggleChat}>
        <MessageSquare size={24} />
      </button>

      {/* Chat Window */}
      <div className={`chat-window glass-card ${isOpen ? "open" : ""}`}>
        <div className="chat-header">
          <div className="chat-title">
            <Bot size={20} className="text-indigo" />
            <span>PrepAI Assistant</span>
          </div>
          <button className="chat-close" onClick={toggleChat}>
            <X size={18} />
          </button>
        </div>

        <div className="chat-body">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-bubble-container ${msg.isBot ? "bot" : "user"}`}>
              {msg.isBot && <div className="bot-avatar"><Bot size={14} /></div>}
              <div className={`chat-bubble ${msg.isBot ? "bot-bubble" : "user-bubble"}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="chat-bubble-container bot">
              <div className="bot-avatar"><Bot size={14} /></div>
              <div className="chat-bubble bot-bubble loading-dots">
                <Loader2 size={16} className="spin" /> Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-footer" onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={!input.trim() || loading} className="chat-send">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;

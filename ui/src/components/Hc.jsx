


import React, { useEffect, useState, useRef } from "react";
import "../css/Home.css";
import axios from "axios";
import { io } from "socket.io-client";
import AddFrdPop from "./AddFrdPop";
import { useNavigate } from "react-router-dom";
const bkuri = import.meta.env.VITE_BACK;

const Hc = () => {
  const nav = useNavigate()
  const [currentUser, setCurrentUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const socket = useRef();
  const messagesEndRef = useRef();
  


 
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    if (u && u._id) {
      console.log("Current user:", u._id);
      setCurrentUser(u._id);
    }
  }, []);

  
  useEffect(() => {
    const fetchContacts = async () => {
      if (!currentUser) return;
      try {
        console.log("Fetching contacts for user:", currentUser);
        const { data } = await axios.get(`${bkuri}/api/users/getfrd/${currentUser}`);
        setContacts(data);
        console.log("Contacts loaded:", data.length);
      } catch (err) {
        console.error("Error fetching contacts:", err);
      }
    };
    fetchContacts();
  }, [currentUser]);

  
  useEffect(() => {
    if (currentUser) {
      console.log("Initializing socket for user:", currentUser);
      socket.current = io(bkuri, {
        transports: ['websocket', 'polling']
      });

      socket.current.emit("add-user", currentUser);

      
      socket.current.on("connect", () => {
        console.log("✅ Connected to server with ID:", socket.current.id);
      });

      socket.current.on("disconnect", () => {
        console.log("❌ Disconnected from server");
      });

     
      socket.current.on("msg-receive", (data) => {
  console.log("Received message via socket:", data);
  
  
  if (data.from !== currentUser) {
    setMessages((prev) => [...prev, {
      fromSelf: false,
      message: data.message
    }]);
  }
});

      return () => {
        if (socket.current) {
          socket.current.disconnect();
        }
      };
    }
  }, [currentUser]);

  
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentChat || !currentUser) return;
      try {
        console.log("Fetching messages for chat with:", currentChat._id);
        const { data } = await axios.post(`${bkuri}/api/mes/getmsg`, {
          from: currentUser,
          to: currentChat._id,
        });
        setMessages(data);
        console.log("Messages loaded:", data.length);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
    fetchMessages();
  }, [currentChat, currentUser]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChat || !socket.current) {
      console.log("Cannot send: missing requirements");
      return;
    }

    console.log("Sending message:", newMessage);

    try {
      
      const tempMessage = { fromSelf: true, message: newMessage };
      setMessages((prev) => [...prev, tempMessage]);
      
      
      await axios.post(`${bkuri}/api/mes/addmsg`, {
        from: currentUser,
        to: currentChat._id,
        message: newMessage,
      });

      
      socket.current.emit("send-msg", {
        from: currentUser,
        to: currentChat._id,
        message: newMessage,
      });

      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      
      setMessages((prev) => prev.filter(msg => msg !== tempMessage));
    }
  };

const [add,setadd] = useState(false)
const popClick = (e)=>{
  e.preventDefault()
  setadd(!add)
}

const handlelogoutclick = ()=>{
  if (socket.current) {
      socket.current.disconnect();
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    nav("/login");
}

  return (
    <div className="mainboxh">
      <div className="Hcbox1">
      <div className="contactbox">
        {contacts.map((u, i) => (
          <button
            key={i}
            className={`contact-btn ${currentChat?._id === u._id ? "active" : ""}`}
            onClick={() => setCurrentChat(u)}
          >
            {u.name}
          </button>
        ))}
        <button className="addfrd" onClick={popClick}>ADD U R FRD</button>
      </div>
          
      <div className="chatbox">
        {currentChat ? (
          <div className="chat-container">
            <h3 className="chat-header">Chat with {currentChat.name}</h3>
            <div className="messages-box">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`msg ${m.fromSelf ? "msg-sent" : "msg-recv"}`}
                >
                  {m.message}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="send-box">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit">Send</button>
            </form>
          </div>
        ) : (
          <p className="select-contact">Select a contact to start chat</p>
        )}
      </div>
      <button className="logoutting" onClick={handlelogoutclick}>logout</button>
    </div>
    {add ? <AddFrdPop setadd={setadd}/> : null}
    
    </div>
  );
};

export default Hc;
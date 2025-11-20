import React, { useState } from 'react';
import "../css/Lc.css";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import Al from './Al';
import Notpop from './Notpop'
const bkuri = import.meta.env.VITE_BACK;

const Lc = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); 
const[notpop,setNotpop] = useState(false)
  const handleSendClick = async (e) => {
    e.preventDefault();

    if(email && password){
        setLoading(true);

    try {
      const res = await axios.post(`${bkuri}/api/users/login`, { email, password });
      console.log(res.data);

      if (res.data.status === "t") {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.FoundUser));
        navigate("/");
      } else {
        alert(res.data.mess);
      }
    } catch (err) {
      console.log(err);
      alert("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
    }setNotpop(true)
    
  };

  return (
    <div>
      {loading ? (
        <Al />  
      ) : (
        <div className="lcbox1">
          <div className="namebox">LOGIN</div>
          <div className="lcbox2">
            <input
              type="email"
              className="Lci"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              className="Lci"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="sendbox" onClick={handleSendClick}>
            Log In
          </button>
          <p style={{ margin: "10px 0" }}>Or</p>
          <button className="registerbox" onClick={() => navigate("/register")}>
            Create an Account
          </button>{notpop ? <Notpop setNotpop={setNotpop} /> : null }
        </div>
      )}
    </div>
  );
};

export default Lc;

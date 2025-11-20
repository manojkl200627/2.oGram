import React, { useEffect, useState } from 'react';
import Hc from '../components/Hc';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      navigate("/login");
    } else {
      setShouldRender(true);
    }
  }, [navigate]);

 
  if (!shouldRender) {
    return null;
  }

  return <Hc/>;
};

export default Home;
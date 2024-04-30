import React from 'react';
import './logbook.css';
import { FaArrowLeft } from 'react-icons/fa';


const Logbook = () => {
  
  const handleBackToLastPage = () => {
    window.history.back();
  };

  return (
    <div className="logbook-container">
      <h1>Logboek</h1>
      
      <div className="back-button-container">
        <button className="back-button" onClick={handleBackToLastPage}><FaArrowLeft /></button>
      </div>
    </div>
  );
}

export default Logbook;
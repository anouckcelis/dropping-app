import React from 'react';
import { Link } from 'react-router-dom';
import { MdHome, MdPlace, MdPhoneAndroid, MdPerson } from 'react-icons/md'; // Importeer het locatie-, telefoon- en persoonpictogram uit react-icons
import '../../navigatie/navigatiePlayer/navigatiePlayer.css';

const NavigatiePlayer = () => {
  return (
    <div className="navigation-bar">
      <Link to="/participateGame" className="nav-link">
        <div className="icon-container">
          <MdHome size={24} color="#257eca" />
        </div>
        <span>Home</span>
      </Link>
      <Link to="/mapPlayer" className="nav-link">
        <div className="icon-container">
          <MdPlace size={24} color="#257eca" />
        </div>
        <span>Kaart</span>
      </Link>
      <Link to="/qrscannerPlayer" className="nav-link">
        <div className="icon-container">
          <MdPhoneAndroid size={24} color="#257eca" />
        </div>
        <span>QR-Scanner</span>
      </Link>
      <Link to="/account" className="nav-link">
        <div className="icon-container">
          <MdPerson size={24} color="#257eca" /> 
        </div>
        <span>Account</span>
      </Link>
    </div>
  );
};

export default NavigatiePlayer;
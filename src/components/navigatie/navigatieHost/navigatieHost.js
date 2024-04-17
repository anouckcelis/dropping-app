import React from 'react';
import { Link } from 'react-router-dom';
import { MdHome, MdPlace, MdPhoneAndroid, MdPerson, MdFlag } from 'react-icons/md'; // Importeer het locatie-, telefoon- en persoonpictogram uit react-icons
import '../../navigatie/navigatieHost/navigatieHost.css';

const NavigatieHost = ({gameId}) => {
  return (
    <div className="navigation-bar">
      <Link to={`/newGame/${gameId}`}  className="nav-link">
        <div className="icon-container">
          <MdHome size={24} color="#257eca" />
        </div>
        <span>Home</span>
      </Link>
      <Link to="/map" className="nav-link">
        <div className="icon-container">
          <MdPlace size={24} color="#257eca" />
        </div>
        <span>Kaart</span>
      </Link>
      <Link to="/checkpoints" className="nav-link">
        <div className="icon-container">
          <MdFlag size={24} color="#257eca" /> 
        </div>
        <span>Checkpoints</span>
      </Link>
      <Link to="/qrscanner" className="nav-link">
        <div className="icon-container">
          <MdPhoneAndroid size={24} color="#257eca" />
        </div>
        <span>Scanner</span>
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

export default NavigatieHost;

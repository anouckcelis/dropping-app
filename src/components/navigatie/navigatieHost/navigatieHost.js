// Importeer React en de Link component uit react-router-dom voor navigatie
import React from 'react';
import { Link } from 'react-router-dom';

// Importeer de nodige iconen uit react-icons voor het weergeven van pictogrammen
import { MdHome, MdPlace, MdPhoneAndroid, MdPerson, MdFlag } from 'react-icons/md';

// Importeer de CSS-bestand voor stijlen
import '../../navigatie/navigatieHost/navigatieHost.css';

// Definieer de NavigatieHost component met een gameId prop
const NavigatieHost = ({ gameId }) => {
  // Render de navigatiebalk met links naar verschillende delen van de applicatie
  return (
    <div className="navigation-bar">
      {/* Link naar de nieuwe game pagina */}
      <Link to={`/newGame/${gameId}`} className="nav-link">
        <div className="icon-container">
          <MdHome size={24} color="#257eca" />
        </div>
        <span>Home</span>
      </Link>
      {/* Link naar de kaartpagina */}
      <Link to={`/mapHost/${gameId}`} className="nav-link">
        <div className="icon-container">
          <MdPlace size={24} color="#257eca" />
        </div>
        <span>Kaart</span>
      </Link>
      {/* Link naar de checkpoints pagina */}
      <Link to={`/checkpoints/${gameId}`} className="nav-link">
        <div className="icon-container">
          <MdFlag size={24} color="#257eca" /> 
        </div>
        <span>Checkpoints</span>
      </Link>
      {/* Link naar de QR-scanner pagina */}
      <Link to={`/qrscannerHost/${gameId}`} className="nav-link">
        <div className="icon-container">
          <MdPhoneAndroid size={24} color="#257eca" />
        </div>
        <span>Scanner</span>
      </Link>
      {/* Link naar de accountpagina */}
      <Link to={`/accountHost/${gameId}`} className="nav-link">
        <div className="icon-container">
          <MdPerson size={24} color="#257eca" /> 
        </div>
        <span>Account</span>
      </Link>
    </div>
  );
};

// Exporteer de component zodat deze kan worden gebruikt in andere bestanden
export default NavigatieHost;

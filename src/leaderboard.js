// Importeer React en de useState en useEffect hooks voor het beheren van component state en effecten
import React, { useState, useEffect } from 'react';

// Importeer de CSS-bestand voor stijlen
import './leaderboard.css';

// Importeer de FaArrowLeft icon uit react-icons voor de back-to-last-page knop
import { FaArrowLeft } from 'react-icons/fa';

// Importeer de statische gegevens uit een JSON-bestand
import data from './data.json'; // Importeer de statische gegevens

// Definieer de Leaderboard component
const Leaderboard = () => {
  // Gebruik useState om de leaderboardData te beheren
  const [leaderboardData, setLeaderboardData] = useState([]);

  // Gebruik useEffect om een effect te definiëren dat wordt uitgevoerd bij het mounten van de component
  useEffect(() => {
    // Sorteer de spelers op basis van hun prestaties (bijvoorbeeld scores)
    const sortedData = [...data].sort((a, b) => b.score - a.score);
    // Set de gesorteerde data in de state
    setLeaderboardData(sortedData);
  }, []); // Het effect wordt alleen uitgevoerd bij het laden van de component

  // Definieer de handleBackToLastPage functie die wordt aangeroepen om terug te gaan naar de vorige pagina
  const handleBackToLastPage = () => {
    window.history.back();
  };

  // Render de component
  return (
    <div className="leaderboard-container">
      <h1>Ranking</h1>
      <ul className="item-wrapper">
        {leaderboardData.map((row, index) => (
          <li className="item" key={row.userID}>
            <span className="item__position">{index + 1}</span>
            <span className="item__name">{row.displayEmail}</span>
          </li>
        ))}
      </ul>
      <div className="back-button-container">
        <button className="back-button" onClick={handleBackToLastPage}><FaArrowLeft /></button>
      </div>
    </div>
  );
}

// Exporteer de component zodat deze kan worden gebruikt in andere bestanden
export default Leaderboard;
